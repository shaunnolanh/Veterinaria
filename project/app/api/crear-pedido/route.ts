// POST /api/crear-pedido — Crea un pedido en efectivo y envía WhatsApp
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { ItemPedido } from "@/types";
import { sanitizeNumber, sanitizePhone, sanitizeText } from "@/lib/request-security";

async function notificarWhatsApp(
  telefono: string,
  nombre: string,
  items: ItemPedido[],
  total: number
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!accountSid || !authToken || !from) return;

  const numero = telefono.replace(/\D/g, "").replace(/^0/, "");
  const listaItems = items
    .map((i) => `• ${i.nombre} x${i.cantidad} — $${(i.precio_unitario * i.cantidad).toLocaleString("es-AR")}`)
    .join("\n");

  const mensaje = `🛒 ¡Hola ${nombre}! Recibimos tu pedido en Clínica Veterinaria Peón Pet's.

📦 Tu pedido:
${listaItems}

💰 Total: $${total.toLocaleString("es-AR")}
💵 Pago: Efectivo al retirar
📍 Retiro en: Rivadavia 36, La Falda

Te avisamos cuando esté listo para retirar.
Ante cualquier duda llamanos al 03548-495677. 🌿`;

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
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
    const nombre = sanitizeText(body.nombre, 80);
    const apellido = sanitizeText(body.apellido, 80);
    const telefono = sanitizePhone(body.telefono);
    const items: ItemPedido[] = (Array.isArray(body.items) ? body.items : [])
      .map((item: any) => ({
        producto_id: sanitizeText(item?.producto_id, 64),
        nombre: sanitizeText(item?.nombre, 120),
        cantidad: sanitizeNumber(item?.cantidad, { min: 1, max: 999 }) || 0,
        precio_unitario: sanitizeNumber(item?.precio_unitario, { min: 0, max: 10_000_000 }) || 0,
      }))
      .filter((item: ItemPedido) => item.nombre && item.cantidad > 0);
    const total = sanitizeNumber(body.total, { min: 0, max: 10_000_000 }) || 0;

    const _typed = body as {
      nombre: string;
      apellido: string;
      telefono: string;
      items: ItemPedido[];
      total: number;
    };

    if (!nombre || !apellido || !telefono || !items?.length) {
      return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: pedido, error } = await supabase
      .from("pedidos")
      .insert({
        nombre,
        apellido,
        telefono,
        items,
        total,
        metodo_pago: "efectivo",
        estado: "confirmado", // efectivo → confirmado directo
      })
      .select()
      .single();

    if (error || !pedido) {
      return NextResponse.json({ error: "No se pudo crear el pedido." }, { status: 500 });
    }

    // Notificar al cliente por WhatsApp
    await notificarWhatsApp(telefono, nombre, items, total);

    return NextResponse.json({ pedidoId: pedido.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
