"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string | null;
  created_at: string;
  mascotas_count: number;
}

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", apellido: "", telefono: "", email: "" });

  async function cargar(query = "") {
    const res = await fetch(`/api/admin/clientes?q=${encodeURIComponent(query)}`, { cache: "no-store" });
    const data = await res.json();
    setClientes(data.clientes || []);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function buscar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await cargar(q);
  }

  async function crearCliente(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch("/api/admin/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ nombre: "", apellido: "", telefono: "", email: "" });
      await cargar(q);
    }
  }

  return (
    <AdminShell>
      <div className="p-6">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">👥 Clientes y Fichas Clínicas</h1>
            <p className="text-gray-500 text-sm">Buscá, editá y exportá clientes con acceso a sus mascotas e historial.</p>
          </div>
          <div className="flex gap-2">
            <a href="/api/admin/clientes/exportar-csv" className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold">Exportar CSV</a>
            <button onClick={() => setShowModal(true)} className="bg-purpura text-white rounded-xl px-4 py-2 text-sm font-semibold">Agregar cliente</button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <form onSubmit={buscar} className="flex gap-2 mb-4">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, apellido o teléfono" className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" />
            <button className="bg-purpura text-white rounded-xl px-4 py-2 text-sm font-semibold">Buscar</button>
          </form>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-gray-500 bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">Nombre</th><th className="text-left px-4 py-3">Apellido</th><th className="text-left px-4 py-3">Teléfono</th><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">N° mascotas</th><th className="text-left px-4 py-3">Alta</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/clientes/${cliente.id}`)}>
                    <td className="px-4 py-3">{cliente.nombre}</td>
                    <td className="px-4 py-3">{cliente.apellido}</td>
                    <td className="px-4 py-3">{cliente.telefono}</td>
                    <td className="px-4 py-3">{cliente.email || "-"}</td>
                    <td className="px-4 py-3">{cliente.mascotas_count}</td>
                    <td className="px-4 py-3">{cliente.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-30">
            <div className="bg-white rounded-2xl p-5 w-full max-w-md border border-gray-100 shadow-sm">
              <h3 className="font-bold mb-3">Agregar cliente</h3>
              <form onSubmit={crearCliente} className="space-y-3">
                <input required className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} />
                <input required className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Apellido" value={form.apellido} onChange={(e) => setForm((p) => ({ ...p, apellido: e.target.value }))} />
                <input required className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} />
                <input className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                <div className="flex gap-2 justify-end">
                  <button type="button" className="rounded-xl px-4 py-2 border border-gray-200 text-sm" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="rounded-xl px-4 py-2 bg-purpura text-white text-sm font-semibold">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
