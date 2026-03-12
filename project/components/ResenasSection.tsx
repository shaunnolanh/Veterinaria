// Reseñas con promedio real de Google: 4.4 estrellas sobre 30 reseñas
const resenas = [
  {
    nombre: "María González",
    estrellas: 5,
    texto:
      "Excelente atención! La Dra. Nataly es muy dedicada y cariñosa con los animales. Mi perra salió encantada de la consulta.",
    fecha: "hace 2 semanas",
    iniciales: "MG",
  },
  {
    nombre: "Carlos Rodríguez",
    estrellas: 5,
    texto:
      "Muy buen servicio. La peluquería canina quedó espectacular. Alexandra es muy amable y profesional.",
    fecha: "hace 1 mes",
    iniciales: "CR",
  },
  {
    nombre: "Laura Fernández",
    estrellas: 4,
    texto:
      "Muy buena clínica, los atienden con mucho cariño. El único detalle es que a veces hay que esperar un poco.",
    fecha: "hace 2 meses",
    iniciales: "LF",
  },
  {
    nombre: "Diego Pérez",
    estrellas: 5,
    texto:
      "La Dra. me explicó todo muy bien sobre la vacunación de mi gato. Muy transparentes y honestos.",
    fecha: "hace 3 meses",
    iniciales: "DP",
  },
];

function Estrellas({ cantidad }: { cantidad: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= cantidad ? "text-yellow-400" : "text-white/20"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ResenasSection() {
  return (
    <section className="seccion">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <span className="text-verde-lima text-sm font-bold uppercase tracking-widest">
            Lo que dicen nuestros clientes
          </span>
          <h2 className="text-3xl sm:text-4xl font-black mt-2 mb-4">
            <span className="texto-gradiente">Reseñas</span> de Google
          </h2>

          {/* Promedio general */}
          <div className="inline-flex items-center gap-4 bg-oscuro-medio border border-white/10 rounded-2xl px-6 py-4 mt-2">
            <div>
              <p className="text-5xl font-black text-yellow-400">4.4</p>
            </div>
            <div className="text-left">
              <Estrellas cantidad={4} />
              <p className="text-white/60 text-sm mt-1">30 reseñas en Google</p>
            </div>
          </div>
        </div>

        {/* Grid de reseñas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resenas.map((resena) => (
            <div key={resena.nombre} className="card hover:border-white/20 transition-all duration-300">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purpura flex items-center justify-center text-sm font-bold">
                  {resena.iniciales}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{resena.nombre}</p>
                  <p className="text-white/40 text-xs">{resena.fecha}</p>
                </div>
              </div>

              {/* Estrellas */}
              <Estrellas cantidad={resena.estrellas} />

              {/* Texto */}
              <p className="text-white/70 text-sm mt-3 leading-relaxed">
                "{resena.texto}"
              </p>
            </div>
          ))}
        </div>

        {/* Link a Google */}
        <div className="text-center mt-8">
          <a
            href="https://maps.google.com/?q=Clínica+Veterinaria+Peon+Pets+Rivadavia+36+La+Falda"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-sm"
          >
            Ver todas las reseñas en Google
          </a>
        </div>
      </div>
    </section>
  );
}
