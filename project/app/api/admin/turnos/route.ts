// GET /api/admin/turnos — Lista turnos filtrados por especialidad, estado y período
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { Especialidad, EstadoTurno } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const especialidad = searchParams.get("especialidad") as Especialidad | null;
    const estado = searchParams.get("estado") as EstadoTurno | "todos" | null;
    const periodo = searchParams.get("periodo") || "todos"; // hoy | manana | semana | todos

    const supabase = createAdminClient();
    let query = supabase
      .from("turnos")
      .select("*")
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (especialidad) {
      query = query.eq("especialidad", especialidad);
    }

    if (estado && estado !== "todos") {
      query = query.eq("estado", estado);
    }

    // Filtro de período
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    const fechaHoy = `${yyyy}-${mm}-${dd}`;

    if (periodo === "hoy") {
      query = query.eq("fecha", fechaHoy);
    } else if (periodo === "manana") {
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);
      const mY = manana.getFullYear();
      const mM = String(manana.getMonth() + 1).padStart(2, "0");
      const mD = String(manana.getDate()).padStart(2, "0");
      query = query.eq("fecha", `${mY}-${mM}-${mD}`);
    } else if (periodo === "semana") {
      const fin = new Date(hoy);
      fin.setDate(fin.getDate() + 7);
      const fY = fin.getFullYear();
      const fM = String(fin.getMonth() + 1).padStart(2, "0");
      const fD = String(fin.getDate()).padStart(2, "0");
      query = query.gte("fecha", fechaHoy).lte("fecha", `${fY}-${fM}-${fD}`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Error al obtener turnos." }, { status: 500 });
    }

    return NextResponse.json({ turnos: data || [] });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
