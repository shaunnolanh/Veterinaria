-- ============================================================
-- Migración 001: Agregar campo recordatorio_enviado a turnos
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Agregar columna si no existe
ALTER TABLE turnos
  ADD COLUMN IF NOT EXISTS recordatorio_enviado BOOLEAN NOT NULL DEFAULT false;

-- Índice para que el cron job sea eficiente al buscar pendientes
CREATE INDEX IF NOT EXISTS idx_turnos_recordatorio
  ON turnos (estado, recordatorio_enviado, fecha, hora)
  WHERE estado = 'confirmado' AND recordatorio_enviado = false;
