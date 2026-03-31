import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { sanitizeEmail, sanitizePhone, sanitizeText } from "@/lib/request-security";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const clienteId = sanitizeText(id, 64);

    if (!clienteId) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", clienteId)
      .single();

    if (clienteError || !cliente) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const { data: mascotas, error: mascotasError } = await supabase
      .from("mascotas")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false });

    if (mascotasError) {
      return NextResponse.json({ error: "No se pudieron obtener las mascotas." }, { status: 500 });
    }

    return NextResponse.json({ cliente, mascotas: mascotas || [] });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const clienteId = sanitizeText(id, 64);
    const body = await request.json();

    if (!clienteId) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const payload = {
      nombre: sanitizeText(body.nombre, 80),
      apellido: sanitizeText(body.apellido, 80),
      telefono: sanitizePhone(body.telefono),
      email: sanitizeEmail(body.email) || null,
      updated_at: new Date().toISOString(),
    };

    if (!payload.nombre || !payload.apellido || !payload.telefono) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("clientes")
      .update(payload)
      .eq("id", clienteId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "No se pudo actualizar el cliente." }, { status: 500 });
    }

    return NextResponse.json({ cliente: data });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
