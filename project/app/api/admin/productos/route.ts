// GET/POST /api/admin/productos — Lista y crea productos
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { sanitizeNumber, sanitizeText } from "@/lib/request-security";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const soloActivos = sanitizeText(searchParams.get("activos"), 10) === "true";

    const supabase = createAdminClient();
    let query = supabase
      .from("productos")
      .select("*")
      .order("categoria", { ascending: true })
      .order("nombre", { ascending: true });

    if (soloActivos) {
      query = query.eq("activo", true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Error al obtener productos." }, { status: 500 });
    }

    return NextResponse.json({ productos: data || [] });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nombre = sanitizeText(body.nombre, 120);
    const descripcion = sanitizeText(body.descripcion, 1000);
    const precio = sanitizeNumber(body.precio, { min: 0, max: 10_000_000 });
    const categoria = sanitizeText(body.categoria, 40);
    const imagen_url = sanitizeText(body.imagen_url, 300);
    const stock = sanitizeNumber(body.stock, { min: 0, max: 1_000_000 });

    if (!nombre || precio === undefined || !categoria) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("productos")
      .insert({
        nombre,
        descripcion: descripcion || null,
        precio: precio ?? 0,
        categoria,
        imagen_url: imagen_url || null,
        stock: stock ?? 0,
        activo: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "No se pudo crear el producto." }, { status: 500 });
    }

    return NextResponse.json({ producto: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
