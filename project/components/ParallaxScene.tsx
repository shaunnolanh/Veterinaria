/**
 * ClinicaImageSection — Reemplaza el parallax de frames
 * Imagen profesional de veterinaria con overlay y stats clave
 */

export default function ParallaxScene() {
  return (
    <section className="relative h-[65vh] min-h-[420px] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&q=80"
        alt="Clínica Veterinaria Peón Pet's"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#6B2FA0]/90 via-[#6B2FA0]/60 to-[#1A1A2E]/35" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-20 w-full">
          <div className="max-w-xl">
            <p className="text-[#A8D400] text-xs font-semibold uppercase tracking-[0.2em] mb-4">Nuestra clínica</p>

            <h2 className="text-3xl sm:text-5xl font-medium text-white leading-tight mb-4">
              Más de 5 años cuidando
              <br className="hidden sm:block" />
              las mascotas de La Falda
            </h2>

            <p className="text-white/85 text-base mb-8 leading-relaxed">
              Combinamos experiencia profesional y trato humano para brindar la atención que tu mascota se merece.
            </p>

            <a href="/turnos"
              className="btn-secundario inline-flex transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20 active:scale-95"
            >
             Reservar turno
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
