// PATCH /api/admin/productos/[id] — Actualiza un producto (editar o desactivar)
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { sanitizeNumber, sanitizeText } from "@/lib/request-security";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productoId = sanitizeText(id, 64);
    const body = await request.json();
    const payload = {
      nombre: sanitizeText(body.nombre, 120),
      descripcion: sanitizeText(body.descripcion, 1000) || null,
      precio: sanitizeNumber(body.precio, { min: 0, max: 10_000_000 }),
      categoria: sanitizeText(body.categoria, 40),
      imagen_url: sanitizeText(body.imagen_url, 300) || null,
      stock: sanitizeNumber(body.stock, { min: 0, max: 1_000_000 }),
      activo: typeof body.activo === "boolean" ? body.activo : undefined,
    };

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("productos")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", productoId)
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
    const productoId = sanitizeText(id, 64);
    const formData = await request.formData();
    const archivo = formData.get("imagen") as File | null;

    if (!archivo) {
      return NextResponse.json({ error: "No se recibió imagen." }, { status: 400 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[admin/productos/:id POST] Falta SUPABASE_SERVICE_ROLE_KEY.");
      return NextResponse.json({ error: "Configuración de Supabase incompleta." }, { status: 500 });
    }

    const supabase = createAdminClient();
    const extension = archivo.name.split(".").pop() || "jpg";
    const nombreArchivo = `${productoId}.${extension}`;

    console.log("[admin/productos/:id POST] Subiendo imagen", {
      productoId: id,
      nombreArchivo,
      tipo: archivo.type,
      tamano: archivo.size,
      usaServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    });

    const arrayBuffer = await archivo.arrayBuffer();
    const { error: errorUpload } = await supabase.storage
      .from("productos-imagenes")
      .upload(nombreArchivo, arrayBuffer, {
        contentType: archivo.type,
        upsert: true,
      });

    if (errorUpload) {
      console.error("[admin/productos/:id POST] Error al subir a Storage:", errorUpload);
      return NextResponse.json({ error: "No se pudo subir la imagen." }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("productos-imagenes")
      .getPublicUrl(nombreArchivo);

    const publicUrl = urlData.publicUrl;
    console.log("[admin/productos/:id POST] URL pública generada", {
      productoId: id,
      publicUrl,
    });

    const { data: productoActualizado, error: errorUpdate } = await supabase
      .from("productos")
      .update({ imagen_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", productoId)
      .select("id, imagen_url")
      .single();

    if (errorUpdate) {
      console.error("[admin/productos/:id POST] Error al actualizar imagen_url:", errorUpdate);
      return NextResponse.json({ error: "No se pudo guardar la URL de la imagen." }, { status: 500 });
    }

    console.log("[admin/productos/:id POST] Producto actualizado", productoActualizado);

    return NextResponse.json({ imagen_url: publicUrl, producto: productoActualizado });
  } catch (error) {
    console.error("[admin/productos/:id POST] Error interno:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
