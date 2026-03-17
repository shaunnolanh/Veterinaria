// Tipos principales del proyecto Peón Pet's

// ─── Turnos ───────────────────────────────────────────────────────────────────

export type EstadoTurno = "pendiente" | "confirmado" | "cancelado";

export type EspecieMascota = "perro" | "gato" | "conejo" | "ave" | "otro";

export type Especialidad = "clinica" | "dermatologia" | "oftalmologia" | "endocrinologia";

export interface Turno {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  mascota: string;
  especie: EspecieMascota;
  motivo: string;
  fecha: string; // formato YYYY-MM-DD
  hora: string; // formato HH:MM
  estado: EstadoTurno;
  especialidad: Especialidad;
  notas_admin?: string;
  recordatorio_enviado: boolean;
  created_at: string;
}

export interface SlotHorario {
  hora: string; // formato HH:MM
  disponible: boolean;
}

export interface HorarioBloqueado {
  id: string;
  fecha: string;
  hora: string | null; // null = día completo bloqueado
  motivo: string;
}

export interface FormularioTurnoData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  mascota: string;
  especie: EspecieMascota;
  motivo: string;
  fecha: string;
  hora: string;
  especialidad: Especialidad;
}

// ─── Especialistas ────────────────────────────────────────────────────────────

export interface EspecialistaFecha {
  id: string;
  especialidad: Exclude<Especialidad, "clinica">;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fin: string; // HH:MM
  intervalo_minutos: number;
  activo: boolean;
  created_at: string;
}

// ─── Tienda ───────────────────────────────────────────────────────────────────

export type CategoriaProducto =
  | "alimentos"
  | "medicamentos"
  | "accesorios"
  | "antiparasitarios"
  | "shampoos"
  | "colchones";

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: CategoriaProducto;
  imagen_url: string | null;
  stock: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export type EstadoPedido = "pendiente" | "confirmado" | "listo" | "retirado" | "cancelado";

export interface ItemPedido {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Pedido {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  items: ItemPedido[];
  total: number;
  metodo_pago: "mercadopago" | "efectivo";
  estado: EstadoPedido;
  mp_payment_id: string | null;
  mp_status: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Horarios ─────────────────────────────────────────────────────────────────

// Horarios de atención de la clínica
export const HORARIOS_ATENCION = {
  diasSemana: [1, 2, 3, 4, 5], // Lunes a viernes (0=Domingo)
  manana: {
    inicio: "09:00",
    fin: "13:00",
  },
  tarde: {
    inicio: "16:00",
    fin: "20:00",
  },
  duracionTurno: 30, // minutos por turno
};

// Labels de especialidades para mostrar en UI
export const ESPECIALIDAD_LABELS: Record<Especialidad, { label: string; icono: string }> = {
  clinica: { label: "Clínica General", icono: "🏥" },
  dermatologia: { label: "Dermatología", icono: "🔬" },
  oftalmologia: { label: "Oftalmología", icono: "👁️" },
  endocrinologia: { label: "Endocrinología", icono: "💊" },
};

// Labels de categorías de productos
export const CATEGORIA_LABELS: Record<CategoriaProducto, { label: string; icono: string }> = {
  alimentos: { label: "Alimentos y bolsas", icono: "🥩" },
  medicamentos: { label: "Medicamentos", icono: "💊" },
  accesorios: { label: "Accesorios", icono: "🎾" },
  antiparasitarios: { label: "Antiparasitarios", icono: "🦟" },
  shampoos: { label: "Shampoos y grooming", icono: "🛁" },
  colchones: { label: "Colchones y cuchas", icono: "🛏️" },
};
