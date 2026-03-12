"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { EspecialistaFecha, Especialidad } from "@/types";

const ESPECIALIDADES: { value: Exclude<Especialidad, "clinica">; label: string; icono: string }[] = [
  { value: "dermatologia", label: "Dermatología", icono: "🔬" },
  { value: "oftalmologia", label: "Oftalmología", icono: "👁️" },
  { value: "endocrinologia", label: "Endocrinología", icono: "💊" },
];

const INTERVALOS = [15, 20, 30, 40, 60];

export default function EspecialidadesPage() {
  const [fechas, setFechas] = useState<EspecialistaFecha[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const [form, setForm] = useState({
    especialidad: "dermatologia" as Exclude<Especialidad, "clinica">,
    fecha: "",
    hora_inicio: "09:00",
    hora_fin: "13:00",
    intervalo_minutos: 30,
  });

  async function cargarFechas() {
    setCargando(true);
    const res = await fetch("/api/admin/especialidades");
    const data = await res.json();
    setFechas(data.fechas || []);
    setCargando(false);
  }

  useEffect(() => {
    cargarFechas();
  }, []);

  async function guardarFecha(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setExito(false);

    try {
      const res = await fetch("/api/admin/especialidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setExito(true);
      setForm((prev) => ({ ...prev, fecha: "" }));
      await cargarFechas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarFecha(id: string) {
    if (!confirm("¿Eliminar esta fecha?")) return;
    await fetch(`/api/admin/especialidades?id=${id}`, { method: "DELETE" });
    await cargarFechas();
  }

  function labelEspecialidad(esp: string) {
    return ESPECIALIDADES.find((e) => e.value === esp);
  }

  return (
    <AdminShell>
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-black text-gray-900">📅 Fechas de Especialistas</h1>
          <p className="text-gray-500 text-sm mt-1">
            Cargá cuándo viene cada especialista. Esas fechas se muestran automáticamente en el formulario de turnos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulario para agregar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Agregar fecha</h2>
            <form onSubmit={guardarFecha} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Especialidad *
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purpura/30 focus:border-purpura"
                  value={form.especialidad}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      especialidad: e.target.value as Exclude<Especialidad, "clinica">,
                    }))
                  }
                >
                  {ESPECIALIDADES.map((esp) => (
                    <option key={esp.value} value={esp.value}>
                      {esp.icono} {esp.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purpura/30 focus:border-purpura"
                  value={form.fecha}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setForm((prev) => ({ ...prev, fecha: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Hora inicio *
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purpura/30 focus:border-purpura"
                    value={form.hora_inicio}
                    onChange={(e) => setForm((prev) => ({ ...prev, hora_inicio: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Hora fin *
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purpura/30 focus:border-purpura"
                    value={form.hora_fin}
                    onChange={(e) => setForm((prev) => ({ ...prev, hora_fin: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Intervalo entre turnos (minutos)
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purpura/30 focus:border-purpura"
                  value={form.intervalo_minutos}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, intervalo_minutos: Number(e.target.value) }))
                  }
                >
                  {INTERVALOS.map((i) => (
                    <option key={i} value={i}>
                      {i} minutos
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-red-600 text-xs bg-red-50 rounded-lg p-2">{error}</p>
              )}
              {exito && (
                <p className="text-green-700 text-xs bg-green-50 rounded-lg p-2">
                  ✅ Fecha guardada correctamente.
                </p>
              )}

              <button
                type="submit"
                disabled={guardando}
                className="w-full bg-purpura hover:bg-purpura/90 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all"
              >
                {guardando ? "Guardando..." : "Agregar fecha"}
              </button>
            </form>
          </div>

          {/* Lista de fechas */}
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Fechas cargadas</h2>
            {cargando ? (
              <p className="text-gray-400 text-sm">Cargando...</p>
            ) : fechas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-3xl mb-2">📅</p>
                <p className="text-gray-500 text-sm">No hay fechas cargadas aún.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {fechas.map((fecha) => {
                  const esp = labelEspecialidad(fecha.especialidad);
                  return (
                    <div
                      key={fecha.id}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {esp?.icono} {esp?.label}
                        </p>
                        <p className="text-purpura font-bold text-sm">{fecha.fecha}</p>
                        <p className="text-gray-400 text-xs">
                          {fecha.hora_inicio} – {fecha.hora_fin} · cada {fecha.intervalo_minutos}min
                        </p>
                      </div>
                      <button
                        onClick={() => eliminarFecha(fecha.id)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors ml-3"
                      >
                        Eliminar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
