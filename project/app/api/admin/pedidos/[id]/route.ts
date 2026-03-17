// PATCH /api/admin/pedidos/[id] — Actualiza estado de un pedido
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { EstadoPedido } from "@/types";
import { sanitizeText } from "@/lib/request-security";
import { emailPedidoConfirmado, emailPedidoListo, emailPedidoRetirado } from "@/lib/emails";

async function notificarPedidoPorWhatsApp(
  telefono: string,
  tipo: "confirmado" | "listo",
  pedido: { nombre: string; items: { nombre: string; cantidad: number; precio_unitario: number }[]; total: number; metodo_pago: string }
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    console.warn("Twilio no configurado, omitiendo WhatsApp.");
    return;
  }

  const numero = telefono.replace(/\D/g, "").replace(/^0/, "");
  const to = `whatsapp:+54${numero}`;

  let mensaje = "";

  if (tipo === "confirmado") {
    const listaItems = pedido.items
      .map((i) => `• ${i.nombre} x${i.cantidad} — $${(i.precio_unitario * i.cantidad).toLocaleString("es-AR")}`)
      .join("\n");

    const metodoPago = pedido.metodo_pago === "mercadopago" ? "Mercado Pago ✅" : "Efectivo al retirar";

    mensaje = `🛒 ¡Hola ${pedido.nombre}! Recibimos tu pedido en Clínica Veterinaria Peón Pet's.

📦 Tu pedido:
${listaItems}

💰 Total: $${pedido.total.toLocaleString("es-AR")}
💳 Pago: ${metodoPago}
📍 Retiro en: Rivadavia 36, La Falda

Te avisamos cuando esté listo para retirar.
Ante cualquier duda llamanos al 03548-495677. 🌿`;
  } else if (tipo === "listo") {
    mensaje = `✅ ¡${pedido.nombre}, tu pedido está listo!

Podés pasar a retirarlo cuando quieras por:
📍 Rivadavia 36, La Falda
🕐 Horario: Lun-Vie 9-13 y 16-20

¡Te esperamos! 🐾`;
  }

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: to, Body: mensaje }).toString(),
    }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pedidoId = sanitizeText(id, 64);
    const body = await request.json();
    const estado = sanitizeText(body.estado, 20) as EstadoPedido;

    const estadosValidos: EstadoPedido[] = ["pendiente", "confirmado", "listo", "retirado", "cancelado"];
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: pedido, error: errorGet } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", pedidoId)
      .single();

    if (errorGet || !pedido) {
      return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
    }

    const { data: pedidoActualizado, error: errorUpdate } = await supabase
      .from("pedidos")
      .update({ estado, updated_at: new Date().toISOString() })
      .eq("id", pedidoId)
      .select()
      .single();

    if (errorUpdate) {
      return NextResponse.json({ error: "No se pudo actualizar el pedido." }, { status: 500 });
    }

    // Enviar WhatsApp según el nuevo estado
    if (estado === "confirmado") {
      await notificarPedidoPorWhatsApp(pedido.telefono, "confirmado", pedido);
    } else if (estado === "listo") {
      await notificarPedidoPorWhatsApp(pedido.telefono, "listo", pedido);
    }

    if (estado === "confirmado") {
      await emailPedidoConfirmado({ email: pedido.email, nombre: pedido.nombre });
    } else if (estado === "listo") {
      await emailPedidoListo({ email: pedido.email, nombre: pedido.nombre });
    } else if (estado === "retirado") {
      await emailPedidoRetirado({ email: pedido.email, nombre: pedido.nombre });
    }

    return NextResponse.json({ pedido: pedidoActualizado });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
