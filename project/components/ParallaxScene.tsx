/**
 * ClinicaImageSection — Reemplaza el parallax de frames
 * Imagen profesional de veterinaria con overlay y stats clave
 */

export default function ParallaxScene() {
  return (
    <section className="relative h-[65vh] min-h-[420px] overflow-hidden">
      {/* Imagen de fondo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&q=80"
        alt="Clínica Veterinaria Peón Pet's"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Overlay degradado: oscuro izquierda → transparente derecha */}
      <div className="absolute inset-0 bg-gradient-to-r from-oscuro/95 via-oscuro/70 to-oscuro/30" />
      {/* Overlay adicional inferior para blend suave con la siguiente sección */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-oscuro to-transparent" />

      {/* Contenido */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="max-w-xl">

            {/* Label */}
            <p className="text-verde-lima text-xs font-bold uppercase tracking-widest mb-4">
              Nuestra clínica
            </p>

            {/* Título */}
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              Más de 5 años cuidando<br className="hidden sm:block" />
              las mascotas de La Falda
            </h2>

            {/* Subtítulo */}
            <p className="text-white/60 text-base mb-8 leading-relaxed">
              Combinamos experiencia profesional y trato humano para
              brindar la atención que tu mascota se merece.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mb-8">
              <div>
                <p className="text-2xl font-bold text-verde-lima">4.4</p>
                <p className="text-white/40 text-xs mt-0.5">★ Google</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-cian">30+</p>
                <p className="text-white/40 text-xs mt-0.5">Reseñas</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-violeta">7</p>
                <p className="text-white/40 text-xs mt-0.5">Servicios</p>
              </div>
            </div>

            {/* CTA */}
            <a href="/turnos" className="btn-primario inline-flex">
              Reservar turno
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
