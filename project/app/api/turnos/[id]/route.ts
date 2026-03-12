// API route para actualizar el estado de un turno específico (PATCH)
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { EstadoTurno } from "@/types";

// PATCH /api/turnos/[id] — Actualiza el estado de un turno
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estado, notas_admin } = body as {
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
      .eq("id", id)
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
