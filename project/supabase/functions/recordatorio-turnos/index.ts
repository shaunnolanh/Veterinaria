import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.error("[Twilio] Error:", JSON.stringify(data));
    throw new Error("Twilio error " + res.status + ": " + (data?.message ?? "desconocido"));
  }

  console.log("[Twilio] Recordatorio enviado. SID: " + data.sid);
}

Deno.serve(async (_req: Request) => {
  console.log("[recordatorio-turnos] Iniciando...");

  try {
    const accountSid  = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken   = Deno.env.get("TWILIO_AUTH_TOKEN");
    const from        = Deno.env.get("TWILIO_WHATSAPP_FROM");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!accountSid || !authToken || !from || !supabaseUrl || !serviceKey) {
      console.error("[recordatorio-turnos] Faltan variables de entorno");
      return new Response("Missing env vars", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const ahora = new Date();
    const desde = new Date(ahora.getTime() + 23.5 * 60 * 60 * 1000);
    const hasta = new Date(ahora.getTime() + 24.5 * 60 * 60 * 1000);

    console.log("[recordatorio-turnos] Ventana: " + desde.toISOString() + " a " + hasta.toISOString());

    const { data: turnos, error: errorQuery } = await supabase
      .from("turnos")
      .select("id, nombre, telefono, mascota, especie, motivo, fecha, hora")
      .eq("estado", "confirmado")
      .eq("recordatorio_enviado", false)
      .gte("fecha", desde.toISOString().slice(0, 10))
      .lte("fecha", hasta.toISOString().slice(0, 10));

    if (errorQuery) {
      console.error("[recordatorio-turnos] Error en query:", errorQuery);
      return new Response("DB query error", { status: 500 });
    }

    if (!turnos || turnos.length === 0) {
      console.log("[recordatorio-turnos] Sin turnos en la ventana.");
      return new Response(JSON.stringify({ procesados: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const turnosFiltrados = turnos.filter((t: { fecha: string; hora: string }) => {
      const ts = new Date(t.fecha + "T" + t.hora.slice(0, 5) + ":00-03:00");
      return ts >= desde && ts <= hasta;
    });

    console.log("[recordatorio-turnos] En ventana exacta: " + turnosFiltrados.length);

    let enviados = 0;
    let errores  = 0;

    for (const turno of turnosFiltrados) {
      try {
        const to     = normalizarTelefono(turno.telefono);
        const motivo = turno.motivo ?? "No especificado";

        const cuerpo = [
          "\uD83D\uDD14 \u00A1Hola " + turno.nombre + "! Te recordamos que ma\u00F1ana ten\u00E9s turno en Cl\u00EDnica Veterinaria Pe\u00F3n Pet's.",
          "",
          "\uD83D\uDCC5 Fecha: " + formatearFecha(turno.fecha),
          "\u23F0 Hora: " + formatearHora(turno.hora),
          "\uD83D\uDC3E Mascota: " + turno.mascota + " (" + turno.especie + ")",
          "\uD83D\uDCCB Motivo: " + motivo,
          "",
          "Si necesit\u00E1s cancelar o reprogramar, escrib\u00EDnos por ac\u00E1 o llam\u00E1nos al 03548-495677.",
          "\u00A1Nos vemos ma\u00F1ana! \uD83C\uDF3F",
        ].join("\n");

        await enviarWhatsApp(accountSid, authToken, from, to, cuerpo);

        const { error: errorUpdate } = await supabase
          .from("turnos")
          .update({ recordatorio_enviado: true })
          .eq("id", turno.id);

        if (errorUpdate) {
          console.error("[recordatorio-turnos] Error al marcar " + turno.id + ":", errorUpdate);
          errores++;
        } else {
          console.log("[recordatorio-turnos] Marcado: " + turno.id);
          enviados++;
        }

      } catch (err) {
        console.error("[recordatorio-turnos] Error en turno " + turno.id + ":", err);
        errores++;
      }
    }

    console.log("[recordatorio-turnos] Fin. Enviados: " + enviados + ", Errores: " + errores);

    return new Response(
      JSON.stringify({ procesados: turnosFiltrados.length, enviados, errores }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[recordatorio-turnos] Error inesperado:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
