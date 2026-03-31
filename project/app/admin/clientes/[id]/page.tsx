"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string;
}

interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string | null;
  fecha_nacimiento: string | null;
  sexo: string | null;
  esterilizado: boolean;
  color_pelaje: string | null;
}

interface Consulta {
  id: string;
  fecha: string;
  veterinario_nombre: string | null;
  motivo_consulta: string | null;
  anamnesis: string | null;
  peso_kg: number | null;
  temperatura_c: number | null;
  frecuencia_cardiaca: number | null;
  frecuencia_respiratoria: number | null;
  condicion_corporal: number | null;
  mucosas: string | null;
  hidratacion: string | null;
  ganglios_linfaticos: string | null;
  auscultacion: string | null;
  examen_fisico_general: string | null;
  diagnostico_presuntivo: string | null;
  diagnostico_definitivo: string | null;
  tratamiento: string | null;
  indicaciones: string | null;
  medicamentos: { nombre: string; dosis: string; frecuencia: string; duracion: string }[];
  vacunas: { nombre: string; laboratorio: string; lote: string; proxima_dosis: string }[];
  analisis_solicitados: string | null;
  resultados_analisis: string | null;
  proxima_consulta: string | null;
  observaciones_internas: string | null;
}

interface VetOption {
  id: string;
  nombre: string;
  apellido: string;
}

const EMPTY_CONSULTA = {
  fecha: new Date().toISOString().slice(0, 10),
  veterinario_id: "",
  veterinario_nombre: "",
  motivo_consulta: "",
  anamnesis: "",
  peso_kg: "",
  temperatura_c: "",
  frecuencia_cardiaca: "",
  frecuencia_respiratoria: "",
  condicion_corporal: "",
  mucosas: "",
  hidratacion: "",
  ganglios_linfaticos: "",
  auscultacion: "",
  examen_fisico_general: "",
  diagnostico_presuntivo: "",
  diagnostico_definitivo: "",
  tratamiento: "",
  indicaciones: "",
  medicamentos: [{ nombre: "", dosis: "", frecuencia: "", duracion: "" }],
  vacunas: [{ nombre: "", laboratorio: "", lote: "", proxima_dosis: "" }],
  analisis_solicitados: "",
  resultados_analisis: "",
  proxima_consulta: "",
  observaciones_internas: "",
};

export default function ClienteDetallePage() {
  const params = useParams<{ id: string }>();
  const [clienteId, setClienteId] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [mascotaActiva, setMascotaActiva] = useState<Mascota | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [vets, setVets] = useState<VetOption[]>([]);
  const [showMascotaModal, setShowMascotaModal] = useState(false);
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [formMascota, setFormMascota] = useState({ nombre: "", especie: "perro", raza: "", fecha_nacimiento: "", sexo: "no especificado", color_pelaje: "", esterilizado: false });
  const [formConsulta, setFormConsulta] = useState(EMPTY_CONSULTA);

  useEffect(() => {
    if (params?.id) setClienteId(params.id);
  }, [params]);

  async function cargarCliente(id: string) {
    const res = await fetch(`/api/admin/clientes/${id}`, { cache: "no-store" });
    const data = await res.json();
    setCliente(data.cliente || null);
    setMascotas(data.mascotas || []);
    if (!mascotaActiva && data.mascotas?.[0]) setMascotaActiva(data.mascotas[0]);
  }

  async function cargarConsultas(mascotaId: string) {
    const res = await fetch(`/api/admin/mascotas/${mascotaId}/historial`, { cache: "no-store" });
    const data = await res.json();
    setConsultas(data.consultas || []);
  }

  useEffect(() => {
    if (!clienteId) return;
    cargarCliente(clienteId);
    fetch("/api/admin/veterinarios")
      .then((res) => res.json())
      .then((data) => setVets((data.veterinarios || []).filter((v: { activo: boolean }) => v.activo)));
  }, [clienteId]);

  useEffect(() => {
    if (mascotaActiva?.id) cargarConsultas(mascotaActiva.id);
  }, [mascotaActiva?.id]);

  async function agregarMascota(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!clienteId) return;
    const res = await fetch(`/api/admin/clientes/${clienteId}/mascotas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formMascota),
    });
    if (res.ok) {
      setShowMascotaModal(false);
      setFormMascota({ nombre: "", especie: "perro", raza: "", fecha_nacimiento: "", sexo: "no especificado", color_pelaje: "", esterilizado: false });
      await cargarCliente(clienteId);
    }
  }

  async function agregarConsulta(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!mascotaActiva) return;
    const payload = {
      ...formConsulta,
      peso_kg: formConsulta.peso_kg || null,
      temperatura_c: formConsulta.temperatura_c || null,
      frecuencia_cardiaca: formConsulta.frecuencia_cardiaca || null,
      frecuencia_respiratoria: formConsulta.frecuencia_respiratoria || null,
      condicion_corporal: formConsulta.condicion_corporal || null,
    };
    const res = await fetch(`/api/admin/mascotas/${mascotaActiva.id}/historial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowConsultaModal(false);
      setFormConsulta(EMPTY_CONSULTA);
      await cargarConsultas(mascotaActiva.id);
    }
  }

  const edadMascota = useMemo(() => {
    if (!mascotaActiva?.fecha_nacimiento) return "Sin dato";
    const years = Math.floor((Date.now() - new Date(mascotaActiva.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return `${years} años`;
  }, [mascotaActiva?.fecha_nacimiento]);

  return (
    <AdminShell>
      <div className="p-6 max-w-7xl">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h1 className="text-xl font-black text-gray-900">Ficha de cliente</h1>
          <p className="text-gray-500 text-sm mt-1">{cliente ? `${cliente.nombre} ${cliente.apellido} · ${cliente.telefono} · ${cliente.email || "Sin email"}` : "Cargando..."}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Mascotas</h2>
            <button disabled={mascotas.length >= 10} onClick={() => setShowMascotaModal(true)} className="bg-purpura text-white rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-40">Agregar mascota</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {mascotas.map((m) => (
              <button key={m.id} onClick={() => setMascotaActiva(m)} className={`rounded-xl px-3 py-2 text-sm border ${mascotaActiva?.id === m.id ? "bg-purpura/10 border-purpura text-purpura" : "border-gray-200 text-gray-700"}`}>{m.nombre} · {m.especie}</button>
            ))}
          </div>
        </div>

        {mascotaActiva && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-black text-gray-900 text-lg">{mascotaActiva.nombre}</h3>
                <p className="text-sm text-gray-500">{mascotaActiva.especie} · {mascotaActiva.raza || "Sin raza"} · {edadMascota} · {mascotaActiva.sexo || "-"}</p>
              </div>
              <button onClick={() => setShowConsultaModal(true)} className="bg-verde-lima text-gray-900 rounded-xl px-3 py-2 text-xs font-semibold">Nueva consulta</button>
            </div>

            <div className="space-y-3">
              {consultas.map((consulta) => (
                <details key={consulta.id} className="border border-gray-100 rounded-xl p-4">
                  <summary className="cursor-pointer font-semibold text-sm text-gray-900">
                    {consulta.fecha} · {consulta.veterinario_nombre || "Sin veterinario"} · {consulta.motivo_consulta || "Sin motivo"}
                  </summary>
                  <div className="grid md:grid-cols-2 gap-4 mt-3 text-sm">
                    <div><p className="font-semibold">Anamnesis</p><p className="text-gray-600">{consulta.anamnesis || "-"}</p></div>
                    <div><p className="font-semibold">Examen físico</p><p className="text-gray-600">Peso: {consulta.peso_kg || "-"}kg · Temp: {consulta.temperatura_c || "-"}°C · FC: {consulta.frecuencia_cardiaca || "-"} · FR: {consulta.frecuencia_respiratoria || "-"}</p></div>
                    <div><p className="font-semibold">Diagnóstico</p><p className="text-gray-600">{consulta.diagnostico_definitivo || consulta.diagnostico_presuntivo || "-"}</p></div>
                    <div><p className="font-semibold">Tratamiento e indicaciones</p><p className="text-gray-600">{consulta.tratamiento || "-"} {consulta.indicaciones ? `· ${consulta.indicaciones}` : ""}</p></div>
                    <div><p className="font-semibold">Análisis</p><p className="text-gray-600">{consulta.analisis_solicitados || "-"}</p></div>
                    <div><p className="font-semibold">Seguimiento</p><p className="text-gray-600">Próxima consulta: {consulta.proxima_consulta || "-"}</p></div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {showMascotaModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-30">
            <div className="bg-white rounded-2xl w-full max-w-lg p-5 border border-gray-100">
              <h3 className="font-bold mb-3">Agregar mascota</h3>
              <form onSubmit={agregarMascota} className="space-y-3">
                <input required placeholder="Nombre" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={formMascota.nombre} onChange={(e) => setFormMascota((p) => ({ ...p, nombre: e.target.value }))} />
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={formMascota.especie} onChange={(e) => setFormMascota((p) => ({ ...p, especie: e.target.value }))}>
                  {['perro','gato','conejo','ave','otro'].map((esp) => <option key={esp} value={esp}>{esp}</option>)}
                </select>
                <input placeholder="Raza" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={formMascota.raza} onChange={(e) => setFormMascota((p) => ({ ...p, raza: e.target.value }))} />
                <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={formMascota.fecha_nacimiento} onChange={(e) => setFormMascota((p) => ({ ...p, fecha_nacimiento: e.target.value }))} />
                <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowMascotaModal(false)} className="border rounded-xl px-4 py-2 text-sm">Cancelar</button><button className="bg-purpura text-white rounded-xl px-4 py-2 text-sm">Guardar</button></div>
              </form>
            </div>
          </div>
        )}

        {showConsultaModal && mascotaActiva && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-30 overflow-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl p-5 border border-gray-100 my-8">
              <h3 className="font-bold mb-3">Nueva consulta clínica</h3>
              <form onSubmit={agregarConsulta} className="space-y-4 text-sm">
                <div className="grid md:grid-cols-3 gap-3">
                  <input type="date" className="border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.fecha} onChange={(e) => setFormConsulta((p) => ({ ...p, fecha: e.target.value }))} />
                  <select className="border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.veterinario_id} onChange={(e) => {
                    const selected = vets.find((v) => v.id === e.target.value);
                    setFormConsulta((p) => ({ ...p, veterinario_id: e.target.value, veterinario_nombre: selected ? `${selected.nombre} ${selected.apellido}` : "" }));
                  }}>
                    <option value="">Veterinario (opcional)</option>
                    {vets.map((v) => <option key={v.id} value={v.id}>{v.nombre} {v.apellido}</option>)}
                  </select>
                  <input placeholder="Veterinario texto libre" className="border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.veterinario_nombre} onChange={(e) => setFormConsulta((p) => ({ ...p, veterinario_nombre: e.target.value }))} />
                </div>

                <textarea placeholder="Motivo de consulta" className="w-full border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.motivo_consulta} onChange={(e) => setFormConsulta((p) => ({ ...p, motivo_consulta: e.target.value }))} />
                <textarea placeholder="Anamnesis" className="w-full border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.anamnesis} onChange={(e) => setFormConsulta((p) => ({ ...p, anamnesis: e.target.value }))} />
                <div className="grid md:grid-cols-5 gap-3">
                  <input placeholder="Peso (kg)" className="border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.peso_kg} onChange={(e) => setFormConsulta((p) => ({ ...p, peso_kg: e.target.value }))} />
                  <input placeholder="Temp (°C)" className="border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.temperatura_c} onChange={(e) => setFormConsulta((p) => ({ ...p, temperatura_c: e.target.value }))} />
                  <input placeholder="FC" className="border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.frecuencia_cardiaca} onChange={(e) => setFormConsulta((p) => ({ ...p, frecuencia_cardiaca: e.target.value }))} />
                  <input placeholder="FR" className="border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.frecuencia_respiratoria} onChange={(e) => setFormConsulta((p) => ({ ...p, frecuencia_respiratoria: e.target.value }))} />
                  <input placeholder="Condición 1-9" className="border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.condicion_corporal} onChange={(e) => setFormConsulta((p) => ({ ...p, condicion_corporal: e.target.value }))} />
                </div>
                <textarea placeholder="Diagnóstico presuntivo" className="w-full border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.diagnostico_presuntivo} onChange={(e) => setFormConsulta((p) => ({ ...p, diagnostico_presuntivo: e.target.value }))} />
                <textarea placeholder="Diagnóstico definitivo" className="w-full border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.diagnostico_definitivo} onChange={(e) => setFormConsulta((p) => ({ ...p, diagnostico_definitivo: e.target.value }))} />
                <textarea placeholder="Tratamiento" className="w-full border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.tratamiento} onChange={(e) => setFormConsulta((p) => ({ ...p, tratamiento: e.target.value }))} />
                <textarea placeholder="Indicaciones" className="w-full border border-gray-200 rounded-xl px-3 py-2" value={formConsulta.indicaciones} onChange={(e) => setFormConsulta((p) => ({ ...p, indicaciones: e.target.value }))} />

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowConsultaModal(false)} className="border rounded-xl px-4 py-2">Cancelar</button>
                  <button className="bg-purpura text-white rounded-xl px-4 py-2">Guardar consulta</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
