import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { sanitizeDate, sanitizeText } from "@/lib/request-security";

const ESPECIES_VALIDAS = ["perro", "gato", "conejo", "ave", "otro"];
const SEXOS_VALIDOS = ["macho", "hembra", "no especificado"];

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const clienteId = sanitizeText(id, 64);
    const body = await request.json();

    if (!clienteId) {
      return NextResponse.json({ error: "Cliente inválido." }, { status: 400 });
    }

    const nombre = sanitizeText(body.nombre, 80);
    const especie = sanitizeText(body.especie, 40);
    const raza = sanitizeText(body.raza, 80);
    const fecha_nacimiento = sanitizeDate(body.fecha_nacimiento);
    const sexo = sanitizeText(body.sexo, 30);
    const color_pelaje = sanitizeText(body.color_pelaje, 80);
    const esterilizado = Boolean(body.esterilizado);

    if (!nombre || !especie || !ESPECIES_VALIDAS.includes(especie)) {
      return NextResponse.json({ error: "Datos de mascota inválidos." }, { status: 400 });
    }

    if (sexo && !SEXOS_VALIDOS.includes(sexo)) {
      return NextResponse.json({ error: "Sexo inválido." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { count, error: countError } = await supabase
      .from("mascotas")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", clienteId);

    if (countError) {
      return NextResponse.json({ error: "No se pudo validar la cantidad de mascotas." }, { status: 500 });
    }

    if ((count || 0) >= 10) {
      return NextResponse.json({ error: "Cada cliente puede tener hasta 10 mascotas." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("mascotas")
      .insert({
        cliente_id: clienteId,
        nombre,
        especie,
        raza: raza || null,
        fecha_nacimiento: fecha_nacimiento || null,
        sexo: sexo || "no especificado",
        color_pelaje: color_pelaje || null,
        esterilizado,
        activo: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "No se pudo crear la mascota." }, { status: 500 });
    }

    return NextResponse.json({ mascota: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
