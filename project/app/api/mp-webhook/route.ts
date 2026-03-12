// POST /api/mp-webhook — Recibe notificaciones de Mercado Pago
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

async function notificarPedidoConfirmado(pedido: {
  nombre: string;
  telefono: string;
  items: { nombre: string; cantidad: number; precio_unitario: number }[];
  total: number;
  metodo_pago: string;
}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) return;

  const numero = pedido.telefono.replace(/\D/g, "").replace(/^0/, "");
  const listaItems = pedido.items
    .map(
      (i) =>
        `• ${i.nombre} x${i.cantidad} — $${(i.precio_unitario * i.cantidad).toLocaleString("es-AR")}`
    )
    .join("\n");

  const mensaje = `🛒 ¡Hola ${pedido.nombre}! Recibimos tu pedido en Clínica Veterinaria Peón Pet's.

📦 Tu pedido:
${listaItems}

💰 Total: $${pedido.total.toLocaleString("es-AR")}
💳 Pago: Mercado Pago ✅
📍 Retiro en: Rivadavia 36, La Falda

Te avisamos cuando esté listo para retirar.
Ante cualquier duda llamanos al 03548-495677. 🌿`;

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: `whatsapp:+54${numero}`,
        Body: mensaje,
      }).toString(),
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // MP envía notifications de distintos tipos
    if (body.type !== "payment") {
      return NextResponse.json({ ok: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    // Consultar el pago en la API de MP
    const respuestaPago = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    if (!respuestaPago.ok) {
      console.error("No se pudo consultar el pago a MP:", paymentId);
      return NextResponse.json({ ok: true });
    }

    const pago = await respuestaPago.json();
    const pedidoId = pago.external_reference;
    const mpStatus = pago.status; // approved | pending | rejected

    if (!pedidoId) {
      return NextResponse.json({ ok: true });
    }

    const supabase = createAdminClient();

    // Actualizar el pedido
    const nuevoEstado = mpStatus === "approved" ? "confirmado" : "pendiente";

    const { data: pedido } = await supabase
      .from("pedidos")
      .update({
        mp_payment_id: String(paymentId),
        mp_status: mpStatus,
        estado: nuevoEstado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pedidoId)
      .select()
      .single();

    // Si el pago fue aprobado, notificar al cliente por WhatsApp
    if (mpStatus === "approved" && pedido) {
      await notificarPedidoConfirmado(pedido);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error webhook MP:", err);
    // Siempre devolver 200 para que MP no reintente
    return NextResponse.json({ ok: true });
  }
}
