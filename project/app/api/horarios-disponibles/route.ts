// API route para obtener los horarios ocupados de una fecha específica
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { esDiaLaboral } from "@/lib/horarios";
import { sanitizeDate } from "@/lib/request-security";
export const dynamic = 'force-dynamic';
// GET /api/horarios-disponibles?fecha=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = sanitizeDate(searchParams.get("fecha"));

    if (!fecha) {
      return NextResponse.json({ error: "Falta el parámetro fecha." }, { status: 400 });
    }

    // Validar formato YYYY-MM-DD
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha)) {
      return NextResponse.json({ error: "Formato de fecha inválido." }, { status: 400 });
    }

    const fechaDate = new Date(fecha + "T12:00:00");
    if (!esDiaLaboral(fechaDate)) {
      // Si es fin de semana, devolver todos los slots como ocupados
      return NextResponse.json({ ocupados: [], diaNoLaboral: true });
    }

    const supabase = await createServerSupabaseClient();

    // Verificar si el día completo está bloqueado
    const { data: diaCompleto } = await supabase
      .from("horarios_bloqueados")
      .select("motivo")
      .eq("fecha", fecha)
      .is("hora", null)
      .single();

    if (diaCompleto) {
      return NextResponse.json({
        ocupados: [],
        diaBloqueado: true,
        motivo: diaCompleto.motivo,
      });
    }

    // Obtener turnos ya reservados (no cancelados)
    const { data: turnosOcupados, error: errorTurnos } = await supabase
      .from("turnos")
      .select("hora")
      .eq("fecha", fecha)
      .neq("estado", "cancelado");

    if (errorTurnos) {
      return NextResponse.json({ error: "Error al consultar turnos." }, { status: 500 });
    }

    // Obtener horarios bloqueados específicos de ese día
    const { data: bloqueados } = await supabase
      .from("horarios_bloqueados")
      .select("hora")
      .eq("fecha", fecha)
      .not("hora", "is", null);

    const horasOcupadas = [
      ...(turnosOcupados?.map((t) => t.hora) || []),
      ...(bloqueados?.map((b) => b.hora) || []),
    ];

    return NextResponse.json({ ocupados: horasOcupadas });
  } catch (err) {
    console.error("Error en GET /api/horarios-disponibles:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
