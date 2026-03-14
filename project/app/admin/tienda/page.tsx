"use client";

import { useState, useEffect, useRef } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Producto, Pedido, CategoriaProducto, EstadoPedido, CATEGORIA_LABELS, ItemPedido } from "@/types";

type TabActiva = "pedidos" | "productos";
type FiltroPedido = "todos" | EstadoPedido;

const ESTADO_PEDIDO_CONFIG: Record<EstadoPedido, { label: string; bg: string; text: string }> = {
  pendiente: { label: "Pendiente", bg: "bg-yellow-100", text: "text-yellow-700" },
  confirmado: { label: "Confirmado", bg: "bg-blue-100", text: "text-blue-700" },
  listo: { label: "Listo para retirar", bg: "bg-green-100", text: "text-green-700" },
  retirado: { label: "Retirado", bg: "bg-gray-100", text: "text-gray-600" },
  cancelado: { label: "Cancelado", bg: "bg-red-100", text: "text-red-700" },
};

const CATEGORIAS = Object.entries(CATEGORIA_LABELS) as [CategoriaProducto, { label: string; icono: string }][];

const FORM_VACIO = {
  nombre: "",
  descripcion: "",
  precio: "",
  categoria: "alimentos" as CategoriaProducto,
  stock: "",
};

export default function AdminTiendaPage() {
  const [tab, setTab] = useState<TabActiva>("pedidos");

  // ─── PEDIDOS ───────────────────────────────────────────────
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [filtroPedido, setFiltroPedido] = useState<FiltroPedido>("todos");
  const [actualizando, setActualizando] = useState<string | null>(null);

  async function cargarPedidos() {
    setCargandoPedidos(true);
    const params = new URLSearchParams({ estado: filtroPedido });
    const res = await fetch(`/api/admin/pedidos?${params}`);
    const data = await res.json();
    setPedidos(data.pedidos || []);
    setCargandoPedidos(false);
  }

  async function cambiarEstadoPedido(id: string, estado: EstadoPedido) {
    setActualizando(id);
    await fetch(`/api/admin/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    await cargarPedidos();
    setActualizando(null);
  }

  useEffect(() => {
    if (tab === "pedidos") cargarPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filtroPedido]);

  // ─── PRODUCTOS ─────────────────────────────────────────────
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [mostrarFormProducto, setMostrarFormProducto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [formProducto, setFormProducto] = useState(FORM_VACIO);
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  const [errorProducto, setErrorProducto] = useState<string | null>(null);

  // CSV import
const [importandoCSV, setImportandoCSV] = useState(false);
const [productosImportados, setProductosImportados] = useState<Partial<Producto>[] | null>(null);
const [guardandoImportados, setGuardandoImportados] = useState(false);
const inputCSVRef = useRef<HTMLInputElement>(null);
const [toast, setToast] = useState<{ mensaje: string; tipo: "info" | "ok" | "error" } | null>(null);

function mostrarToast(mensaje: string, tipo: "info" | "ok" | "error") {
  setToast({ mensaje, tipo });
  setTimeout(() => setToast(null), 3000);
}

  async function cargarProductos() {
    setCargandoProductos(true);
    const res = await fetch("/api/admin/productos");
    const data = await res.json();
    setProductos(data.productos || []);
    setCargandoProductos(false);
  }

  useEffect(() => {
    if (tab === "productos") cargarProductos();
  }, [tab]);

  function abrirFormNuevo() {
    setEditando(null);
    setFormProducto(FORM_VACIO);
    setErrorProducto(null);
    setMostrarFormProducto(true);
  }

  function abrirFormEditar(p: Producto) {
    setEditando(p);
    setFormProducto({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio: String(p.precio),
      categoria: p.categoria,
      stock: String(p.stock),
    });
    setErrorProducto(null);
    setMostrarFormProducto(true);
  }

  async function guardarProducto(e: React.FormEvent) {
    e.preventDefault();
    setGuardandoProducto(true);
    setErrorProducto(null);

    try {
      const payload = {
        nombre: formProducto.nombre,
        descripcion: formProducto.descripcion || null,
        precio: Number(formProducto.precio),
        categoria: formProducto.categoria,
        stock: Number(formProducto.stock) || 0,
      };

      let res: Response;
      if (editando) {
        res = await fetch(`/api/admin/productos/${editando.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/productos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMostrarFormProducto(false);
      await cargarProductos();
    } catch (err) {
      setErrorProducto(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setGuardandoProducto(false);
    }
  }

  async function toggleActivo(producto: Producto) {
    await fetch(`/api/admin/productos/${producto.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !producto.activo }),
    });
    await cargarProductos();
  }

  async function subirImagen(productoId: string, archivo: File) {
  const fd = new FormData();
  fd.append("imagen", archivo);
  mostrarToast("Subiendo imagen...", "info");
  const res = await fetch(`/api/admin/productos/${productoId}`, { method: "POST", body: fd });
  if (res.ok) {
    await cargarProductos();
    mostrarToast("✅ Imagen subida correctamente.", "ok");
  } else {
    mostrarToast("❌ Error al subir la imagen.", "error");
  }
}

  async function procesarCSV(e: React.ChangeEvent<HTMLInputElement>) {
  const archivo = e.target.files?.[0];
  if (!archivo) return;
  setImportandoCSV(true);
  setProductosImportados(null);

  try {
    const fd = new FormData();
    fd.append("csv", archivo);
    const res = await fetch("/api/admin/importar-csv", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setProductosImportados(data.productos);
  } catch (err) {
    alert(err instanceof Error ? err.message : "Error al procesar el CSV.");
  } finally {
    setImportandoCSV(false);
    if (inputCSVRef.current) inputCSVRef.current.value = "";
  }
  }

  async function confirmarImportacion() {
    if (!productosImportados) return;
    setGuardandoImportados(true);
    for (const p of productosImportados) {
      await fetch("/api/admin/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
    }
    setProductosImportados(null);
    setGuardandoImportados(false);
    await cargarProductos();
  }

  return (
    <AdminShell>
      <div className="p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-xl font-black text-gray-900">🛒 Tienda</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de productos y pedidos</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {(["pedidos", "productos"] as TabActiva[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "pedidos" ? "📦 Pedidos" : "🏷️ Productos"}
            </button>
          ))}
        </div>

        {/* ─── TAB PEDIDOS ─── */}
        {tab === "pedidos" && (
          <div>
            {/* Filtros estado */}
            <div className="flex gap-1.5 flex-wrap mb-4">
              {(["todos", "pendiente", "confirmado", "listo", "retirado", "cancelado"] as FiltroPedido[]).map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setFiltroPedido(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filtroPedido === f
                        ? "bg-purpura text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {f === "todos"
                      ? "Todos"
                      : ESTADO_PEDIDO_CONFIG[f as EstadoPedido]?.label || f}
                  </button>
                )
              )}
            </div>

            {cargandoPedidos ? (
              <p className="text-gray-400 py-8 text-center">Cargando pedidos...</p>
            ) : pedidos.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="text-4xl mb-3">📦</p>
                <p className="text-gray-500">No hay pedidos para mostrar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidos.map((pedido) => {
                  const conf = ESTADO_PEDIDO_CONFIG[pedido.estado];
                  const items = pedido.items as ItemPedido[];
                  return (
                    <div
                      key={pedido.id}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <p className="font-bold text-gray-900">
                              {pedido.nombre} {pedido.apellido}
                            </p>
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${conf.bg} ${conf.text}`}
                            >
                              {conf.label}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {pedido.metodo_pago === "mercadopago" ? "💳 MP" : "💵 Efectivo"}
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 space-y-0.5">
                            {items.map((item, idx) => (
                              <p key={idx}>
                                • {item.nombre} x{item.cantidad} — $
                                {(item.precio_unitario * item.cantidad).toLocaleString("es-AR")}
                              </p>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 mt-2">
                            <p className="font-bold text-gray-900 text-sm">
                              Total: ${Number(pedido.total).toLocaleString("es-AR")}
                            </p>
                            <a
                              href={`https://wa.me/54${pedido.telefono.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 text-xs hover:underline"
                            >
                              📱 {pedido.telefono}
                            </a>
                            <p className="text-gray-400 text-xs">
                              {new Date(pedido.created_at).toLocaleString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col gap-2 shrink-0">
                          {pedido.estado === "confirmado" && (
                            <button
                              onClick={() => cambiarEstadoPedido(pedido.id, "listo")}
                              disabled={actualizando === pedido.id}
                              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold px-3 py-2 rounded-lg text-xs whitespace-nowrap"
                            >
                              ✅ Listo para retirar
                            </button>
                          )}
                          {pedido.estado === "listo" && (
                            <button
                              onClick={() => cambiarEstadoPedido(pedido.id, "retirado")}
                              disabled={actualizando === pedido.id}
                              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-bold px-3 py-2 rounded-lg text-xs"
                            >
                              📦 Retirado
                            </button>
                          )}
                          {pedido.estado === "pendiente" && (
                            <button
                              onClick={() => cambiarEstadoPedido(pedido.id, "confirmado")}
                              disabled={actualizando === pedido.id}
                              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-3 py-2 rounded-lg text-xs"
                            >
                              Confirmar
                            </button>
                          )}
                          {["pendiente", "confirmado"].includes(pedido.estado) && (
                            <button
                              onClick={() => cambiarEstadoPedido(pedido.id, "cancelado")}
                              disabled={actualizando === pedido.id}
                              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-2 rounded-lg text-xs border border-red-200"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB PRODUCTOS ─── */}
        {tab === "productos" && (
          <div>
            {/* Header con botones */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <button
                onClick={abrirFormNuevo}
                className="bg-purpura hover:bg-purpura/90 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
              >
                + Agregar producto
              </button>
              <label className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm cursor-pointer transition-all flex items-center gap-2">
              {importandoCSV ? "Procesando..." : "📄 Importar desde CSV"}
              <input
              ref={inputCSVRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={procesarCSV}
              disabled={importandoCSV}
              />
            </label>
            </div>

            {/* Preview importación PDF */}
            {productosImportados && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="font-bold text-blue-900 mb-3">
                  📄 {productosImportados.length} productos extraídos del CSV
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1 mb-3">
                  {productosImportados.map((p, i) => (
                    <p key={i} className="text-xs text-blue-800">
                      • {p.nombre} — ${Number(p.precio).toLocaleString("es-AR")} ({p.categoria})
                    </p>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={confirmarImportacion}
                    disabled={guardandoImportados}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm"
                  >
                    {guardandoImportados ? "Guardando..." : "Confirmar e importar"}
                  </button>
                  <button
                    onClick={() => setProductosImportados(null)}
                    className="bg-white border border-gray-200 text-gray-600 font-semibold px-4 py-2 rounded-lg text-sm"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            )}

            {/* Lista de productos */}
            {cargandoProductos ? (
              <p className="text-gray-400 py-8 text-center">Cargando productos...</p>
            ) : productos.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="text-4xl mb-3">🏷️</p>
                <p className="text-gray-500">No hay productos cargados aún.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoría</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {productos.map((p) => {
                      const cat = CATEGORIA_LABELS[p.categoria];
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {p.imagen_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={p.imagen_url}
                                  alt={p.nombre}
                                  className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                                  {cat?.icono}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{p.nombre}</p>
                                {p.descripcion && (
                                  <p className="text-gray-400 text-xs truncate max-w-[200px]">
                                    {p.descripcion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-gray-500 text-xs">
                              {cat?.icono} {cat?.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-semibold text-gray-900">
                              ${Number(p.precio).toLocaleString("es-AR")}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-semibold text-sm ${p.stock <= 0 ? "text-red-500" : "text-gray-700"}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleActivo(p)}
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold transition-all ${
                                p.activo
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              {p.activo ? "Activo" : "Inactivo"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <label className="text-gray-400 hover:text-gray-600 cursor-pointer" title="Subir foto">
                                📷
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) subirImagen(p.id, f);
                                  }}
                                />
                              </label>
                              <button
                                onClick={() => abrirFormEditar(p)}
                                className="text-purpura hover:text-purpura/80 text-xs font-semibold"
                              >
                                Editar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal producto */}
      {mostrarFormProducto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">
                {editando ? "Editar producto" : "Nuevo producto"}
              </h3>
              <button
                onClick={() => setMostrarFormProducto(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={guardarProducto} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purpura/30 focus:border-purpura"
                  value={formProducto.nombre}
                  onChange={(e) => setFormProducto((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Royal Canin Maxi Adult 15kg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purpura/30 focus:border-purpura resize-none"
                  value={formProducto.descripcion}
                  onChange={(e) => setFormProducto((p) => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Descripción breve del producto"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Precio * ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purpura/30 focus:border-purpura"
                    value={formProducto.precio}
                    onChange={(e) => setFormProducto((p) => ({ ...p, precio: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purpura/30 focus:border-purpura"
                    value={formProducto.stock}
                    onChange={(e) => setFormProducto((p) => ({ ...p, stock: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Categoría *</label>
                <select
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purpura/30 focus:border-purpura"
                  value={formProducto.categoria}
                  onChange={(e) =>
                    setFormProducto((p) => ({ ...p, categoria: e.target.value as CategoriaProducto }))
                  }
                >
                  {CATEGORIAS.map(([val, { label, icono }]) => (
                    <option key={val} value={val}>
                      {icono} {label}
                    </option>
                  ))}
                </select>
              </div>

              {errorProducto && (
                <p className="text-red-600 text-xs bg-red-50 rounded-lg p-2">{errorProducto}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarFormProducto(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoProducto}
                  className="flex-1 bg-purpura hover:bg-purpura/90 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm"
                >
                  {guardandoProducto ? "Guardando..." : editando ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && (
  <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
    toast.tipo === "ok" ? "bg-green-500 text-white" :
    toast.tipo === "error" ? "bg-red-500 text-white" :
    "bg-gray-800 text-white"
  }`}>
    {toast.mensaje}
  </div>
)}
    </AdminShell>
  );
}
