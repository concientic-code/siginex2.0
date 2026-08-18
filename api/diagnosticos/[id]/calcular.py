"""SIGINEX 2.0 · POST /api/diagnosticos/{id}/calcular"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys

# Import orchestrator
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
import _orchestrator as orch  # noqa: E402

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '_data')

API_KEYS = {k.strip() for k in os.environ.get('SIGINEX_API_KEYS', 'demo-key').split(',') if k.strip()}


def _load_json(name):
    with open(os.path.join(DATA_DIR, name), encoding='utf-8') as f:
        return json.load(f)


KB = _load_json('kb.json')
KB_FOR_ORCH = {'modulos': KB['modulos']}


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
