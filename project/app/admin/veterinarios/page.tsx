"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

type Especialidad =
  | "clinica"
  | "dermatologia"
  | "oftalmologia"
  | "endocrinologia";

interface Veterinario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  especialidad: Especialidad;
  telefono: string | null;
  activo: boolean;
}

const ESPECIALIDADES: { value: Especialidad; label: string }[] = [
  { value: "clinica", label: "Clínica" },
  { value: "dermatologia", label: "Dermatología" },
  { value: "oftalmologia", label: "Oftalmología" },
  { value: "endocrinologia", label: "Endocrinología" },
];

export default function VeterinariosPage() {
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    especialidad: "clinica" as Especialidad,
    telefono: "",
  });

  async function cargar() {
    setCargando(true);
    try {
      const res = await fetch("/api/admin/veterinarios", { cache: "no-store" });
      const data = await res.json();
      setVeterinarios(data.veterinarios || []);
    } catch (err) {
      console.error("Error cargando veterinarios:", err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/veterinarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      setForm({
        nombre: "",
        apellido: "",
        email: "",
        especialidad: "clinica",
        telefono: "",
      });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo(vet: Veterinario) {
    await fetch(`/api/admin/veterinarios?id=${vet.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !vet.activo }),
    });
    await cargar();
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este veterinario?")) return;
    await fetch(`/api/admin/veterinarios?id=${id}`, { method: "DELETE" });
    await cargar();
  }

  return (
    <AdminShell>
      <div className="p-6 max-w-6xl">
        <h1 className="text-xl font-black text-gray-900">
          👩‍⚕️ Gestión de Veterinarios
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestioná profesionales asignables por especialidad para notificaciones
          internas.
        </p>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4">
              Agregar veterinario
            </h2>
            <form onSubmit={onSubmit} className="space-y-3">
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nombre: e.target.value }))
                }
                required
              />
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                placeholder="Apellido"
                value={form.apellido}
                onChange={(e) =>
                  setForm((p) => ({ ...p, apellido: e.target.value }))
                }
                required
              />
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                required
              />
              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                value={form.especialidad}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    especialidad: e.target.value as Especialidad,
                  }))
                }
              >
                {ESPECIALIDADES.map((esp) => (
                  <option key={esp.value} value={esp.value}>
                    {esp.label}
                  </option>
                ))}
              </select>
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                placeholder="Teléfono (opcional)"
                value={form.telefono}
                onChange={(e) =>
                  setForm((p) => ({ ...p, telefono: e.target.value }))
                }
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                disabled={guardando}
                className="w-full bg-purpura text-white font-bold rounded-xl py-2.5 text-sm"
              >
                {guardando ? "Guardando..." : "Agregar veterinario"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-3">Veterinario</th>
                    <th className="text-left px-4 py-3">Especialidad</th>
                    <th className="text-left px-4 py-3">Estado</th>
                    <th className="text-right px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr>
                      <td className="px-4 py-4 text-gray-400" colSpan={4}>
                        Cargando...
                      </td>
                    </tr>
                  ) : veterinarios.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-gray-400" colSpan={4}>
                        No hay veterinarios cargados.
                      </td>
                    </tr>
                  ) : (
                    veterinarios.map((vet) => (
                      <tr key={vet.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-gray-900">
                          <p className="font-semibold">
                            {vet.nombre} {vet.apellido}
                          </p>
                          <p className="text-xs text-gray-500">{vet.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-900 capitalize">
                          {vet.especialidad}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          <button
                            onClick={() => toggleActivo(vet)}
                            className={`px-3 py-1 rounded-full text-xs ${vet.activo ? "bg-lime-100 text-lime-700" : "bg-gray-100 text-gray-500"}`}
                          >
                            {vet.activo ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => eliminar(vet.id)}
                            className="text-red-500 text-xs"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
