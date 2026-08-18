-- ============================================================
-- SIGINEX 2.0 · Esquema de persistencia PostgreSQL (Neon)
-- Ejecutar una vez contra la base de datos para crear las tablas.
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------
-- 1. Organizaciones (tenant + empresa evaluada)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizaciones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       TEXT NOT NULL,
    nombre          TEXT NOT NULL,
    sector          TEXT,
    tamano          TEXT,
    aplicabilidad   JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Una organización con el mismo nombre dentro del mismo tenant es la misma
    CONSTRAINT uq_org_tenant_nombre UNIQUE (tenant_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_org_tenant ON organizaciones (tenant_id);

-- -----------------------------------------------------------
-- 2. Diagnósticos (cada ejecución de cálculo)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnosticos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id     TEXT,                              -- ID externo enviado por el frontend
    tenant_id       TEXT NOT NULL,
    organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
    kb_version      TEXT,
    score_sgi       NUMERIC(5,2),
    nivel_sgi       JSONB,
    resultado       JSONB NOT NULL DEFAULT '{}',       -- objeto completo del orquestador
    brechas         JSONB NOT NULL DEFAULT '[]',
    plan_mejora     JSONB NOT NULL DEFAULT '[]',
    plan_aprendizaje JSONB NOT NULL DEFAULT '[]',
    benchmark       JSONB,
    alertas         JSONB NOT NULL DEFAULT '[]',
    meta            JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_diag_external UNIQUE (tenant_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_diag_tenant ON diagnosticos (tenant_id);
CREATE INDEX IF NOT EXISTS idx_diag_org ON diagnosticos (organizacion_id);
CREATE INDEX IF NOT EXISTS idx_diag_created ON diagnosticos (created_at DESC);

-- -----------------------------------------------------------
-- 3. Respuestas (cada respuesta individual del diagnóstico)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS respuestas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostico_id  UUID NOT NULL REFERENCES diagnosticos(id) ON DELETE CASCADE,
    pregunta_id     TEXT NOT NULL,
    modulo_id       TEXT,
    valor           TEXT NOT NULL,                     -- '0', '1', '2', 'na'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_resp_diag_pregunta UNIQUE (diagnostico_id, pregunta_id)
);

CREATE INDEX IF NOT EXISTS idx_resp_diag ON respuestas (diagnostico_id);

-- -----------------------------------------------------------
-- Trigger para actualizar updated_at en organizaciones
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_org_updated_at ON organizaciones;
CREATE TRIGGER trg_org_updated_at
    BEFORE UPDATE ON organizaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
