import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

// Mapeo de nombres de categoría del CSV a los valores de la base de datos
const CATEGORIA_MAP: Record<string, string> = {
  "alimentos y bolsas": "alimentos",
  "alimentos":          "alimentos",
  "medicamentos":       "medicamentos",
  "accesorios":         "accesorios",
  "antiparasitarios":   "antiparasitarios",
  "shampoos y grooming":"grooming",
  "grooming":           "grooming",
  "colchones y cuchas": "colchones",
  "colchones":          "colchones",
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const archivo = formData.get("csv") as File | null;

    if (!archivo) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
    }

    const texto = await archivo.text();
    const lineas = texto.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lineas.length < 2) {
      return NextResponse.json({ error: "El CSV está vacío o no tiene datos." }, { status: 400 });
    }

    // Primera línea = encabezados, ignorarla
    const filas = lineas.slice(1);

    const productos = [];
    const errores = [];

    for (let i = 0; i < filas.length; i++) {
      const cols = filas[i].split(",").map((c) => c.trim());

      // Espera: nombre, descripcion, precio, stock, categoria
      if (cols.length < 5) {
        errores.push(`Fila ${i + 2}: columnas insuficientes`);
        continue;
      }

      const [nombre, descripcion, precioStr, stockStr, categoriaRaw] = cols;

      const precio = Number(precioStr);
      const stock = Number(stockStr);

      if (!nombre) {
        errores.push(`Fila ${i + 2}: nombre vacío`);
        continue;
      }
      if (isNaN(precio) || precio < 0) {
        errores.push(`Fila ${i + 2}: precio inválido "${precioStr}"`);
        continue;
      }

      const categoriaKey = categoriaRaw.toLowerCase();
      const categoria = CATEGORIA_MAP[categoriaKey];

      if (!categoria) {
        errores.push(`Fila ${i + 2}: categoría desconocida "${categoriaRaw}"`);
        continue;
      }

      productos.push({
        nombre,
        descripcion: descripcion || null,
        precio,
        stock: isNaN(stock) ? 0 : stock,
        categoria,
        activo: true,
      });
    }

    if (productos.length === 0) {
      return NextResponse.json(
        { error: "No se pudo procesar ningún producto.", errores },
        { status: 400 }
      );
    }

    return NextResponse.json({ productos, errores });
  } catch (err) {
    console.error("Error al importar CSV:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
