// Emails transaccionales con Resend — Clínica Veterinaria Peón Pet's
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev";

function fmtFecha(fecha: string) {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

async function enviar(to: string, subject: string, text: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY no configurado, omitiendo.");
    return;
  }
  const { error } = await resend.emails.send({ from: FROM, to, subject, text });
  if (error) console.error("[Resend] Error:", error);
}

// ─── Turnos ──────────────────────────────────────────────────────────────────

export async function emailTurnoRecibido(t: {
  email?: string | null;
  nombre: string;
  fecha: string;
  hora: string;
  mascota: string;
  especie: string;
  motivo?: string | null;
}) {
  if (!t.email) { console.warn("[email] Turno sin email, omitiendo."); return; }
  await enviar(
    t.email,
    "Tu turno en Peón Pet's fue recibido",
    `Hola ${t.nombre}, recibimos tu solicitud de turno.\n\nFecha: ${fmtFecha(t.fecha)} - Hora: ${t.hora}\nMascota: ${t.mascota} (${t.especie})\nMotivo: ${t.motivo || "No especificado"}\n\nTe confirmamos a la brevedad. Consultas: 03548-495677`
  );
}

export async function emailTurnoConfirmado(t: {
  email?: string | null;
  nombre: string;
  fecha: string;
  hora: string;
  mascota: string;
}) {
  if (!t.email) { console.warn("[email] Turno sin email, omitiendo."); return; }
  await enviar(
    t.email,
    "✅ Tu turno está confirmado — Peón Pet's",
    `Hola ${t.nombre}, tu turno fue confirmado.\n\nFecha: ${fmtFecha(t.fecha)} - Hora: ${t.hora}\nMascota: ${t.mascota}\n\nTe esperamos en Rivadavia 36, La Falda.`
  );
}

export async function emailTurnoCancelado(t: {
  email?: string | null;
  nombre: string;
  mascota: string;
}) {
  if (!t.email) { console.warn("[email] Turno sin email, omitiendo."); return; }
  await enviar(
    t.email,
    "Tu turno fue cancelado — Peón Pet's",
    `Hola ${t.nombre}, lamentablemente tuvimos que cancelar el turno de ${t.mascota}.\n\nPara reprogramar: 03548-495677 o WhatsApp 03548 15-63-2527`
  );
}

export async function emailRecordatorio(t: {
  email?: string | null;
  nombre: string;
  hora: string;
  mascota: string;
  motivo?: string | null;
}) {
  if (!t.email) { console.warn("[email] Turno sin email, omitiendo."); return; }
  await enviar(
    t.email,
    "🔔 Recordatorio — Hoy tenés turno en Peón Pet's",
    `Hola ${t.nombre}, te recordamos que hoy a las ${t.hora} tenés turno.\n\nMascota: ${t.mascota} - Motivo: ${t.motivo || "Consulta general"}\n\nDirección: Rivadavia 36, La Falda`
  );
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────

export async function emailPedidoRecibido(p: {
  email?: string | null;
  nombre: string;
  items: { nombre: string; cantidad: number; precio_unitario: number }[];
  total: number;
}) {
  if (!p.email) { console.warn("[email] Pedido sin email, omitiendo."); return; }
  const lista = p.items
    .map((i) => `• ${i.nombre} x${i.cantidad} — $${(i.precio_unitario * i.cantidad).toLocaleString("es-AR")}`)
    .join("\n");
  await enviar(
    p.email,
    "Tu pedido fue recibido — Peón Pet's",
    `Hola ${p.nombre}, recibimos tu pedido.\n\n${lista}\n\nTotal: $${p.total.toLocaleString("es-AR")}\n\nTe avisamos cuando esté listo para retirar en Rivadavia 36, La Falda.`
  );
}

export async function emailPedidoListo(p: {
  email?: string | null;
  nombre: string;
}) {
  if (!p.email) { console.warn("[email] Pedido sin email, omitiendo."); return; }
  await enviar(
    p.email,
    "✅ Tu pedido está listo — Peón Pet's",
    `Hola ${p.nombre}, tu pedido ya está listo para retirar.\n\nPasá cuando quieras por Rivadavia 36, La Falda.\nHorario: Lun-Vie 9-13 y 16-20`
  );
}
