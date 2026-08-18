"""SIGINEX 2.0 · POST /api/diagnosticos/{id}/calcular
Calcula el diagnóstico y persiste organización, respuestas y resultados en PostgreSQL.
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys
import traceback

# Import orchestrator y db
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
import _orchestrator as orch  # noqa: E402
import _db as db  # noqa: E402

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '_data')

API_KEYS = {k.strip() for k in os.environ.get('SIGINEX_API_KEYS', 'demo-key').split(',') if k.strip()}


def _load_json(name):
    with open(os.path.join(DATA_DIR, name), encoding='utf-8') as f:
        return json.load(f)


KB = _load_json('kb.json')
KB_FOR_ORCH = {'modulos': KB['modulos']}


def _persist(tenant_id, diagnostico_id, company, answers, result):
    """Persiste organización, diagnóstico y respuestas en PostgreSQL."""
    # 1. Upsert organización
    org_nombre = company.get('nombre', 'Sin nombre')
    org_row = db.execute(
        """
        INSERT INTO organizaciones (tenant_id, nombre, sector, tamano, aplicabilidad)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (tenant_id, nombre)
        DO UPDATE SET
            sector = EXCLUDED.sector,
            tamano = EXCLUDED.tamano,
            aplicabilidad = EXCLUDED.aplicabilidad,
            updated_at = now()
        RETURNING id
        """,
        (
            tenant_id,
            org_nombre,
            company.get('sector'),
            company.get('tamano'),
            db.to_jsonb(company.get('aplicabilidad', {})),
        ),
        fetchone=True
    )
    org_id = org_row['id']

    # 2. Insertar diagnóstico
    resultado_obj = result.get('resultado', {})
    diag_row = db.execute(
        """
        INSERT INTO diagnosticos (
            external_id, tenant_id, organizacion_id, kb_version,
            score_sgi, nivel_sgi, resultado, brechas,
            plan_mejora, plan_aprendizaje, benchmark, alertas, meta
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (tenant_id, external_id)
        DO UPDATE SET
            score_sgi = EXCLUDED.score_sgi,
            nivel_sgi = EXCLUDED.nivel_sgi,
            resultado = EXCLUDED.resultado,
            brechas = EXCLUDED.brechas,
            plan_mejora = EXCLUDED.plan_mejora,
            plan_aprendizaje = EXCLUDED.plan_aprendizaje,
            benchmark = EXCLUDED.benchmark,
            alertas = EXCLUDED.alertas,
            meta = EXCLUDED.meta,
            created_at = now()
        RETURNING id
        """,
        (
            diagnostico_id,
            tenant_id,
            str(org_id),
            result.get('kb_version'),
            resultado_obj.get('score_sgi'),
            db.to_jsonb(resultado_obj.get('nivel_sgi')),
            db.to_jsonb(resultado_obj),
            db.to_jsonb(result.get('brechas', [])),
            db.to_jsonb(result.get('plan_mejora', [])),
            db.to_jsonb(result.get('plan_aprendizaje', [])),
            db.to_jsonb(result.get('benchmark')),
            db.to_jsonb(result.get('alertas', [])),
            db.to_jsonb(result.get('meta', {})),
        ),
        fetchone=True
    )
    diag_id = diag_row['id']

    # 3. Insertar respuestas (batch)
    if answers:
        # Determinar módulo de cada pregunta para referencia
        pregunta_modulo = {}
        for m in KB_FOR_ORCH['modulos']:
            for q in m['preguntas']:
                pregunta_modulo[q['id']] = m['id']

        # Borrar respuestas previas si es upsert de diagnóstico
        db.execute(
            "DELETE FROM respuestas WHERE diagnostico_id = %s",
            (str(diag_id),)
        )

        # Insertar en batch
        values_parts = []
        params = []
        for pregunta_id, valor in answers.items():
            values_parts.append("(%s, %s, %s, %s)")
            params.extend([
                str(diag_id),
                pregunta_id,
                pregunta_modulo.get(pregunta_id),
                str(valor)
            ])

        if values_parts:
            query = (
                "INSERT INTO respuestas (diagnostico_id, pregunta_id, modulo_id, valor) VALUES "
                + ", ".join(values_parts)
            )
            db.execute(query, params)

    return str(diag_id)


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers',
                         'Content-Type, X-Api-Key, X-Tenant-Id, Idempotency-Key')
        self.end_headers()

    def do_POST(self):
        api_key = self.headers.get('X-Api-Key', '')
        tenant_id = self.headers.get('X-Tenant-Id', '')

        if api_key not in API_KEYS:
            self._error(401, 'API key inválida')
            return

        if not tenant_id:
            self._error(400, 'Falta X-Tenant-Id')
            return

        content_length = int(self.headers.get('Content-Length', 0))
        raw_body = self.rfile.read(content_length)
        try:
            body = json.loads(raw_body)
        except (json.JSONDecodeError, ValueError):
            self._error(422, 'JSON inválido')
            return

        company = body.get('company', {})
        answers = body.get('answers', {})

        if not isinstance(answers, dict):
            self._error(422, 'answers debe ser un objeto pregunta_id->valor')
            return

        # Normalize values
        norm = {}
        for k, v in answers.items():
            norm[k] = int(v) if str(v) in ('0', '1', '2') else v

        # Extract diagnostico_id from path
        path_parts = self.path.rstrip('/').split('/')
        diagnostico_id = 'unknown'
        for i, part in enumerate(path_parts):
            if part == 'diagnosticos' and i + 1 < len(path_parts):
                diagnostico_id = path_parts[i + 1]
                break

        # Run orchestrator
        result = orch.run(KB_FOR_ORCH, company, norm)
        result['diagnostico_id'] = diagnostico_id
        result['tenant_id'] = tenant_id

        # Persistir en la base de datos
        try:
            db_diag_id = _persist(tenant_id, diagnostico_id, company, norm, result)
            result['db_id'] = db_diag_id
            result['persisted'] = True
        except Exception as e:
            # Si falla la persistencia, devolvemos el resultado igual pero indicamos el error
            result['persisted'] = False
            result['persist_error'] = str(e)
            # Log para debugging en Vercel
            print(f"[SIGINEX] Error persistiendo diagnóstico: {e}")
            traceback.print_exc()

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(result, ensure_ascii=False, default=str).encode())

    def _error(self, code, msg):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error': msg}).encode())
