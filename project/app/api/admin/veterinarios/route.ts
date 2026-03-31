import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { sanitizeEmail, sanitizeText } from "@/lib/request-security";

const ESPECIALIDADES_VALIDAS = ["clinica", "dermatologia", "oftalmologia", "endocrinologia"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const especialidad = sanitizeText(searchParams.get("especialidad"), 40);

    const supabase = createAdminClient();
    let query = supabase.from("veterinarios").select("*").order("created_at", { ascending: false });

    if (especialidad) {
      query = query.eq("especialidad", especialidad);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: "No se pudo cargar la lista de veterinarios." }, { status: 500 });
    }

    return NextResponse.json({ veterinarios: data || [] });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nombre = sanitizeText(body.nombre, 80);
    const apellido = sanitizeText(body.apellido, 80);
    const email = sanitizeEmail(body.email);
    const especialidad = sanitizeText(body.especialidad, 40);
    const telefono = sanitizeText(body.telefono, 30);

    if (!nombre || !apellido || !email || !especialidad) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    if (!ESPECIALIDADES_VALIDAS.includes(especialidad)) {
      return NextResponse.json({ error: "Especialidad inválida." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("veterinarios")
      .insert({ nombre, apellido, email, especialidad, telefono: telefono || null, activo: true })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "No se pudo crear el veterinario." }, { status: 500 });
    }

    return NextResponse.json({ veterinario: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = sanitizeText(searchParams.get("id"), 64);
    const body = await request.json();

    if (!id || typeof body.activo !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("veterinarios").update({ activo: body.activo }).eq("id", id);

    if (error) {
      return NextResponse.json({ error: "No se pudo actualizar el estado." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = sanitizeText(searchParams.get("id"), 64);

    if (!id) {
      return NextResponse.json({ error: "Falta el ID." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("veterinarios").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: "No se pudo eliminar el veterinario." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
