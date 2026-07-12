-- Migration: Add SRS (spaced repetition) learning progress columns
-- Issue #1 — Esquema de progreso de aprendizaje (SRS) en Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/mafbuoicsxaonfsxprip/sql

-- Estado de aprendizaje por palabra (modelo SM-2 simplificado, estilo Anki)
ALTER TABLE palabras
  ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'nueva'
    CHECK (estado IN ('nueva', 'aprendiendo', 'dominada')),
  ADD COLUMN IF NOT EXISTS intervalo_dias INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS factor_facilidad REAL NOT NULL DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS proximo_repaso DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS aciertos INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fallos INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ultimo_repaso TIMESTAMPTZ;

COMMENT ON COLUMN palabras.estado IS 'nueva | aprendiendo | dominada';
COMMENT ON COLUMN palabras.intervalo_dias IS 'Días hasta el próximo repaso según SM-2';
COMMENT ON COLUMN palabras.factor_facilidad IS 'Ease factor SM-2 (arranca en 2.5)';
COMMENT ON COLUMN palabras.proximo_repaso IS 'Fecha en la que la palabra vuelve a entrar en la sesión de repaso';
COMMENT ON COLUMN palabras.aciertos IS 'Total de respuestas correctas en repasos';
COMMENT ON COLUMN palabras.fallos IS 'Total de respuestas incorrectas en repasos';
COMMENT ON COLUMN palabras.ultimo_repaso IS 'Momento del último repaso (NULL si nunca se ha repasado)';

-- La consulta de la sesión diaria será "palabras con proximo_repaso <= hoy"
CREATE INDEX IF NOT EXISTS idx_palabras_proximo_repaso ON palabras (proximo_repaso);

-- Backfill: los DEFAULT de ADD COLUMN ya dejan todas las palabras existentes
-- como 'nueva' con proximo_repaso = hoy, que es exactamente lo que pide la issue.
