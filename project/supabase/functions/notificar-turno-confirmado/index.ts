function normalizarTelefono(raw: string): string {
  const tel = raw.replace(/[\s\-.]/g, "");
  if (tel.startsWith("+549")) return "whatsapp:" + tel;
  if (tel.startsWith("+54"))  return "whatsapp:" + tel.replace("+54", "+549");
  if (tel.startsWith("549"))  return "whatsapp:+" + tel;
  if (tel.startsWith("0"))    return "whatsapp:+549" + tel.slice(1);
  if (tel.startsWith("15"))   return "whatsapp:+5493548" + tel;
  if (/^\d{10}$/.test(tel))   return "whatsapp:+549" + tel;
  return "whatsapp:+549" + tel;
}

function formatearFecha(fecha: string): string {
  const partes = fecha.split("-");
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function formatearHora(hora: string): string {
  return hora.slice(0, 5);
}

async function enviarWhatsApp(
  accountSid: string,
  authToken: string,
  from: string,
  to: string,
  body: string
): Promise<void> {
  const url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";
  const params = new URLSearchParams({ From: from, To: to, Body: body });
  const credenciales = btoa(accountSid + ":" + authToken);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + credenciales,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("[Twilio] Error al enviar:", JSON.stringify(data));
    throw new Error("Twilio error " + res.status + ": " + (data?.message ?? "desconocido"));
  }

  console.log("[Twilio] Mensaje enviado. SID: " + data.sid);
}

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const turno = payload?.record;

    if (!turno) {
      console.warn("[notificar-turno-confirmado] No se recibio record");
      return new Response("No record", { status: 200 });
    }

    console.log("[notificar-turno-confirmado] Turno: " + turno.id + " para " + turno.nombre);

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken  = Deno.env.get("TWILIO_AUTH_TOKEN");
    const from       = Deno.env.get("TWILIO_WHATSAPP_FROM");

    if (!accountSid || !authToken || !from) {
      console.error("[notificar-turno-confirmado] Faltan secrets de Twilio");
      return new Response("Missing secrets", { status: 500 });
    }

    const to = normalizarTelefono(turno.telefono);
    console.log("[notificar-turno-confirmado] Enviando a: " + to);

    const motivo = turno.motivo ?? "No especificado";
    const cuerpo = [
      "\uD83D\uDC3E \u00A1Hola " + turno.nombre + "! Tu turno en Cl\u00EDnica Veterinaria Pe\u00F3n Pet's fue registrado correctamente.",
      "",
      "\uD83D\uDCC5 Fecha: " + formatearFecha(turno.fecha),
      "\u23F0 Hora: " + formatearHora(turno.hora),
      "\uD83D\uDC3E Mascota: " + turno.mascota + " (" + turno.especie + ")",
      "\uD83D\uDCCB Motivo: " + motivo,
      "",
      "Te confirmamos el turno a la brevedad. Cualquier consulta llam\u00E1nos al 03548-495677.",
      "\u00A1Hasta pronto! \uD83C\uDF3F",
    ].join("\n");

    await enviarWhatsApp(accountSid, authToken, from, to, cuerpo);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[notificar-turno-confirmado] Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
