// PATCH /api/admin/productos/[id] — Actualiza un producto (editar o desactivar)
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("productos")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "No se pudo actualizar el producto." }, { status: 500 });
    }

    return NextResponse.json({ producto: data });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

// Subir imagen a Supabase Storage
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const archivo = formData.get("imagen") as File | null;

    if (!archivo) {
      return NextResponse.json({ error: "No se recibió imagen." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const extension = archivo.name.split(".").pop();
    const nombreArchivo = `${id}.${extension}`;

    const arrayBuffer = await archivo.arrayBuffer();
    const { error: errorUpload } = await supabase.storage
      .from("productos-imagenes")
      .upload(nombreArchivo, arrayBuffer, {
        contentType: archivo.type,
        upsert: true,
      });

    if (errorUpload) {
      return NextResponse.json({ error: "No se pudo subir la imagen." }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("productos-imagenes")
      .getPublicUrl(nombreArchivo);

    // Actualizar la imagen_url del producto
    await supabase
      .from("productos")
      .update({ imagen_url: urlData.publicUrl, updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ imagen_url: urlData.publicUrl });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
