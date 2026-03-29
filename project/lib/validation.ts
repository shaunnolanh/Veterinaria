import { z } from "zod";

const soloTextoRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü'\-\s]+$/;

export const nombreSchema = z
  .string()
  .trim()
  .min(1, "Este campo es obligatorio.")
  .max(100, "Debe tener como máximo 100 caracteres.")
  .regex(soloTextoRegex, "Solo puede contener letras.");

export const telefonoSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "El teléfono debe contener solo números.")
  .min(7, "El teléfono debe tener al menos 7 dígitos.")
  .max(15, "El teléfono debe tener como máximo 15 dígitos.");

export const emailSchema = z
  .string()
  .trim()
  .email("Ingresá un email válido.")
  .max(120, "El email es demasiado largo.");

export const turnoFormSchema = z.object({
  nombre: nombreSchema,
  apellido: nombreSchema,
  telefono: telefonoSchema,
  email: z.union([z.literal(""), emailSchema]).optional().transform((v: string | undefined) => v ?? ""),
  mascota: z.string().trim().min(1, "El nombre de la mascota es obligatorio.").max(80),
  especie: z.enum(["perro", "gato", "conejo", "ave", "otro"]),
  motivo: z.string().trim().max(500).optional().transform((v: string | undefined) => v ?? ""),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida."),
  especialidad: z.enum(["clinica", "dermatologia", "oftalmologia", "endocrinologia"]).optional(),
});


export const pedidoClienteSchema = z.object({
  nombre: nombreSchema,
  apellido: nombreSchema,
  telefono: telefonoSchema,
});

export const checkoutClienteSchema = z.object({
  nombre: nombreSchema,
  apellido: nombreSchema,
  email: emailSchema,
  telefono: telefonoSchema,
});

export const itemCheckoutSchema = z.object({
  producto_id: z.string().trim().min(1).max(64),
  cantidad: z.number().int().min(1).max(999),
});

export const checkoutPayloadSchema = z.object({
  items: z.array(itemCheckoutSchema).min(1),
  cliente: checkoutClienteSchema,
});
