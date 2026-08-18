"""SIGINEX 2.0 · GET /api — Service info"""
from http.server import BaseHTTPRequestHandler
import json


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({
            "service": "SIGINEX",
            "version": "2.0.0",
            "status": "operational",
            "endpoints": [
                "GET /api",
                "GET /api/health",
                "GET /api/kb",
                "GET /api/kb/version",
                "GET /api/market-signals",
                "POST /api/diagnosticos/{id}/calcular"
            ]
        }).encode())
