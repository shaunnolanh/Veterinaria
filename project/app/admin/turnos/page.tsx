"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Turno, EstadoTurno } from "@/types";

const ESTADO_LABELS: Record<EstadoTurno, { label: string; clase: string }> = {
  pendiente: { label: "Pendiente", clase: "badge-pendiente" },
  confirmado: { label: "Confirmado", clase: "badge-confirmado" },
  cancelado: { label: "Cancelado", clase: "badge-cancelado" },
};

const ESPECIE_ICONOS: Record<string, string> = {
  perro: "🐶",
  gato: "🐱",
  conejo: "🐰",
  ave: "🐦",
  otro: "🐾",
};

type FiltroEstado = "todos" | EstadoTurno;

export default function AdminTurnosPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<FiltroEstado>("pendiente");
  const [turnoActivo, setTurnoActivo] = useState<Turno | null>(null);
  const [notasAdmin, setNotasAdmin] = useState("");
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  const cargarTurnos = useCallback(async () => {
    const supabase = createClient();

    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin");
      return;
    }

    const query = supabase
      .from("turnos")
      .select("*")
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (filtro !== "todos") {
      query.eq("estado", filtro);
    }

    const { data, error } = await query;
    if (!error && data) {
      setTurnos(data);
    }
    setCargando(false);
  }, [filtro, router]);

  useEffect(() => {
    cargarTurnos();
  }, [cargarTurnos]);

  async function cambiarEstado(turnoId: string, nuevoEstado: EstadoTurno) {
    setGuardando(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("turnos")
      .update({ estado: nuevoEstado, notas_admin: notasAdmin || null })
      .eq("id", turnoId);

    if (!error) {
      setTurnoActivo(null);
      setNotasAdmin("");
      cargarTurnos();
    }
    setGuardando(false);
  }

  async function cerrarSesion() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin");
  }

  const turnosPendientes = turnos.filter((t) => t.estado === "pendiente").length;

  return (
    <div className="min-h-screen">
      {/* Header del admin */}
      <header className="bg-oscuro-medio border-b border-white/10 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purpura flex items-center justify-center">
              <span className="text-verde-lima font-black text-xs">PP</span>
            </div>
            <div>
              <p className="font-bold text-white text-sm">Panel Admin</p>
              <p className="text-white/40 text-xs">Peón Pet's</p>
            </div>
          </div>
          <button
            onClick={cerrarSesion}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            Salir →
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card text-center py-4">
            <p className="text-2xl font-black text-yellow-400">{turnosPendientes}</p>
            <p className="text-white/50 text-xs mt-1">Pendientes</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-2xl font-black text-green-400">
              {turnos.filter((t) => t.estado === "confirmado").length}
            </p>
            <p className="text-white/50 text-xs mt-1">Confirmados</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-2xl font-black text-white/60">
              {turnos.filter((t) => t.estado === "cancelado").length}
            </p>
            <p className="text-white/50 text-xs mt-1">Cancelados</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {(["pendiente", "confirmado", "cancelado", "todos"] as FiltroEstado[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filtro === f
                    ? "bg-purpura text-white"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {f === "todos"
                  ? "Todos"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Lista de turnos */}
        {cargando ? (
          <div className="text-center py-12 text-white/40">Cargando turnos...</div>
        ) : turnos.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-white/60">No hay turnos {filtro !== "todos" ? filtro + "s" : ""}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {turnos.map((turno) => (
              <div
                key={turno.id}
                className="card hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Icono mascota */}
                  <div className="text-2xl pt-1">
                    {ESPECIE_ICONOS[turno.especie] || "🐾"}
                  </div>

                  {/* Datos principales */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white">
                        {turno.nombre} {turno.apellido}
                      </p>
                      <span className={ESTADO_LABELS[turno.estado].clase}>
                        {ESTADO_LABELS[turno.estado].label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-white/60">
                      <span>📅 {turno.fecha} a las {turno.hora}</span>
                      <span>🐾 {turno.mascota} ({turno.especie})</span>
                      <span>📱 {turno.telefono}</span>
                    </div>

                    {turno.motivo && (
                      <p className="text-white/50 text-sm mt-1 italic">
                        "{turno.motivo}"
                      </p>
                    )}
                    {turno.notas_admin && (
                      <p className="text-verde-lima/70 text-sm mt-1">
                        📝 {turno.notas_admin}
                      </p>
                    )}
                  </div>

                  {/* Botón acción */}
                  <button
                    onClick={() => {
                      setTurnoActivo(turno);
                      setNotasAdmin(turno.notas_admin || "");
                    }}
                    className="text-white/40 hover:text-white text-sm font-medium transition-colors shrink-0"
                  >
                    Gestionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de gestión de turno */}
      {turnoActivo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-oscuro-medio border border-white/20 rounded-2xl w-full max-w-md p-6 space-y-4">
            {/* Header modal */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Gestionar turno</h3>
              <button
                onClick={() => setTurnoActivo(null)}
                className="text-white/40 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Info del turno */}
            <div className="bg-oscuro rounded-xl p-4 space-y-2 text-sm">
              <p className="text-white">
                <span className="text-white/50">Dueño: </span>
                {turnoActivo.nombre} {turnoActivo.apellido}
              </p>
              <p className="text-white">
                <span className="text-white/50">Mascota: </span>
                {ESPECIE_ICONOS[turnoActivo.especie]} {turnoActivo.mascota}
              </p>
              <p className="text-verde-lima font-bold">
                📅 {turnoActivo.fecha} a las {turnoActivo.hora}
              </p>
              <p className="text-white">
                <span className="text-white/50">Teléfono: </span>
                <a
                  href={`https://wa.me/54${turnoActivo.telefono.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:underline"
                >
                  {turnoActivo.telefono}
                </a>
              </p>
              {turnoActivo.motivo && (
                <p className="text-white/60 italic">"{turnoActivo.motivo}"</p>
              )}
            </div>

            {/* Notas internas */}
            <div>
              <label className="label-campo">Notas internas (opcional)</label>
              <textarea
                className="input-campo resize-none"
                rows={2}
                placeholder="Ej: Llamé y confirmé, traer carnet de vacunación..."
                value={notasAdmin}
                onChange={(e) => setNotasAdmin(e.target.value)}
              />
            </div>

            {/* Acciones */}
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
                className="bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all text-sm"
              >
                ✗ Cancelar
              </button>
            </div>

            <button
              onClick={() => cambiarEstado(turnoActivo.id, "pendiente")}
              disabled={guardando || turnoActivo.estado === "pendiente"}
              className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-medium py-2 rounded-xl transition-all text-sm"
            >
              Marcar como pendiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
