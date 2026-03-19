export default function EquipoSection() {
  const equipo = [
    {
      nombre: "Dra. Nataly",
       foto: "/equipo/nataly.jpg",
      rol: "Veterinaria Principal",
      descripcion:
        "Especialista en medicina veterinaria general con amplia experiencia en diagnóstico, tratamiento y cuidado de mascotas.",
      iniciales: "DN",
      color: "bg-[#6B2FA0]",
      especialidades: ["Medicina general", "Diagnóstico", "Cirugía menor"],
    },
    {
      nombre: "Alexandra",
      foto: "/equipo/alexandra.jpg",
      rol: "Asistente Veterinaria",
      descripcion:
        "Asistente especializada en el cuidado y bienestar animal, ayudando a que cada visita sea cómoda para tu mascota.",
      iniciales: "AL",
      color: "bg-[#A8D400]",
      especialidades: ["Peluquería canina", "Asistencia clínica", "Bienestar animal"],
    },
  ];

  return (
    <section id="equipo" className="py-20 px-6 lg:px-20 bg-white">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-[#6B2FA0] text-sm font-semibold uppercase tracking-[0.2em]">Quiénes somos</span>
          <h2 className="text-3xl sm:text-5xl font-medium text-zinc-900 mt-2 mb-4">
            Nuestro <span className="text-[#A8D400]">Equipo</span>
          </h2>
          <p className="text-zinc-600 max-w-xl mx-auto text-base leading-relaxed">
            Profesionales comprometidos con la salud y el bienestar de tus mascotas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
  {equipo.map((persona) => (
    <div key={persona.nombre} className="card transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.99] cursor-pointer">
      <div className="flex flex-col items-center text-center">
        {persona.foto ? (
          <img
            src={persona.foto}
            alt={persona.nombre}
            className="w-20 h-20 rounded-[36px] object-cover object-top mb-4"
          />
        ) : (
          <div className={`w-20 h-20 ${persona.color} rounded-[36px] flex items-center justify-center mb-4 text-white font-semibold text-xl`}>
            {persona.iniciales}
          </div>
        )}

                <h3 className="font-semibold text-xl text-zinc-900 mb-1">{persona.nombre}</h3>
                <p className="text-[#6B2FA0] text-xs font-semibold uppercase tracking-[0.15em] mb-3">{persona.rol}</p>
                <p className="text-zinc-600 text-sm leading-relaxed mb-4">{persona.descripcion}</p>

                <div className="flex flex-wrap gap-2 justify-center">
                  {persona.especialidades.map((esp) => (
                    <span key={esp} className="text-xs bg-[#6B2FA0]/10 text-[#6B2FA0] rounded-full px-3 py-1">
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
