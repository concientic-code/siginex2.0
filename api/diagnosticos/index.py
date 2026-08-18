"""SIGINEX 2.0 · GET /api/diagnosticos
Lista los diagnósticos de un tenant con filtros opcionales.

Query params:
  - limit (int, default 20, max 100)
  - offset (int, default 0)
  - org (string, filtra por nombre de organización parcial)
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys
from urllib.parse import urlparse, parse_qs

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
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

        # Parse query params
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)

        limit = min(int(qs.get('limit', ['20'])[0]), 100)
        offset = max(int(qs.get('offset', ['0'])[0]), 0)
        org_filter = qs.get('org', [None])[0]

        try:
            # Construir query con filtros
            where_clauses = ["d.tenant_id = %s"]
            params = [tenant_id]

            if org_filter:
                where_clauses.append("o.nombre ILIKE %s")
                params.append(f"%{org_filter}%")

            where_sql = " AND ".join(where_clauses)

            # Contar total
            count_row = db.execute(
                f"""
                SELECT COUNT(*) as total
                FROM diagnosticos d
                JOIN organizaciones o ON o.id = d.organizacion_id
                WHERE {where_sql}
                """,
                params,
                fetchone=True
            )
            total = count_row['total'] if count_row else 0

            # Obtener registros paginados
            rows = db.execute(
                f"""
                SELECT
                    d.id,
                    d.external_id,
                    d.kb_version,
                    d.score_sgi,
                    d.nivel_sgi,
                    d.created_at,
                    d.meta,
                    o.nombre AS org_nombre,
                    o.sector AS org_sector,
                    o.tamano AS org_tamano
                FROM diagnosticos d
                JOIN organizaciones o ON o.id = d.organizacion_id
                WHERE {where_sql}
                ORDER BY d.created_at DESC
                LIMIT %s OFFSET %s
                """,
                params + [limit, offset],
                fetch=True
            )

            items = []
            for row in (rows or []):
                items.append({
                    'id': str(row['id']),
                    'external_id': row['external_id'],
                    'kb_version': row['kb_version'],
                    'score_sgi': float(row['score_sgi']) if row['score_sgi'] is not None else None,
                    'nivel_sgi': row['nivel_sgi'],
                    'organizacion': {
                        'nombre': row['org_nombre'],
                        'sector': row['org_sector'],
                        'tamano': row['org_tamano'],
                    },
                    'meta': row['meta'],
                    'created_at': row['created_at'].isoformat() if row['created_at'] else None,
                })

            response = {
                'items': items,
                'total': total,
                'limit': limit,
                'offset': offset,
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
