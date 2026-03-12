export default function EquipoSection() {
  const equipo = [
    {
      nombre: "Dra. Nataly",
      rol: "Veterinaria Principal",
      descripcion:
        "Especialista en medicina veterinaria general con amplia experiencia en diagnóstico, tratamiento y cuidado de mascotas.",
      iniciales: "DN",
      color: "bg-purpura",
      especialidades: ["Medicina general", "Diagnóstico", "Cirugía menor"],
    },
    {
      nombre: "Alexandra",
      rol: "Asistente Veterinaria",
      descripcion:
        "Asistente especializada en el cuidado y bienestar animal, ayudando a que cada visita sea cómoda para tu mascota.",
      iniciales: "AL",
      color: "bg-cian",
      especialidades: ["Peluquería canina", "Asistencia clínica", "Bienestar animal"],
    },
  ];

  return (
    <section id="equipo" className="seccion">
      <div className="max-w-4xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-12">
          <span className="text-verde-lima text-xs font-bold uppercase tracking-widest">
            Quiénes somos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
            Nuestro <span className="texto-gradiente">Equipo</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-sm leading-relaxed">
            Profesionales comprometidos con la salud y el bienestar de tus mascotas.
          </p>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {equipo.map((persona) => (
            <div
              key={persona.nombre}
              className="card border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className={`w-16 h-16 ${persona.color} rounded-xl flex items-center justify-center mb-4 text-white font-bold text-xl`}>
                  {persona.iniciales}
                </div>

                <h3 className="font-bold text-lg text-white mb-0.5">{persona.nombre}</h3>
                <p className="text-verde-lima text-xs font-semibold uppercase tracking-wide mb-3">
                  {persona.rol}
                </p>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  {persona.descripcion}
                </p>

                {/* Tags de especialidades — texto, sin emojis */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {persona.especialidades.map((esp) => (
                    <span
                      key={esp}
                      className="text-xs bg-white/5 text-white/40 border border-white/10 rounded-md px-2.5 py-1"
                    >
                      {esp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
