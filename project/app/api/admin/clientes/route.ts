import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { sanitizeEmail, sanitizePhone, sanitizeText } from "@/lib/request-security";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = sanitizeText(searchParams.get("q"), 80).toLowerCase();

    const supabase = createAdminClient();
    let query = supabase
      .from("clientes")
      .select("id, nombre, apellido, email, telefono, created_at, mascotas(id, nombre, especie, raza)")
      .order("created_at", { ascending: false });

    if (q) {
      query = query.or(`nombre.ilike.%${q}%,apellido.ilike.%${q}%,telefono.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: "No se pudieron obtener los clientes." }, { status: 500 });
    }

    const clientes = (data || []).map((cliente) => {
      const mascotas = Array.isArray(cliente.mascotas) ? cliente.mascotas : [];
      const primera = mascotas[0] || null;
      return {
        ...cliente,
        mascotas_count: mascotas.length,
        primera_mascota_nombre: primera?.nombre || null,
        primera_mascota_especie: primera?.especie || null,
        primera_mascota_raza: primera?.raza || null,
      };
    });

    return NextResponse.json({ clientes });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nombre = sanitizeText(body.nombre, 80);
    const apellido = sanitizeText(body.apellido, 80);
    const telefono = sanitizePhone(body.telefono);
    const email = sanitizeEmail(body.email);

    if (!nombre || !apellido || !telefono) {
      return NextResponse.json({ error: "Nombre, apellido y teléfono son obligatorios." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("clientes")
      .insert({ nombre, apellido, telefono, email: email || null })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "No se pudo crear el cliente." }, { status: 500 });
    }

    return NextResponse.json({ cliente: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
