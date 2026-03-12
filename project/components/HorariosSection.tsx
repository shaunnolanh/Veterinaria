// Iconos SVG inline — stroke, sin emojis
function IconoAlerta() {
  return (
    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}
function IconoCalendario() {
  return (
    <svg className="w-5 h-5 text-verde-lima flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
    </svg>
  );
}
function IconoUbicacion() {
  return (
    <svg className="w-5 h-5 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

export default function HorariosSection() {
  const dias = [
    { dia: "Lunes",     abierto: true },
    { dia: "Martes",    abierto: true },
    { dia: "Miércoles", abierto: true },
    { dia: "Jueves",    abierto: true },
    { dia: "Viernes",   abierto: true },
    { dia: "Sábado",    abierto: false },
    { dia: "Domingo",   abierto: false },
  ];

  return (
    <section id="horarios" className="seccion bg-oscuro-medio">
      <div className="max-w-4xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-12">
          <span className="text-verde-lima text-xs font-bold uppercase tracking-widest">
            ¿Cuándo te atendemos?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
            Nuestros <span className="texto-gradiente">Horarios</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tabla de horarios */}
          <div className="card border border-white/10">
            <h3 className="font-semibold text-white/60 mb-4 text-xs uppercase tracking-wider">
              Horario de atención
            </h3>
            <div className="space-y-2">
              {dias.map((d) => (
                <div
                  key={d.dia}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className={`text-sm font-medium ${d.abierto ? "text-white" : "text-white/25"}`}>
                    {d.dia}
                  </span>
                  {d.abierto ? (
                    <div className="text-right">
                      <span className="text-verde-lima text-sm font-medium">9:00 – 13:00</span>
                      <span className="text-white/30 text-sm mx-2">·</span>
                      <span className="text-cian text-sm font-medium">16:00 – 20:00</span>
                    </div>
                  ) : (
                    <span className="text-white/25 text-sm">Cerrado</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha */}
          <div className="flex flex-col gap-4">
            {/* Urgencias */}
            <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <IconoAlerta />
                <h3 className="font-semibold text-red-400 text-sm">Urgencias</h3>
              </div>
              <p className="text-white/50 text-sm mb-3">
                Para emergencias fuera de horario, llamanos al celular:
              </p>
              <a
                href="tel:+5493548156327"
                className="text-red-400 font-semibold text-base hover:text-red-300 transition-colors"
              >
                03548 15-63-2527
              </a>
            </div>

            {/* Turno programado */}
            <div className="card border border-white/10 hover:border-verde-lima/30 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <IconoCalendario />
                <h3 className="font-semibold text-verde-lima text-sm">Turno programado</h3>
              </div>
              <p className="text-white/50 text-sm mb-3">
                Coordiná tu visita con anticipación y evitá esperas.
              </p>
              <a href="/turnos" className="btn-primario text-sm py-2 w-full justify-center">
                Sacar turno online
              </a>
            </div>

            {/* Dirección */}
            <div className="card border border-white/10">
              <div className="flex items-center gap-3">
                <IconoUbicacion />
                <div>
                  <p className="font-semibold text-white text-sm">Rivadavia 36</p>
                  <p className="text-white/40 text-xs">La Falda, Córdoba, Argentina</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
