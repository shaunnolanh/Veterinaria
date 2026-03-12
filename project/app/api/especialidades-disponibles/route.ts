// GET /api/especialidades-disponibles — Fechas públicas de especialistas
// Usado por el formulario de turnos del cliente
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { Especialidad } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const especialidad = searchParams.get("especialidad") as Exclude<Especialidad, "clinica"> | null;

    if (!especialidad) {
      return NextResponse.json({ error: "Falta el parámetro especialidad." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const hoy = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("especialistas_fechas")
      .select("*")
      .eq("especialidad", especialidad)
      .eq("activo", true)
      .gte("fecha", hoy) // solo fechas futuras
      .order("fecha", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Error al consultar fechas." }, { status: 500 });
    }

    return NextResponse.json({ fechas: data || [] });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
