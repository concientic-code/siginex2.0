"""SIGINEX 2.0 · GET /api/diagnosticos/{id}
Recupera un diagnóstico guardado por su external_id.
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
import _db as db  # noqa: E402

API_KEYS = {k.strip() for k in os.environ.get('SIGINEX_API_KEYS', 'demo-key').split(',') if k.strip()}


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers',
                         'Content-Type, X-Api-Key, X-Tenant-Id')
        self.end_headers()

    def do_GET(self):
        api_key = self.headers.get('X-Api-Key', '')
        tenant_id = self.headers.get('X-Tenant-Id', '')

        if api_key not in API_KEYS:
            self._error(401, 'API key inválida')
            return

        if not tenant_id:
            self._error(400, 'Falta X-Tenant-Id')
            return

        # Extraer diagnostico_id del path
        path_parts = self.path.rstrip('/').split('/')
        diagnostico_id = None
        for i, part in enumerate(path_parts):
            if part == 'diagnosticos' and i + 1 < len(path_parts):
                diagnostico_id = path_parts[i + 1]
                break

        if not diagnostico_id:
            self._error(400, 'Falta ID del diagnóstico')
            return

        try:
            # Buscar diagnóstico por external_id y tenant
            row = db.execute(
                """
                SELECT
                    d.id,
                    d.external_id,
                    d.tenant_id,
                    d.kb_version,
                    d.score_sgi,
                    d.nivel_sgi,
                    d.resultado,
                    d.brechas,
                    d.plan_mejora,
                    d.plan_aprendizaje,
                    d.benchmark,
                    d.alertas,
                    d.meta,
                    d.created_at,
                    o.nombre AS org_nombre,
                    o.sector AS org_sector,
                    o.tamano AS org_tamano,
                    o.aplicabilidad AS org_aplicabilidad
                FROM diagnosticos d
                JOIN organizaciones o ON o.id = d.organizacion_id
                WHERE d.external_id = %s AND d.tenant_id = %s
                """,
                (diagnostico_id, tenant_id),
                fetchone=True
            )

            if not row:
                self._error(404, 'Diagnóstico no encontrado')
                return

            # Obtener respuestas asociadas
            respuestas = db.execute(
                """
                SELECT pregunta_id, modulo_id, valor
                FROM respuestas
                WHERE diagnostico_id = %s
                ORDER BY pregunta_id
                """,
                (str(row['id']),),
                fetch=True
            )

            # Construir respuesta
            answers_map = {}
            for r in (respuestas or []):
                answers_map[r['pregunta_id']] = r['valor']

            response = {
                'id': str(row['id']),
                'external_id': row['external_id'],
                'tenant_id': row['tenant_id'],
                'kb_version': row['kb_version'],
                'organizacion': {
                    'nombre': row['org_nombre'],
                    'sector': row['org_sector'],
                    'tamano': row['org_tamano'],
                    'aplicabilidad': row['org_aplicabilidad'],
                },
                'resultado': row['resultado'],
                'score_sgi': float(row['score_sgi']) if row['score_sgi'] is not None else None,
                'nivel_sgi': row['nivel_sgi'],
                'brechas': row['brechas'],
                'plan_mejora': row['plan_mejora'],
                'plan_aprendizaje': row['plan_aprendizaje'],
                'benchmark': row['benchmark'],
                'alertas': row['alertas'],
                'meta': row['meta'],
                'answers': answers_map,
                'created_at': row['created_at'].isoformat() if row['created_at'] else None,
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False, default=str).encode())

        except Exception as e:
            self._error(500, f'Error interno: {str(e)}')

    def _error(self, code, msg):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error': msg}).encode())
