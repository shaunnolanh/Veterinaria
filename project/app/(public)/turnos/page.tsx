import { Metadata } from "next";
import CalendarioTurnos from "@/components/turnos/CalendarioTurnos";

export const metadata: Metadata = {
  title: "Sacar Turno | Clínica Veterinaria Peón Pet's",
  description:
    "Reservá tu turno online en la Clínica Veterinaria Peón Pet's. Fácil, rápido y desde tu celular.",
};

export default function TurnosPage() {
  return (
    <div className="min-h-screen">
      {/* Header de la página */}
      <div className="bg-oscuro-medio border-b border-white/10 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-verde-lima text-sm font-bold uppercase tracking-widest">
            Sistema de turnos
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-2 mb-3">
            Sacá tu <span className="texto-gradiente">Turno</span>
          </h1>
          <p className="text-white/60 max-w-md mx-auto">
            Elegí el día y horario que mejor te quede. Te confirmamos el turno a la
            brevedad.
          </p>
        </div>
      </div>

      {/* Calendario y formulario */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <CalendarioTurnos />
      </div>
    </div>
  );
}
