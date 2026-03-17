import { Metadata } from "next";
import CalendarioTurnos from "@/components/turnos/CalendarioTurnos";

export const metadata: Metadata = {
  title: "Sacar Turno | Clínica Veterinaria Peón Pet's",
  description:
    "Reservá tu turno online en la Clínica Veterinaria Peón Pet's. Fácil, rápido y desde tu celular.",
};

export default function TurnosPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header de la página */}
      <div className="bg-neutral-100 border-b border-zinc-200 py-14 px-6 lg:px-20">
        <div className="max-w-[1280px] mx-auto text-center">
          <span className="text-[#6B2FA0] text-sm font-semibold uppercase tracking-[0.2em]">
            Sistema de turnos
          </span>
          <h1 className="text-3xl sm:text-5xl font-medium text-zinc-900 mt-2 mb-3">
            Sacá tu <span className="text-[#A8D400]">Turno</span>
          </h1>
          <p className="text-zinc-600 max-w-md mx-auto">
            Elegí el día y horario que mejor te quede. Te confirmamos el turno a la
            brevedad.
          </p>
        </div>
      </div>

      {/* Calendario y formulario */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-20 py-10">
        <CalendarioTurnos />
      </div>
    </div>
  );
}
