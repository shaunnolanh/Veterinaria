// POST /api/crear-preferencia-mp — Crea preferencia de pago en Mercado Pago
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { ItemPedido } from "@/types";
import { sanitizeNumber, sanitizePhone, sanitizeText } from "@/lib/request-security";

export async function POST(request: NextRequest) {
  if (!process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "MP_ACCESS_TOKEN no configurado. Obtenerlo en mercadopago.com.ar/developers/panel" },
      { status: 503 }
    );
  }

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
      return NextResponse.json({ error: "Datos del pedido incompletos." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Crear el pedido en Supabase con estado pendiente
    const { data: pedido, error: errorPedido } = await supabase
      .from("pedidos")
      .insert({
        nombre,
        apellido,
        telefono,
        items,
        total,
        metodo_pago: "mercadopago",
        estado: "pendiente",
      })
      .select()
      .single();

    if (errorPedido || !pedido) {
      return NextResponse.json({ error: "No se pudo crear el pedido." }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    // Crear preferencia en Mercado Pago
    const preferencia = {
      items: items.map((item: any) => ({
        title: item.nombre,
        quantity: item.cantidad,
        unit_price: item.precio_unitario,
        currency_id: "ARS",
      })),
      payer: {
        name: nombre,
        surname: apellido,
        phone: { number: telefono },
      },
      back_urls: {
        success: `${baseUrl}/tienda/gracias?pedido=${pedido.id}`,
        failure: `${baseUrl}/tienda?error=pago`,
        pending: `${baseUrl}/tienda/gracias?pedido=${pedido.id}&pendiente=true`,
      },
      auto_return: "approved",
      external_reference: pedido.id,
      statement_descriptor: "PEON PETS",
    };

    const respuestaMP = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferencia),
      }
    );

    if (!respuestaMP.ok) {
      const err = await respuestaMP.json();
      console.error("Error Mercado Pago:", err);
      return NextResponse.json({ error: "No se pudo crear el pago." }, { status: 500 });
    }

    const datosMP = await respuestaMP.json();

    return NextResponse.json({
      pedidoId: pedido.id,
      init_point: datosMP.init_point, // URL de pago en producción
      sandbox_init_point: datosMP.sandbox_init_point, // URL de pago en sandbox
    });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
