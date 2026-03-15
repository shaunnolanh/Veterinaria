// API route para actualizar el estado de un turno específico (PATCH)
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { EstadoTurno } from "@/types";
import { sanitizeText } from "@/lib/request-security";

// PATCH /api/turnos/[id] — Actualiza el estado de un turno
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const turnoId = sanitizeText(id, 64);
    const body = await request.json();
    const estado = sanitizeText(body.estado, 20) as EstadoTurno;
    const notas_admin = sanitizeText(body.notas_admin, 500) || null;
    const _typed = body as {
      estado: EstadoTurno;
      notas_admin?: string;
    };

    const estadosValidos: EstadoTurno[] = ["pendiente", "confirmado", "cancelado"];
    if (!estado || !estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: "Estado inválido." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Solo admins autenticados pueden cambiar estados
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("turnos")
      .update({ estado, notas_admin: notas_admin || null })
      .eq("id", turnoId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "No se pudo actualizar el turno." },
        { status: 500 }
      );
    }

    return NextResponse.json({ turno: data });
  } catch (err) {
    console.error("Error en PATCH /api/turnos/[id]:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
