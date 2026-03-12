// POST /api/admin/cambiar-estado — Cambia estado de un turno y envía WhatsApp
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { EstadoTurno } from "@/types";
import { verificarSesionToken } from "@/lib/auth";

async function enviarWhatsApp(telefono: string, mensaje: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // whatsapp:+14155238886

  if (!accountSid || !authToken || !from) {
    console.warn("Twilio no configurado, omitiendo WhatsApp.");
    return false;
  }

  // Normalizar teléfono: quitar todo lo que no sea número
  const numeroLimpio = telefono.replace(/\D/g, "");
  // Si empieza con 0, sacar el 0 (ej: 03548... → 3548...)
  const numero = numeroLimpio.startsWith("0") ? numeroLimpio.slice(1) : numeroLimpio;
  const to = `whatsapp:+54${numero}`;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: to, Body: mensaje }).toString(),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Error Twilio:", err);
    return false;
  }
  return true;
}

function mensajeConfirmacion(turno: {
  nombre: string;
  mascota: string;
  especie: string;
  fecha: string;
  hora: string;
  motivo: string;
}) {
  return `🟢 ¡Hola ${turno.nombre}! Te confirmamos tu turno en Clínica Veterinaria Peón Pet's.

🐾 Mascota: ${turno.mascota} (${turno.especie})
📅 Fecha: ${turno.fecha} a las ${turno.hora}hs
📋 Motivo: ${turno.motivo || "Consulta general"}
📍 Rivadavia 36, La Falda

¡Te esperamos! 🌿
Ante cualquier duda: 📞 03548-495677`;
}

function mensajeCancelacion(turno: {
  nombre: string;
  mascota: string;
  fecha: string;
  hora: string;
}) {
  return `❌ Hola ${turno.nombre}, lamentablemente tuvimos que cancelar el turno de ${turno.mascota} del ${turno.fecha} a las ${turno.hora}hs.

Por favor comunicate con nosotros para reprogramarlo:
📞 03548-495677
💬 WhatsApp: 03548 15-63-2527`;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_session")?.value;
    const autenticado = token ? await verificarSesionToken(token) : false;
    if (!autenticado) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { turnoId, estado, notasAdmin } = await request.json() as {
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

    // Enviar WhatsApp según el nuevo estado
    if (estado === "confirmado") {
      const mensaje = mensajeConfirmacion(turno);
      await enviarWhatsApp(turno.telefono, mensaje);

      // Lógica de recordatorio: si el turno es en menos de 2 horas, mandar recordatorio ahora
      const ahora = new Date();
      const fechaHoraTurno = new Date(`${turno.fecha}T${turno.hora}:00`);
      const diffMs = fechaHoraTurno.getTime() - ahora.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);

      if (diffHoras > 0 && diffHoras < 2) {
        // Turno en menos de 2hs → mandar recordatorio inmediatamente
        const recordatorio = `🔔 ¡Hola ${turno.nombre}! Te recordamos que hoy a las ${turno.hora} tenés turno en Clínica Veterinaria Peón Pet's.

🐾 Mascota: ${turno.mascota} (${turno.especie})
📋 Motivo: ${turno.motivo || "Consulta general"}
📍 Rivadavia 36, La Falda

¡Te esperamos! 🌿`;
        await enviarWhatsApp(turno.telefono, recordatorio);
      }
    } else if (estado === "cancelado") {
      const mensaje = mensajeCancelacion(turno);
      await enviarWhatsApp(turno.telefono, mensaje);
    }

    return NextResponse.json({ turno: turnoActualizado });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
