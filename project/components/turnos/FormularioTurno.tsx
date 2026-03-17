"use client";

import { useState } from "react";
import { FormularioTurnoData, EspecieMascota, Especialidad } from "@/types";

interface Props {
  fecha: string;
  hora: string;
  especialidad: Especialidad;
  onExito: () => void;
  onVolver: () => void;
}

const especieOpciones: { value: EspecieMascota; label: string; icono: string }[] = [
  { value: "perro", label: "Perro", icono: "🐶" },
  { value: "gato", label: "Gato", icono: "🐱" },
  { value: "conejo", label: "Conejo", icono: "🐰" },
  { value: "ave", label: "Ave", icono: "🐦" },
  { value: "otro", label: "Otro", icono: "🐾" },
];

export default function FormularioTurno({ fecha, hora, especialidad, onExito, onVolver }: Props) {
  const [form, setForm] = useState<Omit<FormularioTurnoData, "fecha" | "hora" | "especialidad">>({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    mascota: "",
    especie: "perro",
    motivo: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function actualizar(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function enviarTurno(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    // Validaciones básicas
    if (!form.nombre.trim() || !form.apellido.trim()) {
      setError("Por favor completá tu nombre y apellido.");
      setEnviando(false);
      return;
    }
    if (!form.telefono.trim()) {
      setError("El teléfono es necesario para confirmarte el turno.");
      setEnviando(false);
      return;
    }
    if (!form.mascota.trim()) {
      setError("Indicanos el nombre de tu mascota.");
      setEnviando(false);
      return;
    }

    try {
      const res = await fetch("/api/turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fecha, hora, especialidad }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudo registrar el turno.");
      }

      onExito();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviarTurno} className="card space-y-5">
      <h2 className="font-bold text-zinc-900 text-lg mb-2">3. Tus datos</h2>

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-campo">Nombre *</label>
          <input
            type="text"
            className="input-campo"
            placeholder="Ej: María"
            value={form.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
            required
            autoComplete="given-name"
          />
        </div>
        <div>
          <label className="label-campo">Apellido *</label>
          <input
            type="text"
            className="input-campo"
            placeholder="Ej: González"
            value={form.apellido}
            onChange={(e) => actualizar("apellido", e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>
      </div>

      {/* Teléfono */}
      <div>
        <label className="label-campo">Teléfono / WhatsApp *</label>
        <input
          type="tel"
          className="input-campo"
          placeholder="Ej: 03548 15-12-3456"
          value={form.telefono}
          onChange={(e) => actualizar("telefono", e.target.value)}
          required
          autoComplete="tel"
        />
        <p className="text-zinc-500 text-xs mt-1">
          Lo usamos solo para confirmar tu turno.
        </p>
      </div>
{/* Email */}
      <div>
        <label className="label-campo">Email</label>
        <input
          type="email"
          className="input-campo"
          placeholder="Ej: maria@gmail.com"
          value={form.email}
          onChange={(e) => actualizar("email", e.target.value)}
          autoComplete="email"
        />
        <p className="text-zinc-500 text-xs mt-1">
          Opcional. Te mandamos la confirmación por email.
        </p>
      </div>
      {/* Mascota */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-campo">Nombre de tu mascota *</label>
          <input
            type="text"
            className="input-campo"
            placeholder="Ej: Firulais"
            value={form.mascota}
            onChange={(e) => actualizar("mascota", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label-campo">¿Qué tipo de animal es? *</label>
          <select
            className="select-campo"
            value={form.especie}
            onChange={(e) => actualizar("especie", e.target.value)}
          >
            {especieOpciones.map((op) => (
              <option key={op.value} value={op.value}>
                {op.icono} {op.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Motivo */}
      <div>
        <label className="label-campo">¿Por qué motivo venís?</label>
        <textarea
          className="input-campo resize-none"
          rows={3}
          placeholder="Ej: Vacuna antirrábica, revisación de rutina, peluquería..."
          value={form.motivo}
          onChange={(e) => actualizar("motivo", e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onVolver}
          className="btn-outline text-sm flex-1 justify-center"
          disabled={enviando}
        >
          ← Volver
        </button>
        <button
          type="submit"
          className="btn-primario text-sm flex-1 justify-center"
          disabled={enviando}
        >
          {enviando ? "Enviando..." : "✅ Confirmar turno"}
        </button>
      </div>
    </form>
  );
}
