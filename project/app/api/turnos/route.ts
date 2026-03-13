// API route para crear nuevos turnos (POST) y listar turnos (GET)
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { esDiaLaboral, generarSlotsDelDia } from "@/lib/horarios";
import { emailTurnoRecibido } from "@/lib/emails";

// POST /api/turnos — Crea un nuevo turno
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, apellido, telefono, email, mascota, especie, motivo, fecha, hora, especialidad } = body;

    // Validaciones del lado del servidor
    if (!nombre || !apellido || !telefono || !mascota || !especie || !fecha || !hora) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios." },
        { status: 400 }
      );
    }

    const especialidadFinal = especialidad || "clinica";
    const especialidadesValidas = ["clinica", "dermatologia", "oftalmologia", "endocrinologia"];
    if (!especialidadesValidas.includes(especialidadFinal)) {
      return NextResponse.json({ error: "Especialidad inválida." }, { status: 400 });
    }

    // Para clínica general, verificar día laboral y slots válidos
    if (especialidadFinal === "clinica") {
      const fechaDate = new Date(fecha + "T12:00:00");
      if (!esDiaLaboral(fechaDate)) {
        return NextResponse.json(
          { error: "Solo se pueden sacar turnos de lunes a viernes." },
          { status: 400 }
        );
      }
      const slotsValidos = generarSlotsDelDia();
      if (!slotsValidos.includes(hora)) {
        return NextResponse.json(
          { error: "El horario seleccionado no es válido." },
          { status: 400 }
        );
      }
    }

    const supabase = await createServerSupabaseClient();

    // Verificar que el slot no esté ya ocupado
    const { data: turnoExistente } = await supabase
      .from("turnos")
      .select("id")
      .eq("fecha", fecha)
      .eq("hora", hora)
      .neq("estado", "cancelado")
      .single();

    if (turnoExistente) {
      return NextResponse.json(
        { error: "Ese horario ya está ocupado. Por favor elegí otro." },
        { status: 409 }
      );
    }

    // Verificar que no haya bloqueo total del día
    const { data: diaCompleto } = await supabase
      .from("horarios_bloqueados")
      .select("id")
      .eq("fecha", fecha)
      .is("hora", null)
      .single();

    if (diaCompleto) {
      return NextResponse.json(
        { error: "Ese día no hay atención. Por favor elegí otro día." },
        { status: 409 }
      );
    }

    // Crear el turno
    const { data: nuevoTurno, error } = await supabase
      .from("turnos")
      .insert({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        mascota: mascota.trim(),
        especie,
        motivo: motivo?.trim() || null,
        email: email?.trim() || null,
        fecha,
        hora,
        especialidad: especialidadFinal,
        estado: "pendiente",
      })
      .select()
      .single();

    if (error) {
      console.error("Error al crear turno:", error);
      return NextResponse.json(
        { error: "No se pudo guardar el turno. Intentá de nuevo." },
        { status: 500 }
      );
    }

await emailTurnoRecibido({
      email: nuevoTurno.email,
      nombre: nuevoTurno.nombre,
      fecha: nuevoTurno.fecha,
      hora: nuevoTurno.hora,
      mascota: nuevoTurno.mascota,
      especie: nuevoTurno.especie,
      motivo: nuevoTurno.motivo,
    });

    return NextResponse.json({ turno: nuevoTurno }, { status: 201 });
  } catch (err) {
    console.error("Error en POST /api/turnos:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
