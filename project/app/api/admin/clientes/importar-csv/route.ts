import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

function detectarSeparador(linea: string) {
  return (linea.match(/;/g) || []).length > (linea.match(/,/g) || []).length
    ? ";"
    : ",";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const archivo = formData.get("csv") as File | null;
    if (!archivo) {
      return NextResponse.json(
        { error: "No se recibió archivo." },
        { status: 400 },
      );
    }

    const contenido = await archivo.text();
    const lineas = contenido
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lineas.length < 2) {
      return NextResponse.json({ error: "El CSV no tiene datos." }, { status: 400 });
    }

    const sep = detectarSeparador(lineas[0]);
    const cabeceras = lineas[0].split(sep).map((c) => c.trim().toLowerCase());

    const idx = (nombre: string) => cabeceras.indexOf(nombre);

    if (idx("nombre") === -1 || idx("apellido") === -1 || idx("telefono") === -1) {
      return NextResponse.json(
        {
          error:
            "El CSV debe tener columnas: nombre, apellido, telefono (y opcionalmente: email, mascota_nombre, mascota_especie, mascota_raza).",
        },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    let cantidad = 0;

    for (const linea of lineas.slice(1)) {
      const cols = linea.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
      const nombre = cols[idx("nombre")] || "";
      const apellido = cols[idx("apellido")] || "";
      const telefono = cols[idx("telefono")] || "";
      if (!nombre || !apellido || !telefono) continue;

      const email = idx("email") >= 0 ? cols[idx("email")] || null : null;

      const { data: cliente, error } = await supabase
        .from("clientes")
        .upsert({ nombre, apellido, telefono, email }, { onConflict: "telefono" })
        .select()
        .single();

      if (error || !cliente) continue;
      cantidad++;

      const mascota_nombre = idx("mascota_nombre") >= 0 ? cols[idx("mascota_nombre")] || "" : "";
      if (mascota_nombre) {
        const mascota_especie =
          idx("mascota_especie") >= 0 ? cols[idx("mascota_especie")] || "otro" : "otro";
        const mascota_raza = idx("mascota_raza") >= 0 ? cols[idx("mascota_raza")] || null : null;
        const especies_validas = ["perro", "gato", "conejo", "ave", "otro"];
        await supabase.from("mascotas").insert({
          cliente_id: cliente.id,
          nombre: mascota_nombre,
          especie: especies_validas.includes(mascota_especie) ? mascota_especie : "otro",
          raza: mascota_raza,
        });
      }
    }

    return NextResponse.json({ cantidad }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno al importar." }, { status: 500 });
  }
}
