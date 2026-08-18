/**
 * SIGINEX 2.0 — Database migration script
 * Applies the schema to Neon PostgreSQL
 * 
 * Usage: node scripts/migrate.mjs
 */

import pg from "pg";
const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_5yTKZt9vJBVD@ep-sparkling-queen-avlsrpaj-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require";

const SCHEMA = `
-- SIGINEX 2.0 Schema (simplified for MVP)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tenant (multi-tenant support)
CREATE TABLE IF NOT EXISTS tenant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  slug text UNIQUE NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now()
);

-- Organization
CREATE TABLE IF NOT EXISTS organizacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  nit text,
  sector text,
  tamano text,
  aplicabilidad jsonb NOT NULL DEFAULT '{}'::jsonb,
  creado_en timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_org_tenant ON organizacion(tenant_id);

-- Diagnostic session
CREATE TABLE IF NOT EXISTS diagnostico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  organizacion_id uuid NOT NULL REFERENCES organizacion(id) ON DELETE CASCADE,
  kb_version text NOT NULL DEFAULT '3.1.0',
  estado text NOT NULL DEFAULT 'en_progreso',
  score_sgi numeric(5,2),
  nivel_sgi smallint,
  creado_en timestamptz NOT NULL DEFAULT now(),
  completado_en timestamptz
);
CREATE INDEX IF NOT EXISTS ix_diag_org ON diagnostico(organizacion_id, creado_en DESC);

-- Individual answers
CREATE TABLE IF NOT EXISTS respuesta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostico_id uuid NOT NULL REFERENCES diagnostico(id) ON DELETE CASCADE,
  pregunta_id text NOT NULL,
  skill_id text NOT NULL,
  valor text,
  peso numeric(8,5),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (diagnostico_id, pregunta_id)
);
CREATE INDEX IF NOT EXISTS ix_resp_diag ON respuesta(diagnostico_id);

-- Results per module (materialized)
CREATE TABLE IF NOT EXISTS resultado_pilar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostico_id uuid NOT NULL REFERENCES diagnostico(id) ON DELETE CASCADE,
  skill_id text NOT NULL,
  score numeric(5,2),
  nivel smallint,
  cumplimiento_pct numeric(5,2),
  UNIQUE (diagnostico_id, skill_id)
);

-- Recommendations
CREATE TABLE IF NOT EXISTS recomendacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostico_id uuid NOT NULL REFERENCES diagnostico(id) ON DELETE CASCADE,
  skill_id text NOT NULL,
  pregunta_id text,
  prioridad text NOT NULL,
  texto text NOT NULL,
  norma_ref text,
  creado_en timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_reco_diag ON recomendacion(diagnostico_id);

-- Insert default tenant
INSERT INTO tenant (nombre, slug) VALUES ('Default', 'default')
ON CONFLICT (slug) DO NOTHING;
`;

async function migrate() {
  console.log("Connecting to database...");
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log("Connected. Applying schema...");
    await client.query(SCHEMA);
    console.log("Schema applied successfully!");
    
    // Verify
    const res = await client.query("SELECT COUNT(*) FROM tenant");
    console.log(`Tenants in DB: ${res.rows[0].count}`);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
