import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { sanitizeDate, sanitizeNumber, sanitizeText } from "@/lib/request-security";

interface ItemSimple {
  [key: string]: string;
}

function sanitizeArray(value: unknown, fields: string[]): ItemSimple[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const clean: ItemSimple = {};
      for (const field of fields) {
        clean[field] = sanitizeText((row as Record<string, unknown>)[field], 120);
      }
      return clean;
    })
    .filter((row): row is ItemSimple => row !== null);
}

export async function GET(_request: NextRequest, context: { params: Promise<{ mascotaId: string }> }) {
  try {
    const { mascotaId } = await context.params;
    const id = sanitizeText(mascotaId, 64);

    if (!id) {
      return NextResponse.json({ error: "Mascota inválida." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("historial_clinico")
      .select("*")
      .eq("mascota_id", id)
      .order("fecha", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "No se pudo cargar el historial clínico." }, { status: 500 });
    }

    return NextResponse.json({ consultas: data || [] });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ mascotaId: string }> }) {
  try {
    const { mascotaId } = await context.params;
    const id = sanitizeText(mascotaId, 64);
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Mascota inválida." }, { status: 400 });
    }

    const payload = {
      mascota_id: id,
      fecha: sanitizeDate(body.fecha) || new Date().toISOString().slice(0, 10),
      veterinario_id: sanitizeText(body.veterinario_id, 64) || null,
      veterinario_nombre: sanitizeText(body.veterinario_nombre, 120) || null,
      motivo_consulta: sanitizeText(body.motivo_consulta, 1500) || null,
      anamnesis: sanitizeText(body.anamnesis, 4000) || null,
      peso_kg: sanitizeNumber(body.peso_kg, { min: 0, max: 200 }),
      temperatura_c: sanitizeNumber(body.temperatura_c, { min: 20, max: 45 }),
      frecuencia_cardiaca: sanitizeNumber(body.frecuencia_cardiaca, { min: 0, max: 400 }),
      frecuencia_respiratoria: sanitizeNumber(body.frecuencia_respiratoria, { min: 0, max: 300 }),
      condicion_corporal: sanitizeNumber(body.condicion_corporal, { min: 1, max: 9 }),
      mucosas: sanitizeText(body.mucosas, 400) || null,
      hidratacion: sanitizeText(body.hidratacion, 400) || null,
      ganglios_linfaticos: sanitizeText(body.ganglios_linfaticos, 400) || null,
      auscultacion: sanitizeText(body.auscultacion, 400) || null,
      examen_fisico_general: sanitizeText(body.examen_fisico_general, 4000) || null,
      diagnostico_presuntivo: sanitizeText(body.diagnostico_presuntivo, 2000) || null,
      diagnostico_definitivo: sanitizeText(body.diagnostico_definitivo, 2000) || null,
      tratamiento: sanitizeText(body.tratamiento, 3000) || null,
      indicaciones: sanitizeText(body.indicaciones, 3000) || null,
      medicamentos: sanitizeArray(body.medicamentos, ["nombre", "dosis", "frecuencia", "duracion"]),
      vacunas: sanitizeArray(body.vacunas, ["nombre", "laboratorio", "lote", "proxima_dosis"]),
      analisis_solicitados: sanitizeText(body.analisis_solicitados, 3000) || null,
      resultados_analisis: sanitizeText(body.resultados_analisis, 3000) || null,
      proxima_consulta: sanitizeDate(body.proxima_consulta) || null,
      observaciones_internas: sanitizeText(body.observaciones_internas, 4000) || null,
    };

    const supabase = createAdminClient();
    const { data, error } = await supabase.from("historial_clinico").insert(payload).select().single();

    if (error) {
      return NextResponse.json({ error: "No se pudo guardar la consulta." }, { status: 500 });
    }

    return NextResponse.json({ consulta: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
