// Lógica de horarios disponibles para el sistema de turnos
import { HORARIOS_ATENCION, SlotHorario } from "@/types";

// Genera todos los slots de tiempo de un día según los horarios de la clínica
export function generarSlotsDelDia(): string[] {
  const slots: string[] = [];
  const { duracionTurno } = HORARIOS_ATENCION;

  // Slots de la mañana: 9:00 a 13:00
  let [horaM, minM] = HORARIOS_ATENCION.manana.inicio.split(":").map(Number);
  const [horaFinM, minFinM] = HORARIOS_ATENCION.manana.fin.split(":").map(Number);
  while (horaM * 60 + minM < horaFinM * 60 + minFinM) {
    slots.push(`${String(horaM).padStart(2, "0")}:${String(minM).padStart(2, "0")}`);
    minM += duracionTurno;
    if (minM >= 60) {
      horaM += 1;
      minM -= 60;
    }
  }

  // Slots de la tarde: 16:00 a 20:00
  let [horaT, minT] = HORARIOS_ATENCION.tarde.inicio.split(":").map(Number);
  const [horaFinT, minFinT] = HORARIOS_ATENCION.tarde.fin.split(":").map(Number);
  while (horaT * 60 + minT < horaFinT * 60 + minFinT) {
    slots.push(`${String(horaT).padStart(2, "0")}:${String(minT).padStart(2, "0")}`);
    minT += duracionTurno;
    if (minT >= 60) {
      horaT += 1;
      minT -= 60;
    }
  }

  return slots;
}

// Determina si una fecha es día laboral (lunes a viernes)
export function esDiaLaboral(fecha: Date): boolean {
  const diaSemana = fecha.getDay(); // 0=Domingo, 6=Sábado
  return HORARIOS_ATENCION.diasSemana.includes(diaSemana);
}

// Formatea una fecha a YYYY-MM-DD en zona local (sin problemas de UTC)
export function formatearFecha(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Formatea hora para mostrar (HH:MM → H:MM AM/PM en estilo argentino: solo HH:MM)
export function formatearHora(hora: string): string {
  return hora;
}

// Nombre del día en español
export function nombreDia(fecha: Date): string {
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return dias[fecha.getDay()];
}

// Nombre del mes en español
export function nombreMes(mes: number): string {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return meses[mes];
}

// Genera los slots con disponibilidad para una fecha específica
export function generarSlotsConDisponibilidad(
  turnosOcupados: string[]
): SlotHorario[] {
  const todosLosSlots = generarSlotsDelDia();
  return todosLosSlots.map((hora) => ({
    hora,
    disponible: !turnosOcupados.includes(hora),
  }));
}
