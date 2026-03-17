"use client";

import { useState, useEffect } from "react";
import FormularioTurno from "./FormularioTurno";
import {
  esDiaLaboral,
  formatearFecha,
  generarSlotsConDisponibilidad,
  nombreMes,
} from "@/lib/horarios";
import { SlotHorario, Especialidad, EspecialistaFecha, ESPECIALIDAD_LABELS } from "@/types";

type Paso = "especialidad" | "fecha" | "hora" | "datos" | "confirmado";

const ESPECIALIDADES_OPCIONES: {
  value: Especialidad;
  label: string;
  icono: string;
  desc: string;
}[] = [
  { value: "clinica", label: "Clínica General", icono: "🏥", desc: "Consulta con la Dra. Nataly · Lun–Vie" },
  { value: "dermatologia", label: "Dermatología", icono: "🔬", desc: "Especialista en piel, pelo y uñas" },
  { value: "oftalmologia", label: "Oftalmología", icono: "👁️", desc: "Especialista en ojos" },
  { value: "endocrinologia", label: "Endocrinología", icono: "💊", desc: "Especialista en diabetes, tiroides y hormonas" },
];

function generarSlotsEspecialista(
  horaInicio: string,
  horaFin: string,
  intervalo: number
): string[] {
  const slots: string[] = [];
  const [hI, mI] = horaInicio.split(":").map(Number);
  const [hF, mF] = horaFin.split(":").map(Number);
  let totalMin = hI * 60 + mI;
  const finMin = hF * 60 + mF;
  while (totalMin < finMin) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    totalMin += intervalo;
  }
  return slots;
}

export default function CalendarioTurnos() {
  const hoy = new Date();
  const [paso, setPaso] = useState<Paso>("especialidad");
  const [especialidadSeleccionada, setEspecialidadSeleccionada] =
    useState<Especialidad | null>(null);

  // Clínica general
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotHorario[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);

  // Especialistas
  const [fechasEspecialista, setFechasEspecialista] = useState<EspecialistaFecha[]>([]);
  const [cargandoFechas, setCargandoFechas] = useState(false);
  const [fechaEspecialistaSeleccionada, setFechaEspecialistaSeleccionada] =
    useState<EspecialistaFecha | null>(null);

  // Cargar fechas disponibles al elegir especialidad (no clínica)
  useEffect(() => {
    if (!especialidadSeleccionada || especialidadSeleccionada === "clinica") return;
    setCargandoFechas(true);
    fetch(`/api/especialidades-disponibles?especialidad=${especialidadSeleccionada}`)
      .then((r) => r.json())
      .then((data) => {
        setFechasEspecialista(data.fechas || []);
        setCargandoFechas(false);
      })
      .catch(() => {
        setFechasEspecialista([]);
        setCargandoFechas(false);
      });
  }, [especialidadSeleccionada]);

  // Cargar slots al seleccionar fecha de clínica
  useEffect(() => {
    if (!fechaSeleccionada || especialidadSeleccionada !== "clinica") return;
    setCargandoSlots(true);
    fetch(`/api/horarios-disponibles?fecha=${fechaSeleccionada}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(generarSlotsConDisponibilidad(data.ocupados || []));
        setCargandoSlots(false);
        setPaso("hora");
      })
      .catch(() => {
        setSlots(generarSlotsConDisponibilidad([]));
        setCargandoSlots(false);
        setPaso("hora");
      });
  }, [fechaSeleccionada, especialidadSeleccionada]);

  // Cargar slots al seleccionar fecha de especialista
  useEffect(() => {
    if (!fechaEspecialistaSeleccionada) return;
    setCargandoSlots(true);
    const slotsBase = generarSlotsEspecialista(
      fechaEspecialistaSeleccionada.hora_inicio,
      fechaEspecialistaSeleccionada.hora_fin,
      fechaEspecialistaSeleccionada.intervalo_minutos
    );
    fetch(`/api/horarios-disponibles?fecha=${fechaEspecialistaSeleccionada.fecha}`)
      .then((r) => r.json())
      .then((data) => {
        const ocupados: string[] = data.ocupados || [];
        setSlots(slotsBase.map((hora) => ({ hora, disponible: !ocupados.includes(hora) })));
        setCargandoSlots(false);
        setPaso("hora");
      })
      .catch(() => {
        setSlots(slotsBase.map((hora) => ({ hora, disponible: true })));
        setCargandoSlots(false);
        setPaso("hora");
      });
  }, [fechaEspecialistaSeleccionada]);

  function generarDiasMes(mes: number, anio: number) {
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const diasPrevios = (primerDia.getDay() + 6) % 7;
    const dias = [];
    for (let i = 0; i < diasPrevios; i++) dias.push(null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) dias.push(new Date(anio, mes, d));
    return dias;
  }

  const diasMes = generarDiasMes(mesActual, anioActual);

  function esHoy(fecha: Date) { return formatearFecha(fecha) === formatearFecha(hoy); }
  function esPasado(fecha: Date) {
    const d = new Date(fecha); d.setHours(0, 0, 0, 0);
    const h = new Date(hoy); h.setHours(0, 0, 0, 0);
    return d < h;
  }
  function esDiaSeleccionado(fecha: Date) { return formatearFecha(fecha) === fechaSeleccionada; }
  function seleccionarFecha(fecha: Date) {
    if (!esDiaLaboral(fecha) || esPasado(fecha)) return;
    setFechaSeleccionada(formatearFecha(fecha));
    setHoraSeleccionada(null);
  }
  function mesSiguiente() {
    if (mesActual === 11) { setMesActual(0); setAnioActual(anioActual + 1); }
    else setMesActual(mesActual + 1);
  }
  function mesAnterior() {
    if (anioActual === hoy.getFullYear() && mesActual === hoy.getMonth()) return;
    if (mesActual === 0) { setMesActual(11); setAnioActual(anioActual - 1); }
    else setMesActual(mesActual - 1);
  }

  const slotsMañana = slots.filter((s) => parseInt(s.hora.split(":")[0]) < 14);
  const slotsTarde = slots.filter((s) => parseInt(s.hora.split(":")[0]) >= 14);

  const fechaFinal =
    especialidadSeleccionada === "clinica"
      ? fechaSeleccionada
      : fechaEspecialistaSeleccionada?.fecha || null;

  function resetearTodo() {
    setEspecialidadSeleccionada(null);
    setFechaSeleccionada(null);
    setHoraSeleccionada(null);
    setFechaEspecialistaSeleccionada(null);
    setFechasEspecialista([]);
    setSlots([]);
    setPaso("especialidad");
  }

  // ─── CONFIRMADO ────────────────────────────────────────────────────────────
  if (paso === "confirmado") {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black text-[#A8D400] mb-2">¡Turno solicitado!</h2>
        <p className="text-zinc-700 mb-6">
          Te vamos a confirmar el turno a la brevedad por email.
        </p>
        <div className="bg-white border border-[#6B2FA0]/30 rounded-xl p-4 mb-6 inline-block">
          <p className="text-zinc-600 text-sm">Tu turno solicitado</p>
          <p className="text-[#A8D400] font-bold text-lg mt-1">
            {fechaFinal} a las {horaSeleccionada}
          </p>
          {especialidadSeleccionada && especialidadSeleccionada !== "clinica" && (
            <p className="text-zinc-500 text-sm mt-1">
              {ESPECIALIDAD_LABELS[especialidadSeleccionada].icono}{" "}
              {ESPECIALIDAD_LABELS[especialidadSeleccionada].label}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={resetearTodo} className="btn-outline text-sm">
            Sacar otro turno
          </button>
          <a
            href="https://wa.me/5493548156327"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secundario text-sm"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    );
  }

  // ─── FORMULARIO DATOS ──────────────────────────────────────────────────────
  if (paso === "datos" && fechaFinal && horaSeleccionada && especialidadSeleccionada) {
    return (
      <div>
        <div className="card border border-zinc-200 mb-6 flex items-center justify-between">
          <div>
            <p className="text-zinc-600 text-sm">Turno para</p>
            <p className="font-bold text-[#A8D400]">
              {fechaFinal} a las {horaSeleccionada}
            </p>
            <p className="text-zinc-500 text-xs mt-0.5">
              {ESPECIALIDAD_LABELS[especialidadSeleccionada].icono}{" "}
              {ESPECIALIDAD_LABELS[especialidadSeleccionada].label}
            </p>
          </div>
          <button
            onClick={() => { setPaso("hora"); setHoraSeleccionada(null); }}
            className="text-zinc-500 hover:text-zinc-900 text-sm"
          >
            Cambiar
          </button>
        </div>
        <FormularioTurno
          fecha={fechaFinal}
          hora={horaSeleccionada}
          especialidad={especialidadSeleccionada}
          onExito={() => setPaso("confirmado")}
          onVolver={() => { setPaso("hora"); setHoraSeleccionada(null); }}
        />
      </div>
    );
  }

  // ─── PANTALLA PRINCIPAL ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* PASO 1: Tipo de consulta */}
      <div className="card border border-zinc-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-zinc-900">
            {paso === "especialidad" ? "1. ¿Qué tipo de consulta necesitás?" : "✅ Tipo de consulta"}
          </h2>
          {especialidadSeleccionada && paso !== "especialidad" && (
            <button onClick={resetearTodo} className="text-[#A8D400] text-sm font-medium hover:underline">
              Cambiar
            </button>
          )}
        </div>

        {paso === "especialidad" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ESPECIALIDADES_OPCIONES.map((esp) => (
              <button
                key={esp.value}
                onClick={() => { setEspecialidadSeleccionada(esp.value); setPaso("fecha"); }}
                className="flex items-start gap-3 p-4 rounded-xl border-2 border-zinc-300 hover:border-[#6B2FA0] hover:bg-[#6B2FA0]/10 text-left transition-all group"
              >
                <span className="text-2xl mt-0.5">{esp.icono}</span>
                <div>
                  <p className="font-bold text-zinc-900 group-hover:text-[#A8D400] transition-colors text-sm">
                    {esp.label}
                  </p>
                  <p className="text-zinc-500 text-xs mt-0.5">{esp.desc}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xl">{ESPECIALIDAD_LABELS[especialidadSeleccionada!].icono}</span>
            <p className="font-bold text-[#A8D400] text-sm">
              {ESPECIALIDAD_LABELS[especialidadSeleccionada!].label}
            </p>
          </div>
        )}
      </div>

      {/* PASO 2: Fecha */}
      {(paso === "fecha" || paso === "hora" || paso === "datos") && especialidadSeleccionada && (
        <div className="card border border-zinc-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-zinc-900">
              {paso === "fecha" ? "2. Elegí el día" : "✅ Día elegido"}
            </h2>
            {(fechaSeleccionada || fechaEspecialistaSeleccionada) && paso !== "fecha" && (
              <button
                onClick={() => {
                  setPaso("fecha");
                  setHoraSeleccionada(null);
                  setFechaSeleccionada(null);
                  setFechaEspecialistaSeleccionada(null);
                  setSlots([]);
                }}
                className="text-[#A8D400] text-sm font-medium hover:underline"
              >
                Cambiar
              </button>
            )}
          </div>

          {especialidadSeleccionada === "clinica" ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <button onClick={mesAnterior} className="p-2 rounded-lg hover:bg-zinc-100 transition-colors">←</button>
                <p className="font-bold text-zinc-900">{nombreMes(mesActual)} {anioActual}</p>
                <button onClick={mesSiguiente} className="p-2 rounded-lg hover:bg-zinc-100 transition-colors">→</button>
              </div>
              <div className="grid grid-cols-7 mb-2">
                {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((d) => (
                  <div key={d} className="text-center text-xs text-zinc-500 font-medium py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {diasMes.map((fecha, idx) => {
                  if (!fecha) return <div key={`vacio-${idx}`} />;
                  const esLaboral = esDiaLaboral(fecha);
                  const esPas = esPasado(fecha);
                  const deshabilitado = !esLaboral || esPas;
                  const seleccionado = esDiaSeleccionado(fecha);
                  const today = esHoy(fecha);
                  let claseBase = deshabilitado ? "dia-deshabilitado" : seleccionado ? "dia-seleccionado" : "dia-disponible";
                  if (today && !deshabilitado && !seleccionado) claseBase += " dia-hoy";
                  return (
                    <button
                      key={fecha.toISOString()}
                      onClick={() => seleccionarFecha(fecha)}
                      disabled={deshabilitado}
                      className={claseBase}
                    >
                      {fecha.getDate()}
                    </button>
                  );
                })}
              </div>
              <p className="text-zinc-500 text-xs mt-4 text-center">
                Solo se pueden sacar turnos de Lunes a Viernes
              </p>
            </>
          ) : (
            <>
              {cargandoFechas ? (
                <p className="text-zinc-500 text-sm text-center py-4">Cargando fechas disponibles...</p>
              ) : fechasEspecialista.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">📅</p>
                  <p className="text-zinc-600 text-sm">
                    Por el momento no hay fechas disponibles para esta especialidad.
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    Consultanos:{" "}
                    <a href="https://wa.me/5493548156327" className="text-[#A8D400] hover:underline">
                      WhatsApp
                    </a>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fechasEspecialista.map((f) => {
                    const seleccionado = fechaEspecialistaSeleccionada?.id === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          setFechaEspecialistaSeleccionada(f);
                          setHoraSeleccionada(null);
                          setSlots([]);
                        }}
                        className={`flex flex-col p-4 rounded-xl border-2 text-left transition-all ${
                          seleccionado
                            ? "border-[#6B2FA0] bg-[#6B2FA0]/10"
                            : "border-zinc-300 hover:border-[#6B2FA0]/50"
                        }`}
                      >
                        <p className={`font-bold ${seleccionado ? "text-[#A8D400]" : "text-zinc-900"}`}>
                          {f.fecha}
                        </p>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          {f.hora_inicio} – {f.hora_fin} · cada {f.intervalo_minutos}min
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* PASO 3: Horarios */}
      {(paso === "hora" || paso === "datos") && fechaFinal && (
        <div className="card border border-zinc-200">
          <h2 className="font-bold text-zinc-900 mb-4">3. Elegí el horario</h2>
          <p className="text-zinc-600 text-sm mb-4">
            Día seleccionado:{" "}
            <span className="text-[#A8D400] font-semibold">{fechaFinal}</span>
          </p>
          {cargandoSlots ? (
            <div className="text-center py-8 text-zinc-500">Cargando horarios...</div>
          ) : (
            <div className="space-y-4">
              {slotsMañana.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">
                    ☀️ Mañana
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slotsMañana.map((slot) => (
                      <button
                        key={slot.hora}
                        onClick={() => { if (!slot.disponible) return; setHoraSeleccionada(slot.hora); setPaso("datos"); }}
                        disabled={!slot.disponible}
                        className={!slot.disponible ? "slot-ocupado" : horaSeleccionada === slot.hora ? "slot-seleccionado" : "slot-disponible"}
                      >
                        {slot.hora}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {slotsTarde.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">
                    🌙 Tarde
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slotsTarde.map((slot) => (
                      <button
                        key={slot.hora}
                        onClick={() => { if (!slot.disponible) return; setHoraSeleccionada(slot.hora); setPaso("datos"); }}
                        disabled={!slot.disponible}
                        className={!slot.disponible ? "slot-ocupado" : horaSeleccionada === slot.hora ? "slot-seleccionado" : "slot-disponible"}
                      >
                        {slot.hora}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {slots.length === 0 && (
                <p className="text-center text-zinc-500 py-4 text-sm">
                  No hay horarios disponibles para este día.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
