// GET /api/productos — Productos activos para la tienda pública
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("activo", true)
      .order("categoria", { ascending: true })
      .order("nombre", { ascending: true });

    if (error) {
    return NextResponse.json({ error: "Error al obtener productos." }, { status: 500 });
    }

    return NextResponse.json({ productos: data || [] });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
