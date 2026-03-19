"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { CATEGORIA_LABELS, Producto } from "@/types";
import { useCarrito } from "@/context/CarritoContext";

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}
type CategoriaFiltro = "todas" | "alimentos" | "accesorios" | "medicamentos" | "antiparasitarios" | "grooming" | "colchones";

const FILTROS: { key: CategoriaFiltro; label: string }[] = [
  { key: "todas",           label: "Todas" },
  { key: "alimentos",       label: "Alimentos" },
  { key: "accesorios",      label: "Accesorios" },
  { key: "medicamentos",    label: "Medicamentos" },
  { key: "antiparasitarios",label: "Antiparasitarios" },
  { key: "grooming",        label: "Grooming" },
  { key: "colchones",       label: "Colchones" },
];


declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale?: string }) => unknown;
  }
};

export default function TiendaPage() {
  const { carritoAbierto, setCarritoAbierto } = useCarrito();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaFiltro>("todas");
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [procesando, setProcesando] = useState(false);
  const [errorCheckout, setErrorCheckout] = useState<string | null>(null);
  const [datosCliente, setDatosCliente] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  });

  useEffect(() => {
    fetch("/api/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data.productos || []))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (!publicKey || typeof window === "undefined" || !window.MercadoPago) return;
    new window.MercadoPago(publicKey, { locale: "es-AR" });
  }, []);

  const productosFiltrados = useMemo(() => {
    if (categoriaActiva === "todas") return productos;
    return productos.filter((producto) => producto.categoria === categoriaActiva);
  }, [productos, categoriaActiva]);

  function agregarAlCarrito(producto: Producto) {
    if (producto.stock <= 0) return;
    setCarrito((prev) => {
      const itemExistente = prev.find((item) => item.producto.id === producto.id);
      if (!itemExistente) return [...prev, { producto, cantidad: 1 }];

      if (itemExistente.cantidad >= producto.stock) return prev;

      return prev.map((item) =>
        item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      );
    });
    setCarritoAbierto(true);
  }

  function cambiarCantidad(productoId: string, delta: number) {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.producto.id !== productoId) return item;
          const nuevaCantidad = Math.min(Math.max(item.cantidad + delta, 0), item.producto.stock);
          return { ...item, cantidad: nuevaCantidad };
        })
        .filter((item) => item.cantidad > 0)
    );
  }

  const subtotal = carrito.reduce((acc, item) => acc + Number(item.producto.precio) * item.cantidad, 0);
  const total = subtotal;
  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  async function pagarConMercadoPago() {
    if (carrito.length === 0) return;

    const { nombre, apellido, email, telefono } = datosCliente;
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !telefono.trim()) {
      setErrorCheckout("Completá nombre, apellido, email y teléfono para continuar.");
      return;
    }

    setErrorCheckout(null);
    setProcesando(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: carrito.map((item) => ({
            producto_id: item.producto.id,
            cantidad: item.cantidad,
          })),
          cliente: {
            nombre,
            apellido,
            email,
            telefono,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.init_point) {
        throw new Error(data.error || "No se pudo iniciar el checkout.");
      }

      window.location.href = data.init_point;
    } catch (error) {
      setErrorCheckout(error instanceof Error ? error.message : "Ocurrió un error en el checkout.");
      setProcesando(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Script src="https://sdk.mercadopago.com/js/v2" strategy="afterInteractive" />

      <div className="bg-neutral-100 border-b border-zinc-200 py-12 px-6 lg:px-20">
        <div className="max-w-[1280px] mx-auto">
          <span className="text-[#6B2FA0] text-sm font-semibold uppercase tracking-[0.2em]">Peón Pet&apos;s</span>
          <h1 className="text-3xl sm:text-5xl font-medium text-zinc-900 mt-2">
            Tienda <span className="text-[#A8D400]">Online</span>
          </h1>
          <p className="text-zinc-600 text-base mt-2">Productos para tu mascota con retiro en La Falda.</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-20 py-10">
        <div className="flex gap-2 flex-wrap mb-8">
          {FILTROS.map((filtro) => (
            <button
              key={filtro.key}
              onClick={() => setCategoriaActiva(filtro.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                categoriaActiva === filtro.key
                  ? "bg-[#6B2FA0] text-white"
                  : "bg-[#6B2FA0]/10 text-[#6B2FA0] hover:bg-[#6B2FA0]/20"
              }`}
            >
              {filtro.label}
            </button>
          ))}
        </div>

        {cargando ? (
          <p className="text-zinc-600 py-16 text-center">Cargando catálogo...</p>
        ) : productosFiltrados.length === 0 ? (
          <p className="text-zinc-500 py-16 text-center">No hay productos disponibles para este filtro.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosFiltrados.map((producto) => {
              const agotado = producto.stock <= 0;
              return (
              < article
                key={producto.id}
                className="bg-white border border-zinc-200 rounded-3xl overflow-hidden flex flex-col shadow-[0px_4px_12px_2px_rgba(0,0,0,0.06)] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#6B2FA0]/10 active:scale-[0.99] cursor-pointer"
              >
                  <div className="aspect-video bg-neutral-100 flex items-center justify-center overflow-hidden">
                    {producto.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={producto.imagen_url} alt={producto.nombre} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl opacity-50">{CATEGORIA_LABELS[producto.categoria]?.icono ?? "🛒"}</span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="text-zinc-900 font-semibold text-lg">{producto.nombre}</h2>
                    <p className="text-zinc-600 text-base mt-2 flex-1">{producto.descripcion || "Sin descripción"}</p>
                    <p className="text-[#6B2FA0] text-xl font-semibold mt-3">
                      ${Number(producto.precio).toLocaleString("es-AR")}
                    </p>
                    <p className="text-zinc-500 text-xs mt-1">Stock disponible: {producto.stock}</p>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      disabled={agotado}
                      className="mt-4 btn-primario disabled:opacity-40 disabled:cursor-not-allowed justify-center"
                    >
                      {agotado ? "Sin stock" : "Agregar al carrito"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={() => setCarritoAbierto(true)}
        className="fixed bottom-6 right-6 bg-[#6B2FA0] text-white font-semibold rounded-[44px] px-5 py-3 shadow-[0px_4px_12px_2px_rgba(0,0,0,0.06)] z-40"
      >
        Carrito ({cantidadTotal})
      </button>

      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${
          carritoAbierto ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setCarritoAbierto(false)}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white border-l border-zinc-200 z-50 transform transition-transform ${
          carritoAbierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 text-lg">Tu carrito</h3>
            <button onClick={() => setCarritoAbierto(false)} className="text-zinc-600">
              ✕
            </button>
          </div>

     <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {carrito.length === 0 ? (
              <p className="text-zinc-500 text-sm">Todavía no agregaste productos.</p>
            ) : (
              carrito.map((item) => (
                <div key={item.producto.id} className="border border-zinc-200 rounded-2xl p-3 flex gap-3 items-center">
                  {item.producto.imagen_url && (
                    <img
                      src={item.producto.imagen_url}
                      alt={item.producto.nombre}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-zinc-900 font-semibold text-sm">{item.producto.nombre}</p>
                    <p className="text-zinc-500 text-xs">
                      ${Number(item.producto.precio).toLocaleString("es-AR")} x {item.cantidad}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => cambiarCantidad(item.producto.id, -1)} className="px-2 rounded bg-neutral-100">
                        -
                      </button>
                      <span className="text-zinc-900 text-sm">{item.cantidad}</span>
                      <button onClick={() => cambiarCantidad(item.producto.id, 1)} className="px-2 rounded bg-neutral-100">
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-zinc-200 space-y-2">
            <div className="flex justify-between text-zinc-600 text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between text-zinc-900 font-semibold">
              <span>Total</span>
              <span className="text-[#A8D400]">${total.toLocaleString("es-AR")}</span>
            </div>
            <div className="rounded-3xl bg-[#6B2FA0]/5 border border-[#6B2FA0]/20 p-3 space-y-2">
              <p className="text-sm font-semibold text-[#6B2FA0]">Datos para el pedido</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={datosCliente.nombre}
                  onChange={(event) => setDatosCliente((prev) => ({ ...prev, nombre: event.target.value }))}
                  className="w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-[#6B2FA0]/30"
                  placeholder="Nombre *"
                  type="text"
                  required
                />
                <input
                  value={datosCliente.apellido}
                  onChange={(event) => setDatosCliente((prev) => ({ ...prev, apellido: event.target.value }))}
                  className="w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-[#6B2FA0]/30"
                  placeholder="Apellido *"
                  type="text"
                  required
                />
              </div>
              <input
                value={datosCliente.email}
                onChange={(event) => setDatosCliente((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-[#6B2FA0]/30"
                placeholder="Email *"
                type="email"
                required
              />
              <input
                value={datosCliente.telefono}
                onChange={(event) => setDatosCliente((prev) => ({ ...prev, telefono: event.target.value }))}
                className="w-full rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-[#6B2FA0]/30"
                placeholder="Teléfono *"
                type="tel"
                required
              />
            </div>
            {errorCheckout && <p className="text-red-400 text-xs">{errorCheckout}</p>}
            <button
              onClick={pagarConMercadoPago}
              disabled={carrito.length === 0 || procesando}
              className="w-full btn-primario justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {procesando ? "Redirigiendo..." : "Continuar al pago"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
