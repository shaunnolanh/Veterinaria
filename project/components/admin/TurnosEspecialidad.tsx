"use client";

import { useState, useEffect, useCallback } from "react";
import { Turno, EstadoTurno, Especialidad } from "@/types";

type FiltroPeriodo = "hoy" | "manana" | "semana" | "todos";
type FiltroEstado = "todos" | EstadoTurno;

const ESTADO_CONFIG: Record<EstadoTurno, { label: string; bg: string; text: string }> = {
  pendiente: { label: "Pendiente", bg: "bg-yellow-100", text: "text-yellow-700" },
  confirmado: { label: "Confirmado", bg: "bg-green-100", text: "text-green-700" },
  cancelado: { label: "Cancelado", bg: "bg-red-100", text: "text-red-700" },
};

const ESPECIE_ICONOS: Record<string, string> = {
  perro: "🐶",
  gato: "🐱",
  conejo: "🐰",
  ave: "🐦",
  otro: "🐾",
};

interface Props {
  especialidad: Especialidad;
}

export default function TurnosEspecialidad({ especialidad }: Props) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>("hoy");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [turnoActivo, setTurnoActivo] = useState<Turno | null>(null);
  const [notasAdmin, setNotasAdmin] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarTurnos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        especialidad,
        estado: filtroEstado,
        periodo: filtroPeriodo,
      });
      const res = await fetch(`/api/admin/turnos?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTurnos(data.turnos);
    } catch {
      setError("No se pudieron cargar los turnos.");
    } finally {
      setCargando(false);
    }
  }, [especialidad, filtroEstado, filtroPeriodo]);

  useEffect(() => {
    cargarTurnos();
  }, [cargarTurnos]);

  async function cambiarEstado(turnoId: string, nuevoEstado: EstadoTurno) {
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/cambiar-estado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnoId, estado: nuevoEstado, notasAdmin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTurnoActivo(null);
      setNotasAdmin("");
      await cargarTurnos();
    } catch {
      setError("No se pudo actualizar el turno.");
    } finally {
      setGuardando(false);
    }
  }

  const turnosPendientes = turnos.filter((t) => t.estado === "pendiente").length;
  const turnosConfirmados = turnos.filter((t) => t.estado === "confirmado").length;

  return (
    <div className="p-6">
      {/* Stats rápidas */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-black text-yellow-500">{turnosPendientes}</p>
          <p className="text-gray-500 text-xs mt-0.5">Pendientes</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-2xl font-black text-green-500">{turnosConfirmados}</p>
          <p className="text-gray-500 text-xs mt-0.5">Confirmados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-4">
        <div className="flex flex-wrap gap-4">
          {/* Período */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">Período</p>
            <div className="flex gap-1.5 flex-wrap">
              {(["hoy", "manana", "semana", "todos"] as FiltroPeriodo[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setFiltroPeriodo(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filtroPeriodo === p
                      ? "bg-purpura text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p === "hoy" ? "Hoy" : p === "manana" ? "Mañana" : p === "semana" ? "Esta semana" : "Todos"}
                </button>
              ))}
            </div>
          </div>

          {/* Estado */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">Estado</p>
            <div className="flex gap-1.5 flex-wrap">
              {(["todos", "pendiente", "confirmado", "cancelado"] as FiltroEstado[]).map((e) => (
                <button
                  key={e}
                  onClick={() => setFiltroEstado(e)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filtroEstado === e
                      ? "bg-purpura text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {e === "todos" ? "Todos" : e.charAt(0).toUpperCase() + e.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Tabla de turnos */}
      {cargando ? (
        <div className="text-center py-12 text-gray-400">Cargando turnos...</div>
      ) : turnos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-gray-500">No hay turnos para este período.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dueño</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mascota</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Motivo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {turnos.map((turno) => {
                const estadoConf = ESTADO_CONFIG[turno.estado];
                return (
                  <tr key={turno.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{turno.fecha}</p>
                      <p className="text-gray-400 text-xs">{turno.hora}hs</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{turno.nombre} {turno.apellido}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">
                        {ESPECIE_ICONOS[turno.especie] || "🐾"} {turno.mascota}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-500 text-xs truncate max-w-[180px]">
                        {turno.motivo || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <a
                        href={`https://wa.me/54${turno.telefono.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline text-xs"
                      >
                        {turno.telefono}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${estadoConf.bg} ${estadoConf.text}`}>
                        {estadoConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setTurnoActivo(turno);
                          setNotasAdmin(turno.notas_admin || "");
                          setError(null);
                        }}
                        className="text-purpura hover:text-purpura/80 text-xs font-semibold"
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal gestión turno */}
      {turnoActivo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Gestionar turno</h3>
              <button
                onClick={() => { setTurnoActivo(null); setError(null); }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <p className="text-gray-900">
                <span className="text-gray-500">Dueño: </span>
                <strong>{turnoActivo.nombre} {turnoActivo.apellido}</strong>
              </p>
              <p className="text-gray-900">
                <span className="text-gray-500">Mascota: </span>
                {ESPECIE_ICONOS[turnoActivo.especie]} {turnoActivo.mascota}
              </p>
              <p className="font-bold text-purpura">
                📅 {turnoActivo.fecha} a las {turnoActivo.hora}hs
              </p>
              <p className="text-gray-900">
                <span className="text-gray-500">Tel: </span>
                <a
                  href={`https://wa.me/54${turnoActivo.telefono.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {turnoActivo.telefono}
                </a>
              </p>
              {turnoActivo.motivo && (
                <p className="text-gray-500 italic">"{turnoActivo.motivo}"</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Notas internas (opcional)
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purpura/30 focus:border-purpura resize-none"
                rows={2}
                placeholder="Ej: Llamé y confirmé, traer carnet de vacunación..."
                value={notasAdmin}
                onChange={(e) => setNotasAdmin(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-600 text-xs">{error}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => cambiarEstado(turnoActivo.id, "confirmado")}
                disabled={guardando || turnoActivo.estado === "confirmado"}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all text-sm"
              >
                ✅ Confirmar
              </button>
              <button
                onClick={() => cambiarEstado(turnoActivo.id, "cancelado")}
                disabled={guardando || turnoActivo.estado === "cancelado"}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all text-sm"
              >
                ✗ Cancelar
              </button>
            </div>

            <button
              onClick={() => cambiarEstado(turnoActivo.id, "pendiente")}
              disabled={guardando || turnoActivo.estado === "pendiente"}
              className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 font-medium py-2 rounded-xl transition-all text-sm"
            >
              Marcar como pendiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
