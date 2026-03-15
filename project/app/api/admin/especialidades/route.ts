// GET/POST/DELETE /api/admin/especialidades — Gestión de fechas de especialistas
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { sanitizeDate, sanitizeNumber, sanitizeText, sanitizeTime } from "@/lib/request-security";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const especialidad = sanitizeText(searchParams.get("especialidad"), 40);

    const supabase = createAdminClient();
    let query = supabase
      .from("especialistas_fechas")
      .select("*")
      .eq("activo", true)
      .order("fecha", { ascending: true });

    if (especialidad) {
      query = query.eq("especialidad", especialidad);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Error al obtener fechas." }, { status: 500 });
    }

    return NextResponse.json({ fechas: data || [] });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const especialidad = sanitizeText(body.especialidad, 40);
    const fecha = sanitizeDate(body.fecha);
    const hora_inicio = sanitizeTime(body.hora_inicio);
    const hora_fin = sanitizeTime(body.hora_fin);
    const intervalo_minutos = sanitizeNumber(body.intervalo_minutos, { min: 5, max: 240 }) || 30;

    if (!especialidad || !fecha || !hora_inicio || !hora_fin) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("especialistas_fechas")
      .insert({
        especialidad,
        fecha,
        hora_inicio,
        hora_fin,
        intervalo_minutos: intervalo_minutos || 30,
        activo: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "No se pudo guardar la fecha." }, { status: 500 });
    }

    return NextResponse.json({ fecha: data }, { status: 201 });
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
    const { error } = await supabase
      .from("especialistas_fechas")
      .update({ activo: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "No se pudo eliminar la fecha." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
