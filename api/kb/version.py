"""SIGINEX 2.0 · GET /api/kb/version"""
from http.server import BaseHTTPRequestHandler
import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '_data')


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key, X-Tenant-Id')
        self.end_headers()

    def do_GET(self):
        path = os.path.join(DATA_DIR, 'kb-version.json')
        with open(path, encoding='utf-8') as f:
            data = f.read()

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(data.encode())
