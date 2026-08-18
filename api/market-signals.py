"""SIGINEX 2.0 · GET /api/market-signals"""
from http.server import BaseHTTPRequestHandler
import json
import os
from urllib.parse import urlparse, parse_qs

DATA_DIR = os.path.join(os.path.dirname(__file__), '_data')


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key, X-Tenant-Id')
        self.end_headers()

    def do_GET(self):
        path = os.path.join(DATA_DIR, 'Benchmark_Market_Watch.json')
        with open(path, encoding='utf-8') as f:
            raw = json.load(f)

        signals = raw.get("registro_senales", raw.get("signals", []))

        # Parse filters
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        impacto = params.get("impacto", [None])[0]
        desde = params.get("desde", [None])[0]

        if impacto:
            signals = [s for s in signals if s.get("impacto") == impacto]
        if desde:
            signals = [s for s in signals if s.get("fecha", "") >= desde]

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"data": signals, "next_cursor": None}).encode())
