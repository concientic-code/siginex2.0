"""
SIGINEX 2.0 · Módulo de conexión a PostgreSQL (Neon)
Usa psycopg2 con DATABASE_URL desde variables de entorno.
"""
import os
import json
import psycopg2
import psycopg2.extras

DATABASE_URL = os.environ.get("DATABASE_URL", "")


def get_conn():
    """Obtiene una conexión a PostgreSQL. En serverless cada invocación abre/cierra."""
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL no configurada")
    conn = psycopg2.connect(DATABASE_URL, sslmode="require")
    conn.autocommit = False
    return conn


def execute(query, params=None, fetch=False, fetchone=False):
    """Ejecuta un query y opcionalmente devuelve resultados."""
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, params)
            if fetchone:
                result = cur.fetchone()
            elif fetch:
                result = cur.fetchall()
            else:
                result = None
            conn.commit()
            return result
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def execute_many(queries):
    """Ejecuta múltiples queries en una sola transacción.
    queries: lista de tuplas (query, params)
    """
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            results = []
            for query, params in queries:
                cur.execute(query, params)
                try:
                    results.append(cur.fetchone())
                except psycopg2.ProgrammingError:
                    results.append(None)
            conn.commit()
            return results
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def to_jsonb(data):
    """Convierte un dict/list a string JSON para insertar como JSONB."""
    if data is None:
        return None
    return json.dumps(data, ensure_ascii=False, default=str)
