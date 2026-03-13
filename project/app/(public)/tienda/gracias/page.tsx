"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function GraciasContenido() {
  const params = useSearchParams();
  const pedidoId = params.get("pedido");
  const pendiente = params.get("pendiente");

  return (
    <div className="min-h-screen bg-oscuro flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {pendiente ? (
          <>
            <div className="text-6xl mb-6">⏳</div>
            <h1 className="text-2xl font-black text-yellow-400 mb-3">
              Pago en proceso
            </h1>
            <p className="text-white/60 mb-4">
              Tu pago está siendo procesado por Mercado Pago. Te avisamos por
              email cuando se confirme.
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-2xl font-black text-verde-lima mb-3">
              ¡Pedido confirmado!
            </h1>
            <p className="text-white/60 mb-4">
              Recibimos tu pedido y te enviamos un mensaje de confirmación por email.
            </p>
          </>
        )}

        <div className="card mb-6 text-left space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-white font-semibold text-sm">Retiro en</p>
              <p className="text-white/60 text-sm">Rivadavia 36, La Falda</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">🕐</span>
            <div>
              <p className="text-white font-semibold text-sm">Horario</p>
              <p className="text-white/60 text-sm">Lun–Vie · 9:00–13:00 y 16:00–20:00</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">🔔</span>
            <div>
              <p className="text-white font-semibold text-sm">Te avisamos</p>
              <p className="text-white/60 text-sm">
                Recibirás un WhatsApp cuando tu pedido esté listo para retirar.
              </p>
            </div>
          </div>
          {pedidoId && (
            <div className="flex items-start gap-3">
              <span className="text-xl">🧾</span>
              <div>
                <p className="text-white font-semibold text-sm">Nro. de pedido</p>
                <p className="text-white/40 text-xs font-mono">{pedidoId.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/tienda" className="btn-outline text-sm justify-center">
            ← Volver a la tienda
          </Link>
          <Link href="/" className="btn-secundario text-sm justify-center">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GraciasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-oscuro flex items-center justify-center text-white">Cargando...</div>}>
      <GraciasContenido />
    </Suspense>
  );
}
