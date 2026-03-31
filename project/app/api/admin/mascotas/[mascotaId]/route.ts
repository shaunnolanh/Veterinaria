import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { sanitizeDate, sanitizeText } from "@/lib/request-security";

const ESPECIES_VALIDAS = ["perro", "gato", "conejo", "ave", "otro"];
const SEXOS_VALIDOS = ["macho", "hembra", "no especificado"];

export async function PATCH(request: NextRequest, context: { params: Promise<{ mascotaId: string }> }) {
  try {
    const { mascotaId } = await context.params;
    const id = sanitizeText(mascotaId, 64);
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const payload = {
      nombre: sanitizeText(body.nombre, 80),
      especie: sanitizeText(body.especie, 40),
      raza: sanitizeText(body.raza, 80) || null,
      fecha_nacimiento: sanitizeDate(body.fecha_nacimiento) || null,
      sexo: sanitizeText(body.sexo, 30),
      color_pelaje: sanitizeText(body.color_pelaje, 80) || null,
      esterilizado: Boolean(body.esterilizado),
      activo: typeof body.activo === "boolean" ? body.activo : true,
    };

    if (!payload.nombre || !ESPECIES_VALIDAS.includes(payload.especie)) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    if (payload.sexo && !SEXOS_VALIDOS.includes(payload.sexo)) {
      return NextResponse.json({ error: "Sexo inválido." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.from("mascotas").update(payload).eq("id", id).select().single();

    if (error) {
      return NextResponse.json({ error: "No se pudo actualizar la mascota." }, { status: 500 });
    }

    return NextResponse.json({ mascota: data });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
