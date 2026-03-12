import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-purpura/20 via-oscuro to-oscuro" />
      <div className="absolute top-20 right-10 w-64 h-64 bg-verde-lima/8 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-purpura/15 rounded-full blur-3xl" />

      {/* Contenido */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
          <span className="w-1.5 h-1.5 bg-verde-lima rounded-full animate-pulse" />
          <span className="text-sm text-white/60 font-medium">
            La Falda, Córdoba · Lun a Vie 9–13 y 16–20
          </span>
        </div>

        {/* Título */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 leading-tight">
          Clínica Veterinaria{" "}
          <span className="texto-gradiente">Peón Pet's</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-white/60 mb-8 max-w-2xl mx-auto leading-relaxed">
          Cuidamos a tu mejor amigo con{" "}
          <span className="text-verde-lima font-medium">dedicación</span> y{" "}
          <span className="text-cian font-medium">profesionalismo</span>
        </p>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/turnos" className="btn-primario text-base py-4 px-8 w-full sm:w-auto justify-center">
            Sacá tu turno
          </Link>
          <a
            href="https://wa.me/5493548156327"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secundario text-base py-4 px-8 w-full sm:w-auto justify-center"
          >
            Escribinos por WhatsApp
          </a>
        </div>

        {/* Indicadores */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="card py-4 text-center">
            <p className="text-2xl font-bold text-verde-lima">4.4</p>
            <p className="text-xs text-white/40 mt-1">★ en Google</p>
          </div>
          <div className="card py-4 text-center">
            <p className="text-2xl font-bold text-cian">7</p>
            <p className="text-xs text-white/40 mt-1">Servicios</p>
          </div>
          <div className="card py-4 text-center">
            <p className="text-2xl font-bold text-violeta">Dra.</p>
            <p className="text-xs text-white/40 mt-1">Nataly</p>
          </div>
        </div>
      </div>

      {/* Flecha abajo */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
        <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
