import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

function esc(value: string | null) {
  if (!value) return "";
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("clientes")
      .select("nombre, apellido, email, telefono, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "No se pudo exportar el CSV." }, { status: 500 });
    }

    const header = "nombre,apellido,email,telefono,fecha_alta";
    const rows = (data || []).map((c) =>
      [esc(c.nombre), esc(c.apellido), esc(c.email), esc(c.telefono), esc(c.created_at?.slice(0, 10) || "")].join(",")
    );
    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="clientes-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
