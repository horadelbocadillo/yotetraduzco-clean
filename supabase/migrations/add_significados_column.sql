-- Migration: Add significados column for dictionary meanings
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zgdrfdrsiulankhbyrtc/sql

-- Add significados column as JSONB array
ALTER TABLE palabras
ADD COLUMN IF NOT EXISTS significados JSONB DEFAULT '[]';

-- Add comment for documentation
COMMENT ON COLUMN palabras.significados IS 'Array of dictionary meanings with structure: [{part_of_speech, definition_en, definition_es, example, synonyms}]';

-- Create index for potential future queries on significados
CREATE INDEX IF NOT EXISTS idx_palabras_significados ON palabras USING GIN (significados);
