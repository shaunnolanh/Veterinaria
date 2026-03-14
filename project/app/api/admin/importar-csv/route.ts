import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { CategoriaProducto } from "@/types";

const CATEGORIAS_VALIDAS: CategoriaProducto[] = [
  "alimentos",
  "medicamentos",
  "accesorios",
  "antiparasitarios",
  "shampoos",
  "colchones",
];

function detectarSeparador(cabecera: string) {
  const comas = (cabecera.match(/,/g) || []).length;
  const puntosComa = (cabecera.match(/;/g) || []).length;
  return puntosComa > comas ? ";" : ",";
}

function normalizarCategoria(valor: string): CategoriaProducto {
  const limpia = (valor || "").trim().toLowerCase();
  return CATEGORIAS_VALIDAS.includes(limpia as CategoriaProducto)
    ? (limpia as CategoriaProducto)
    : "accesorios";
}

function parseNumero(valor: string) {
  const normalizado = (valor || "")
    .trim()
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const archivo = formData.get("csv") as File | null;

    if (!archivo) {
      return NextResponse.json({ error: "No se recibió el archivo CSV." }, { status: 400 });
    }

    const contenido = await archivo.text();
    const lineas = contenido
      .split(/\r?\n/)
      .map((linea) => linea.trim())
      .filter(Boolean);

    if (lineas.length < 2) {
      return NextResponse.json({ error: "El CSV no contiene filas de productos." }, { status: 400 });
    }

    const separador = detectarSeparador(lineas[0]);
    const cabeceras = lineas[0].split(separador).map((c) => c.trim().toLowerCase());

    const idxNombre = cabeceras.indexOf("nombre");
    const idxDescripcion = cabeceras.indexOf("descripcion");
    const idxPrecio = cabeceras.indexOf("precio");
    const idxCategoria = cabeceras.indexOf("categoria");
    const idxStock = cabeceras.indexOf("stock");

    if (idxNombre === -1 || idxPrecio === -1 || idxCategoria === -1) {
      return NextResponse.json(
        { error: "Cabeceras requeridas: nombre, precio, categoria (opcional: descripcion, stock)." },
        { status: 400 }
      );
    }

    const productos = lineas
      .slice(1)
      .map((linea) => {
        const cols = linea.split(separador).map((c) => c.trim());
        return {
          nombre: cols[idxNombre] || "",
          descripcion: idxDescripcion >= 0 ? cols[idxDescripcion] || null : null,
          precio: parseNumero(cols[idxPrecio] || "0"),
          categoria: normalizarCategoria(cols[idxCategoria] || "accesorios"),
          stock: Math.max(parseNumero(idxStock >= 0 ? cols[idxStock] || "0" : "0"), 0),
          activo: true,
        };
      })
      .filter((p) => p.nombre);

    if (!productos.length) {
      return NextResponse.json({ error: "No hay productos válidos para importar." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.from("productos").insert(productos).select();

    if (error) {
      return NextResponse.json({ error: "No se pudieron importar los productos." }, { status: 500 });
    }

    return NextResponse.json({ productos: data || [], cantidad: data?.length || 0 }, { status: 201 });
  } catch (error) {
    console.error("Error importar-csv:", error);
    return NextResponse.json({ error: "Error interno al importar CSV." }, { status: 500 });
  }
}
