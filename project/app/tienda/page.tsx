"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Producto, CategoriaProducto, ItemPedido, CATEGORIA_LABELS } from "@/types";

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

const CATEGORIAS_ORDEN: CategoriaProducto[] = [
  "alimentos", "medicamentos", "accesorios", "antiparasitarios", "shampoos", "colchones",
];

export default function TiendaPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaProducto | "todas">("todas");
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [modalCheckout, setModalCheckout] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [errorCheckout, setErrorCheckout] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    metodoPago: "efectivo" as "efectivo" | "mercadopago",
  });

  useEffect(() => {
    fetch("/api/productos")
      .then((r) => r.json())
      .then((data) => {
        setProductos(data.productos || []);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  // Carrito helpers
  function agregarAlCarrito(producto: Producto) {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.producto.id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  }

  function cambiarCantidad(productoId: string, delta: number) {
    setCarrito((prev) =>
      prev
        .map((i) =>
          i.producto.id === productoId ? { ...i, cantidad: i.cantidad + delta } : i
        )
        .filter((i) => i.cantidad > 0)
    );
  }

  const totalCarrito = carrito.reduce(
    (acc, i) => acc + i.producto.precio * i.cantidad,
    0
  );
  const cantidadItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);

  // Filtro de productos
  const productosFiltrados =
    categoriaActiva === "todas"
      ? productos
      : productos.filter((p) => p.categoria === categoriaActiva);

  // Agrupar por categoría para mostrar
  const productosPorCategoria = CATEGORIAS_ORDEN.reduce(
    (acc, cat) => {
      const items = productosFiltrados.filter((p) => p.categoria === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    },
    {} as Record<CategoriaProducto, Producto[]>
  );

  const categoríasConProductos = CATEGORIAS_ORDEN.filter(
    (c) => productos.some((p) => p.categoria === c)
  );

  // Checkout
  async function confirmarPedido(e: React.FormEvent) {
    e.preventDefault();
    if (carrito.length === 0) return;
    setProcesando(true);
    setErrorCheckout(null);

    const items: ItemPedido[] = carrito.map((i) => ({
      producto_id: i.producto.id,
      nombre: i.producto.nombre,
      cantidad: i.cantidad,
      precio_unitario: i.producto.precio,
    }));

    try {
      if (form.metodoPago === "mercadopago") {
        const res = await fetch("/api/crear-preferencia-mp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: form.nombre,
            apellido: form.apellido,
            telefono: form.telefono,
            items,
            total: totalCarrito,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        // Redirigir a Mercado Pago
        const url = data.sandbox_init_point || data.init_point;
        window.location.href = url;
      } else {
        // Efectivo
        const res = await fetch("/api/crear-pedido", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: form.nombre,
            apellido: form.apellido,
            telefono: form.telefono,
            items,
            total: totalCarrito,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        router.push(`/tienda/gracias?pedido=${data.pedidoId}`);
      }
    } catch (err) {
      setErrorCheckout(
        err instanceof Error ? err.message : "Ocurrió un error. Intentá de nuevo."
      );
      setProcesando(false);
    }
  }

  return (
    <div className="min-h-screen bg-oscuro">
      {/* Header tienda */}
      <div className="bg-oscuro-medio border-b border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <span className="text-verde-lima text-sm font-bold uppercase tracking-widest">
            Peón Pet's
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            Tienda <span className="texto-gradiente">Online</span>
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Pedí tus productos y retiralos en la clínica · Rivadavia 36, La Falda
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filtros por categoría */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setCategoriaActiva("todas")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              categoriaActiva === "todas"
                ? "bg-verde-lima text-oscuro font-bold"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Todos
          </button>
          {categoríasConProductos.map((cat) => {
            const { label, icono } = CATEGORIA_LABELS[cat];
            return (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  categoriaActiva === cat
                    ? "bg-verde-lima text-oscuro font-bold"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                <span>{icono}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Productos */}
        {cargando ? (
          <div className="text-center py-16 text-white/40">Cargando productos...</div>
        ) : productos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🏪</p>
            <p className="text-white/50">La tienda está siendo preparada. Volvé pronto.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(productosPorCategoria).map(([cat, items]) => {
              const { label, icono } = CATEGORIA_LABELS[cat as CategoriaProducto];
              return (
                <section key={cat}>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>{icono}</span> {label}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((producto) => {
                      const enCarrito = carrito.find((i) => i.producto.id === producto.id);
                      return (
                        <div
                          key={producto.id}
                          className="bg-oscuro-medio rounded-2xl border border-white/10 overflow-hidden flex flex-col hover:border-verde-lima/30 transition-all group"
                        >
                          {/* Imagen */}
                          <div className="aspect-square bg-oscuro flex items-center justify-center text-4xl overflow-hidden">
                            {producto.imagen_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={producto.imagen_url}
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="opacity-40">{icono}</span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-3 flex flex-col flex-1">
                            <p className="text-white text-xs font-semibold leading-tight mb-1 flex-1">
                              {producto.nombre}
                            </p>
                            <p className="text-verde-lima font-black text-sm mb-2">
                              ${Number(producto.precio).toLocaleString("es-AR")}
                            </p>

                            {enCarrito ? (
                              <div className="flex items-center justify-between bg-verde-lima/10 border border-verde-lima/30 rounded-xl px-2 py-1">
                                <button
                                  onClick={() => cambiarCantidad(producto.id, -1)}
                                  className="text-verde-lima font-black text-base w-6 h-6 flex items-center justify-center"
                                >
                                  −
                                </button>
                                <span className="text-verde-lima font-bold text-sm">
                                  {enCarrito.cantidad}
                                </span>
                                <button
                                  onClick={() => cambiarCantidad(producto.id, 1)}
                                  className="text-verde-lima font-black text-base w-6 h-6 flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => agregarAlCarrito(producto)}
                                className="w-full bg-verde-lima/20 hover:bg-verde-lima text-verde-lima hover:text-oscuro text-xs font-bold py-1.5 rounded-xl transition-all"
                              >
                                Agregar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Carrito flotante */}
      {cantidadItems > 0 && (
        <button
          onClick={() => setCarritoAbierto(true)}
          className="fixed bottom-6 right-6 bg-verde-lima text-oscuro font-black py-3 px-5 rounded-2xl shadow-xl flex items-center gap-3 hover:scale-105 transition-transform z-30"
        >
          <span className="text-lg">🛒</span>
          <span>{cantidadItems} {cantidadItems === 1 ? "producto" : "productos"}</span>
          <span className="bg-oscuro text-verde-lima px-2 py-0.5 rounded-lg text-sm">
            ${totalCarrito.toLocaleString("es-AR")}
          </span>
        </button>
      )}

      {/* Sidebar carrito */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setCarritoAbierto(false)}
          />
          <div className="w-full max-w-sm bg-oscuro-medio border-l border-white/10 flex flex-col h-full overflow-y-auto">
            {/* Header carrito */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="font-black text-white text-lg">Tu carrito</h2>
              <button
                onClick={() => setCarritoAbierto(false)}
                className="text-white/40 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {carrito.map((item) => (
                <div key={item.producto.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-oscuro rounded-xl flex items-center justify-center text-xl overflow-hidden shrink-0">
                    {item.producto.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.producto.imagen_url}
                        alt={item.producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white/30">
                        {CATEGORIA_LABELS[item.producto.categoria]?.icono}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {item.producto.nombre}
                    </p>
                    <p className="text-verde-lima text-xs font-bold">
                      ${Number(item.producto.precio).toLocaleString("es-AR")} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cambiarCantidad(item.producto.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-white font-bold text-sm w-5 text-center">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => cambiarCantidad(item.producto.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total y confirmar */}
            <div className="p-5 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/60">Total</p>
                <p className="text-white font-black text-xl">
                  ${totalCarrito.toLocaleString("es-AR")}
                </p>
              </div>
              <button
                onClick={() => {
                  setCarritoAbierto(false);
                  setModalCheckout(true);
                }}
                className="btn-primario w-full justify-center py-3"
              >
                Confirmar pedido →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal checkout */}
      {modalCheckout && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-oscuro-medio border border-white/20 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-lg">Confirmar pedido</h3>
              <button
                onClick={() => setModalCheckout(false)}
                className="text-white/40 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Resumen */}
            <div className="bg-oscuro rounded-xl p-4 space-y-1 text-sm max-h-32 overflow-y-auto">
              {carrito.map((i) => (
                <div key={i.producto.id} className="flex justify-between text-white/70">
                  <span>{i.producto.nombre} x{i.cantidad}</span>
                  <span>${(i.producto.precio * i.cantidad).toLocaleString("es-AR")}</span>
                </div>
              ))}
              <div className="flex justify-between text-verde-lima font-black pt-1 border-t border-white/10">
                <span>Total</span>
                <span>${totalCarrito.toLocaleString("es-AR")}</span>
              </div>
            </div>

            <form onSubmit={confirmarPedido} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-campo">Nombre *</label>
                  <input
                    type="text"
                    required
                    className="input-campo"
                    placeholder="María"
                    value={form.nombre}
                    onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label-campo">Apellido *</label>
                  <input
                    type="text"
                    required
                    className="input-campo"
                    placeholder="González"
                    value={form.apellido}
                    onChange={(e) => setForm((p) => ({ ...p, apellido: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="label-campo">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  className="input-campo"
                  placeholder="03548 15-12-3456"
                  value={form.telefono}
                  onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))}
                />
                <p className="text-white/40 text-xs mt-1">Te avisamos cuando el pedido esté listo.</p>
              </div>

              {/* Método de pago */}
              <div>
                <label className="label-campo">Método de pago</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, metodoPago: "efectivo" }))}
                    className={`flex flex-col items-center py-4 rounded-xl border-2 transition-all text-sm font-semibold ${
                      form.metodoPago === "efectivo"
                        ? "border-verde-lima bg-verde-lima/10 text-verde-lima"
                        : "border-white/20 text-white/60 hover:border-white/40"
                    }`}
                  >
                    <span className="text-2xl mb-1">💵</span>
                    Efectivo al retirar
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, metodoPago: "mercadopago" }))}
                    className={`flex flex-col items-center py-4 rounded-xl border-2 transition-all text-sm font-semibold ${
                      form.metodoPago === "mercadopago"
                        ? "border-verde-lima bg-verde-lima/10 text-verde-lima"
                        : "border-white/20 text-white/60 hover:border-white/40"
                    }`}
                  >
                    <span className="text-2xl mb-1">💳</span>
                    Mercado Pago
                  </button>
                </div>
              </div>

              {errorCheckout && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-400 text-sm">
                  {errorCheckout}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModalCheckout(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl text-sm"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="flex-1 btn-primario justify-center py-3 disabled:opacity-60"
                >
                  {procesando
                    ? "Procesando..."
                    : form.metodoPago === "mercadopago"
                    ? "Pagar con MP →"
                    : "Confirmar pedido →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
