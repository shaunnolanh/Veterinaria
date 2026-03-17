import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { sanitizeNumber, sanitizeText } from "@/lib/request-security";

interface CheckoutBody {
  items: {
    producto_id: string;
    cantidad: number;
  }[];
  cliente?: {
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Falta configurar MERCADOPAGO_ACCESS_TOKEN." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as CheckoutBody;
    body.items = (Array.isArray(body.items) ? body.items : []).map((item) => ({
      producto_id: sanitizeText(item?.producto_id, 64),
      cantidad: sanitizeNumber(item?.cantidad, { min: 1, max: 999 }) || 0,
    }));
    if (!body.items?.length) {
      return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
    }

    const cliente = {
      nombre: sanitizeText(body.cliente?.nombre, 80),
      apellido: sanitizeText(body.cliente?.apellido, 80),
      email: sanitizeText(body.cliente?.email, 120),
      telefono: sanitizeText(body.cliente?.telefono, 30),
    };

    if (!cliente.nombre || !cliente.apellido || !cliente.email || !cliente.telefono) {
      return NextResponse.json({ error: "Completá los datos del cliente para continuar." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const ids = body.items.map((item) => item.producto_id);

    const { data: productos, error: productosError } = await supabase
      .from("productos")
      .select("id, nombre, precio, stock, activo")
      .in("id", ids)
      .eq("activo", true);

    if (productosError || !productos?.length) {
      return NextResponse.json({ error: "No se pudieron obtener los productos." }, { status: 400 });
    }

    const itemsNormalizados = body.items
      .map((item) => {
        const producto = productos.find((p) => p.id === item.producto_id);
        if (!producto || item.cantidad <= 0) return null;
        if ((producto.stock || 0) < item.cantidad) {
          throw new Error(`Stock insuficiente para ${producto.nombre}.`);
        }

        return {
          producto_id: producto.id,
          nombre: producto.nombre,
          cantidad: item.cantidad,
          precio_unitario: Number(producto.precio),
        };
      })
      .filter(Boolean) as {
      producto_id: string;
      nombre: string;
      cantidad: number;
      precio_unitario: number;
    }[];

    if (!itemsNormalizados.length) {
      return NextResponse.json({ error: "No hay items válidos para pagar." }, { status: 400 });
    }

    const total = itemsNormalizados.reduce(
      (acc, item) => acc + item.precio_unitario * item.cantidad,
      0
    );

    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .insert({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        telefono: cliente.telefono,
        items: itemsNormalizados,
        total,
        metodo_pago: "mercadopago",
        estado: "pendiente",
      })
      .select("id")
      .single();

    if (pedidoError || !pedido) {
      return NextResponse.json({ error: "No se pudo registrar el pedido." }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const preferencia = {
      items: itemsNormalizados.map((item) => ({
        title: item.nombre,
        quantity: item.cantidad,
        unit_price: item.precio_unitario,
        currency_id: "ARS",
      })),
      external_reference: pedido.id,
      back_urls: {
        success: `${baseUrl}/tienda/gracias?pedido=${pedido.id}`,
        failure: `${baseUrl}/tienda/fallo?pedido=${pedido.id}`,
        pending: `${baseUrl}/tienda/pendiente?pedido=${pedido.id}`,
      },
      
      notification_url: `${baseUrl}/api/mp-webhook`,
      statement_descriptor: "PEON PETS",
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferencia),
    });

    const mpData = await mpRes.json();
    if (!mpRes.ok) {
     console.error("MP Error:", JSON.stringify(mpData));
     return NextResponse.json({ error: mpData.message || "No se pudo crear la preferencia de pago." }, { status: 500 });
   }

    return NextResponse.json({ init_point: mpData.init_point, preference_id: mpData.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno de checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
