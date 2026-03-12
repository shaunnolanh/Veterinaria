-- ============================================================
-- Schema SQL — Clínica Veterinaria Peón Pet's
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- TABLA: turnos
-- Almacena todos los turnos solicitados por los clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS turnos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Datos del dueño
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT NOT NULL,

  -- Datos de la mascota
  mascota TEXT NOT NULL,
  especie TEXT NOT NULL CHECK (especie IN ('perro', 'gato', 'conejo', 'ave', 'otro')),

  -- Datos del turno
  motivo TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,

  -- Estado del turno
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'cancelado')),

  -- Notas internas de la clínica
  notas_admin TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos (fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos (estado);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha_hora ON turnos (fecha, hora);

-- ============================================================
-- TABLA: horarios_bloqueados
-- Permite bloquear días o franjas horarias específicas
-- hora = NULL significa que todo el día está bloqueado
-- ============================================================
CREATE TABLE IF NOT EXISTS horarios_bloqueados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME, -- NULL = bloqueo del día completo
  motivo TEXT NOT NULL DEFAULT 'No disponible',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bloqueados_fecha ON horarios_bloqueados (fecha);

-- ============================================================
-- TRIGGER: actualiza updated_at automáticamente en turnos
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_turnos_updated_at
  BEFORE UPDATE ON turnos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activar RLS en ambas tablas
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_bloqueados ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede INSERTAR un turno (para el formulario público)
CREATE POLICY "Cualquiera puede crear un turno"
  ON turnos FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Política: Cualquiera puede LEER los horarios ocupados (necesario para el calendario)
CREATE POLICY "Cualquiera puede leer horarios ocupados"
  ON turnos FOR SELECT
  TO anon, authenticated
  USING (true);

-- Política: Solo usuarios autenticados (admin) pueden ACTUALIZAR turnos
CREATE POLICY "Solo admin puede actualizar turnos"
  ON turnos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política: Solo admin puede leer horarios bloqueados
CREATE POLICY "Cualquiera puede leer horarios bloqueados"
  ON horarios_bloqueados FOR SELECT
  TO anon, authenticated
  USING (true);

-- Política: Solo admin puede gestionar horarios bloqueados
CREATE POLICY "Solo admin puede gestionar bloqueos"
  ON horarios_bloqueados FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- DATOS DE EJEMPLO (opcional — para probar la app)
-- ============================================================

-- Ejemplo de turno pendiente
-- INSERT INTO turnos (nombre, apellido, telefono, mascota, especie, motivo, fecha, hora)
-- VALUES ('María', 'González', '03548 15-12-3456', 'Firulais', 'perro', 'Vacunación anual', CURRENT_DATE + 1, '09:00');

-- Ejemplo de día bloqueado (vacaciones)
-- INSERT INTO horarios_bloqueados (fecha, hora, motivo)
-- VALUES ('2026-03-20', NULL, 'Feriado nacional');
