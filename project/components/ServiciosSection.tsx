import Link from "next/link";

function Icono({ path, clase = "" }: { path: string; clase?: string }) {
  return (
    <svg
      className={`w-6 h-6 ${clase}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const servicios = [
  {
    icono: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    color: "text-[#A8D400]",
    bg: "bg-[#6B2FA0]/10",
    titulo: "Consulta General",
    descripcion: "Revisación completa de tu mascota con diagnóstico personalizado.",
    badge: null,
  },
  {
    icono: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
    color: "text-[#A8D400]",
    bg: "bg-[#6B2FA0]/10",
    titulo: "Urgencias",
    descripcion: "Atención de emergencias para cuando tu mascota más te necesita.",
    badge: "Urgente",
  },
  {
    icono: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
    color: "text-[#A8D400]",
    bg: "bg-[#6B2FA0]/10",
    titulo: "Vacunación",
    descripcion: "Plan de vacunación completo según la edad y especie de tu mascota.",
    badge: null,
  },
  {
    icono: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5",
    color: "text-[#A8D400]",
    bg: "bg-[#6B2FA0]/10",
    titulo: "Control General",
    descripcion: "Chequeos periódicos para mantener a tu mascota siempre sana.",
    badge: null,
  },
  {
    icono: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
    color: "text-[#A8D400]",
    bg: "bg-[#6B2FA0]/10",
    titulo: "Peluquería Canina",
    descripcion: "Baño, corte y acicalado para que tu perro luzca hermoso.",
    badge: null,
  },
  {
    icono: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    color: "text-[#A8D400]",
    bg: "bg-[#6B2FA0]/10",
    titulo: "Radiología",
    descripcion: "Diagnóstico por imagen para detectar problemas internos.",
    badge: "Especializado",
  },
];

export default function ServiciosSection() {
  return (
    <section id="servicios" className="py-20 px-6 lg:px-20 bg-neutral-100">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-[#6B2FA0] text-sm font-semibold uppercase tracking-[0.2em]">¿Qué hacemos?</span>
          <h2 className="text-3xl sm:text-5xl font-medium text-zinc-900 mt-2 mb-4">
            Nuestros <span className="text-[#A8D400]">Servicios</span>
          </h2>
          <p className="text-zinc-600 max-w-xl mx-auto text-base leading-relaxed">
            Todo lo que tu mascota necesita en un solo lugar, con el cuidado y la atención que se merece.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicios.map((s, index) => (
            <div
              key={s.titulo}
              className={`rounded-3xl p-6 shadow-[0px_4px_12px_2px_rgba(0,0,0,0.06)] ${
                index === 1 ? "bg-[#6B2FA0]" : "bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${index === 1 ? "bg-white/15" : s.bg} rounded-[36px] flex items-center justify-center flex-shrink-0`}>
                  <Icono path={s.icono} clase={index === 1 ? "text-[#A8D400]" : s.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-semibold text-base ${index === 1 ? "text-white" : "text-zinc-900"}`}>{s.titulo}</h3>
                    {s.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${index === 1 ? "bg-white/20 text-white" : "bg-[#A8D400]/20 text-[#6B2FA0]"}`}>
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${index === 1 ? "text-white/85" : "text-zinc-600"}`}>{s.descripcion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

         <div className="text-center mt-10">
         <Link
         href="/turnos"
         className="btn-primario inline-flex transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#6B2FA0]/40 active:scale-95"
         >
         Sacá tu turno ahora
       </Link>
       </div>
       </div>
    </section>
  );
}
