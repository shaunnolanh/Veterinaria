// GET /api/admin/pedidos — Lista pedidos con filtros
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { EstadoPedido } from "@/types";
import { sanitizeText } from "@/lib/request-security";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = sanitizeText(searchParams.get("estado"), 20) as EstadoPedido | "todos" | "";
    const periodo = sanitizeText(searchParams.get("periodo"), 20) || "todos"; // hoy | semana | todos

    const supabase = createAdminClient();
    let query = supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });

    if (estado && estado !== "todos") {
      query = query.eq("estado", estado);
    }

    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    const fechaHoy = `${yyyy}-${mm}-${dd}`;

    if (periodo === "hoy") {
      query = query.gte("created_at", `${fechaHoy}T00:00:00`).lte("created_at", `${fechaHoy}T23:59:59`);
    } else if (periodo === "semana") {
      const fin = new Date(hoy);
      fin.setDate(fin.getDate() + 7);
      const fY = fin.getFullYear();
      const fM = String(fin.getMonth() + 1).padStart(2, "0");
      const fD = String(fin.getDate()).padStart(2, "0");
      query = query.gte("created_at", `${fechaHoy}T00:00:00`).lte("created_at", `${fY}-${fM}-${fD}T23:59:59`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Error al obtener pedidos." }, { status: 500 });
    }

    return NextResponse.json({ pedidos: data || [] });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
