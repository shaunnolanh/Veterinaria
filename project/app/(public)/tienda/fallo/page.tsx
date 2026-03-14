import Link from "next/link";

export default function TiendaFalloPage() {
  return (
    <div className="min-h-screen bg-oscuro flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-6xl mb-5">❌</p>
        <h1 className="text-2xl font-black text-white mb-2">No se pudo completar el pago</h1>
        <p className="text-white/60 mb-6">
          MercadoPago informó un problema con la operación. Podés volver a intentarlo desde el carrito.
        </p>
        <Link href="/tienda" className="btn-principal justify-center">
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
