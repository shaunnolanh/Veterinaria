"use client";
import { useCarrito } from "@/context/CarritoContext";
// Botones flotantes siempre visibles:
// - WhatsApp (verde, esquina inferior derecha)
// - Urgencias (rojo, sobre el WhatsApp)

export default function BotonesFlotantes() {
  const { carritoAbierto } = useCarrito();
  if (carritoAbierto) return null;
  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3 items-end">
      {/* Botón Urgencias */}
      <a
        href="tel:+5493548156327"
        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold rounded-2xl px-4 py-3 shadow-lg shadow-red-900/50 transition-all duration-200 group"
        aria-label="Llamar por urgencia"
      >
        <span className="text-lg">🚨</span>
        <span className="text-sm hidden sm:block">Urgencias</span>
      </a>

      {/* Botón WhatsApp */}
      <a
        href="https://wa.me/5493548156327?text=Hola!%20Necesito%20consultar%20algo."
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-green-500 hover:bg-green-400 active:scale-95 text-white font-bold rounded-2xl px-4 py-3 shadow-lg shadow-green-900/50 transition-all duration-200"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.118 1.522 5.855L.057 23.5l5.796-1.522A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.652-.494-5.18-1.357l-.371-.22-3.842 1.008 1.027-3.748-.241-.386A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
        <span className="text-sm hidden sm:block">WhatsApp</span>
      </a>
    </div>
  );
}
