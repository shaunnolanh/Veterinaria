"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { CATEGORIA_LABELS, Producto } from "@/types";

type CategoriaFiltro = "todas" | "alimentos" | "accesorios" | "medicamentos" | "antiparasitarios" | "grooming" | "colchones";

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale?: string }) => unknown;
  }
}

const FILTROS: { key: CategoriaFiltro; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "alimentos", label: "Alimentos" },
  { key: "accesorios", label: "Accesorios" },
  { key: "medicamentos", label: "Medicamentos" },
  { key: "antiparasitarios", label: "Antiparasitarios" },
  { key: "grooming", label: "Grooming" },
  { key: "colchones", label: "Colchones" },
];

export default function TiendaPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaFiltro>("todas");
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [errorCheckout, setErrorCheckout] = useState<string | null>(null);

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

    if (categoriaActiva === "grooming") {
      return productos.filter((producto) => producto.categoria === "shampoos");
    }

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
    <div className="min-h-screen bg-oscuro">
      <Script src="https://sdk.mercadopago.com/js/v2" strategy="afterInteractive" />

      <div className="bg-oscuro-medio border-b border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <span className="text-verde-lima text-sm font-bold uppercase tracking-widest">Peón Pet&apos;s</span>
          <h1 className="text-3xl font-black text-white mt-1">
            Tienda <span className="texto-gradiente">Online</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">Productos para tu mascota con retiro en La Falda.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 flex-wrap mb-8">
          {FILTROS.map((filtro) => (
            <button
              key={filtro.key}
              onClick={() => setCategoriaActiva(filtro.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                categoriaActiva === filtro.key
                  ? "bg-verde-lima text-oscuro"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {filtro.label}
            </button>
          ))}
        </div>

        {cargando ? (
          <p className="text-white/60 py-16 text-center">Cargando catálogo...</p>
        ) : productosFiltrados.length === 0 ? (
          <p className="text-white/50 py-16 text-center">No hay productos disponibles para este filtro.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosFiltrados.map((producto) => {
              const agotado = producto.stock <= 0;
              return (
                <article
                  key={producto.id}
                  className="bg-oscuro-medio border border-white/10 rounded-2xl overflow-hidden flex flex-col"
                >
                  <div className="aspect-video bg-oscuro flex items-center justify-center overflow-hidden">
                    {producto.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={producto.imagen_url} alt={producto.nombre} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl opacity-50">{CATEGORIA_LABELS[producto.categoria]?.icono ?? "🛒"}</span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="text-white font-bold text-lg">{producto.nombre}</h2>
                    <p className="text-white/60 text-sm mt-1 flex-1">{producto.descripcion || "Sin descripción"}</p>
                    <p className="text-verde-lima text-xl font-black mt-3">
                      ${Number(producto.precio).toLocaleString("es-AR")}
                    </p>
                    <p className="text-white/70 text-xs mt-1">Stock disponible: {producto.stock}</p>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      disabled={agotado}
                      className="mt-4 btn-principal disabled:opacity-40 disabled:cursor-not-allowed justify-center"
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
        className="fixed bottom-6 right-6 bg-verde-lima text-oscuro font-black rounded-full px-5 py-3 shadow-lg z-40"
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
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-oscuro-medio border-l border-white/10 z-50 transform transition-transform ${
          carritoAbierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-black text-white text-lg">Tu carrito</h3>
            <button onClick={() => setCarritoAbierto(false)} className="text-white/70">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {carrito.length === 0 ? (
              <p className="text-white/50 text-sm">Todavía no agregaste productos.</p>
            ) : (
              carrito.map((item) => (
                <div key={item.producto.id} className="border border-white/10 rounded-xl p-3">
                  <p className="text-white font-semibold text-sm">{item.producto.nombre}</p>
                  <p className="text-white/60 text-xs">
                    ${Number(item.producto.precio).toLocaleString("es-AR")} x {item.cantidad}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => cambiarCantidad(item.producto.id, -1)} className="px-2 rounded bg-white/10">
                      -
                    </button>
                    <span className="text-white text-sm">{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.producto.id, 1)} className="px-2 rounded bg-white/10">
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-white/10 space-y-2">
            <div className="flex justify-between text-white/70 text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between text-white font-black">
              <span>Total</span>
              <span className="text-verde-lima">${total.toLocaleString("es-AR")}</span>
            </div>
            {errorCheckout && <p className="text-red-400 text-xs">{errorCheckout}</p>}
            <button
              onClick={pagarConMercadoPago}
              disabled={carrito.length === 0 || procesando}
              className="w-full btn-principal justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {procesando ? "Redirigiendo..." : "Pagar con MercadoPago"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
