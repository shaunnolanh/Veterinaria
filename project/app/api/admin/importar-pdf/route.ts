// POST /api/admin/importar-pdf — Extrae productos de un PDF usando Claude API
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const PROMPT = `Analizá esta lista de productos de una clínica veterinaria y devolvé SOLO un JSON válido con este formato, sin texto adicional:
[
  {
    "nombre": "nombre del producto",
    "descripcion": "descripcion breve",
    "precio": 1234.56,
    "categoria": "una de: alimentos|medicamentos|accesorios|antiparasitarios|shampoos|colchones",
    "stock": 10
  }
]
Si el precio no está claro, poné 0. Categorizá lo mejor posible según el nombre del producto.`;

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY no configurada. Agregala en .env.local" },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const archivo = formData.get("pdf") as File | null;

    if (!archivo || archivo.type !== "application/pdf") {
      return NextResponse.json({ error: "Se requiere un archivo PDF." }, { status: 400 });
    }

    if (archivo.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El PDF no puede superar 10MB." }, { status: 400 });
    }

    const arrayBuffer = await archivo.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const respuesta = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            },
            {
              type: "text",
              text: PROMPT,
            },
          ],
        },
      ],
    });

    const textoRespuesta =
      respuesta.content[0].type === "text" ? respuesta.content[0].text : "";

    // Limpiar posibles bloques de código markdown
    const jsonLimpio = textoRespuesta
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const productos = JSON.parse(jsonLimpio);

    if (!Array.isArray(productos)) {
      throw new Error("La respuesta no es un array válido.");
    }

    return NextResponse.json({ productos });
  } catch (err) {
    console.error("Error importar-pdf:", err);
    return NextResponse.json(
      { error: "No se pudo procesar el PDF. Intentá con otro archivo." },
      { status: 500 }
    );
  }
}
