// POST /api/admin/cambiar-estado — Cambia estado de un turno y envía email
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { EstadoTurno } from "@/types";
import { emailTurnoConfirmado, emailTurnoCancelado, emailRecordatorio } from "@/lib/emails";
import { sanitizeText } from "@/lib/request-security";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const turnoId = sanitizeText(body.turnoId, 64);
    const estado = sanitizeText(body.estado, 20) as EstadoTurno;
    const notasAdmin = sanitizeText(body.notasAdmin, 500) || null;

    const _typed = body as {
      turnoId: string;
      estado: EstadoTurno;
      notasAdmin?: string;
    };

    const estadosValidos: EstadoTurno[] = ["pendiente", "confirmado", "cancelado"];
    if (!turnoId || !estadosValidos.includes(estado)) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Obtener el turno actual
    const { data: turno, error: errorGet } = await supabase
      .from("turnos")
      .select("*")
      .eq("id", turnoId)
      .single();

    if (errorGet || !turno) {
      return NextResponse.json({ error: "Turno no encontrado." }, { status: 404 });
    }

    // Actualizar estado
    const { data: turnoActualizado, error: errorUpdate } = await supabase
      .from("turnos")
      .update({ estado, notas_admin: notasAdmin || null })
      .eq("id", turnoId)
      .select()
      .single();

    if (errorUpdate) {
      return NextResponse.json({ error: "No se pudo actualizar el turno." }, { status: 500 });
    }

    // Enviar email según el nuevo estado
    if (estado === "confirmado") {
      await emailTurnoConfirmado({
        email: turno.email,
        nombre: turno.nombre,
        fecha: turno.fecha,
        hora: turno.hora,
        mascota: turno.mascota,
      });

      // Si el turno es en menos de 2 horas, mandar recordatorio inmediatamente
      const ahora = new Date();
      const fechaHoraTurno = new Date(`${turno.fecha}T${turno.hora}:00`);
      const diffHoras = (fechaHoraTurno.getTime() - ahora.getTime()) / (1000 * 60 * 60);

      if (diffHoras > 0 && diffHoras < 2) {
        await emailRecordatorio({
          email: turno.email,
          nombre: turno.nombre,
          hora: turno.hora,
          mascota: turno.mascota,
          motivo: turno.motivo,
        });
      }
    } else if (estado === "cancelado") {
      await emailTurnoCancelado({
        email: turno.email,
        nombre: turno.nombre,
        mascota: turno.mascota,
      });
    }

    return NextResponse.json({ turno: turnoActualizado });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}