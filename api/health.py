"""SIGINEX 2.0 · GET /api/health"""
from http.server import BaseHTTPRequestHandler
import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '_data')


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            with open(os.path.join(DATA_DIR, 'kb-version.json'), encoding='utf-8') as f:
                ver = json.load(f)
        except Exception:
            ver = {"kb_version": "unknown"}

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "healthy",
            "kb_version": ver.get("kb_version"),
            "total_preguntas": ver.get("total_preguntas"),
            "modulos": ver.get("modulos"),
        }).encode())
