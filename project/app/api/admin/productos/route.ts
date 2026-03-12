// GET/POST /api/admin/productos — Lista y crea productos
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const soloActivos = searchParams.get("activos") === "true";

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
    const { nombre, descripcion, precio, categoria, imagen_url, stock } = body;

    if (!nombre || precio === undefined || !categoria) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("productos")
      .insert({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        precio: Number(precio),
        categoria,
        imagen_url: imagen_url || null,
        stock: Number(stock) || 0,
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
