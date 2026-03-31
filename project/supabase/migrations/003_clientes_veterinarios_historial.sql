CREATE TABLE IF NOT EXISTS veterinarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL,
  especialidad TEXT NOT NULL CHECK (especialidad IN ('clinica', 'dermatologia', 'oftalmologia', 'endocrinologia')),
  telefono TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_veterinarios_especialidad ON veterinarios (especialidad);

CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT,
  telefono TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes (telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes (email);

CREATE TABLE IF NOT EXISTS mascotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  especie TEXT NOT NULL CHECK (especie IN ('perro', 'gato', 'conejo', 'ave', 'otro')),
  raza TEXT,
  fecha_nacimiento DATE,
  sexo TEXT CHECK (sexo IN ('macho', 'hembra', 'no especificado')),
  color_pelaje TEXT,
  esterilizado BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mascotas_cliente ON mascotas (cliente_id);

CREATE TABLE IF NOT EXISTS historial_clinico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mascota_id UUID NOT NULL REFERENCES mascotas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  veterinario_id UUID REFERENCES veterinarios(id),
  veterinario_nombre TEXT,
  motivo_consulta TEXT,
  anamnesis TEXT,
  peso_kg NUMERIC(5,2),
  temperatura_c NUMERIC(4,1),
  frecuencia_cardiaca INT,
  frecuencia_respiratoria INT,
  condicion_corporal SMALLINT CHECK (condicion_corporal BETWEEN 1 AND 9),
  mucosas TEXT,
  hidratacion TEXT,
  ganglios_linfaticos TEXT,
  auscultacion TEXT,
  examen_fisico_general TEXT,
  diagnostico_presuntivo TEXT,
  diagnostico_definitivo TEXT,
  tratamiento TEXT,
  indicaciones TEXT,
  medicamentos JSONB DEFAULT '[]',
  vacunas JSONB DEFAULT '[]',
  analisis_solicitados TEXT,
  resultados_analisis TEXT,
  proxima_consulta DATE,
  observaciones_internas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_mascota ON historial_clinico (mascota_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_clinico (fecha DESC);

CREATE TRIGGER trigger_historial_updated_at
  BEFORE UPDATE ON historial_clinico
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();
