// Edge Function: notificar-pedido
// Envía WhatsApp al cliente cuando se confirma un pedido o está listo para retirar
// Invocar con: supabase.functions.invoke('notificar-pedido', { body: { tipo, pedido } })

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface ItemPedido {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

interface PedidoPayload {
  nombre: string;
  telefono: string;
  items: ItemPedido[];
  total: number;
  metodo_pago: string;
}

interface RequestBody {
  tipo: "confirmado" | "listo";
  pedido: PedidoPayload;
}

async function enviarWhatsApp(to: string, mensaje: string) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_WHATSAPP_FROM");

  if (!accountSid || !authToken || !from) {
    console.warn("Twilio no configurado");
    return;
  }

  const credentials = btoa(`${accountSid}:${authToken}`);

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: to, Body: mensaje }).toString(),
    }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { tipo, pedido }: RequestBody = await req.json();

    const numero = pedido.telefono.replace(/\D/g, "").replace(/^0/, "");
    const to = `whatsapp:+54${numero}`;

    let mensaje = "";

    if (tipo === "confirmado") {
      const listaItems = pedido.items
        .map(
          (i) =>
            `• ${i.nombre} x${i.cantidad} — $${(i.precio_unitario * i.cantidad).toLocaleString("es-AR")}`
        )
        .join("\n");

      const metodoPago =
        pedido.metodo_pago === "mercadopago" ? "Mercado Pago ✅" : "Efectivo al retirar";

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
    } else {
      return new Response(JSON.stringify({ error: "Tipo inválido." }), { status: 400 });
    }

    await enviarWhatsApp(to, mensaje);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error en notificar-pedido:", err);
    return new Response(JSON.stringify({ error: "Error interno." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
