"""SIGINEX 2.0 · GET /api/kb — Serve knowledge base"""
from http.server import BaseHTTPRequestHandler
import json
import os
import hashlib

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '_data')

# Load KB at cold start
_kb_raw = None
_kb_etag = None


def _load():
    global _kb_raw, _kb_etag
    if _kb_raw is None:
        path = os.path.join(DATA_DIR, 'kb.json')
        with open(path, encoding='utf-8') as f:
            _kb_raw = f.read()
        _kb_etag = hashlib.md5(_kb_raw.encode()).hexdigest()[:16]


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key, X-Tenant-Id, If-None-Match')
        self.end_headers()

    def do_GET(self):
        _load()

        # ETag caching
        client_etag = self.headers.get('If-None-Match', '')
        if client_etag == _kb_etag:
            self.send_response(304)
            self.end_headers()
            return

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('ETag', _kb_etag)
        self.send_header('Cache-Control', 'public, max-age=3600')
        self.end_headers()
        self.wfile.write(_kb_raw.encode())
