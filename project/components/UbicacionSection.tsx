export default function UbicacionSection() {
  return (
    <section id="ubicacion" className="py-20 px-6 lg:px-20 bg-neutral-100">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-10">
          <span className="text-[#6B2FA0] text-sm font-semibold uppercase tracking-[0.2em]">¿Dónde estamos?</span>
          <h2 className="text-3xl sm:text-5xl font-medium text-zinc-900 mt-2 mb-4">
            Nuestra <span className="text-[#A8D400]">Ubicación</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-3xl overflow-hidden border border-zinc-200 h-72 md:h-auto shadow-[0px_4px_12px_2px_rgba(0,0,0,0.06)]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3384.5!2d-64.4862!3d-31.0874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sRivadavia+36%2C+La+Falda%2C+C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "280px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Clínica Veterinaria Peón Pet's"
            />
          </div>

          <div className="card flex flex-col justify-between">
            <h3 className="font-semibold text-zinc-500 mb-5 text-xs uppercase tracking-wider">Cómo llegar</h3>

            <div className="space-y-5 flex-1">
              <div className="flex gap-3">
                <svg className="w-4 h-4 text-[#6B2FA0] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">Rivadavia 36</p>
                  <p className="text-zinc-500 text-xs">La Falda, Córdoba</p>
                </div>
              </div>

              <div className="flex gap-3">
                <svg className="w-4 h-4 text-[#A8D400] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">Código de lugar</p>
                  <p className="text-zinc-500 text-xs font-mono">WG48+HF · La Falda</p>
                </div>
              </div>

              <div className="flex gap-3">
                <svg className="w-4 h-4 text-[#6B2FA0] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">Lun – Vie</p>
                  <p className="text-[#6B2FA0] text-xs">9:00 a 13:00</p>
                  <p className="text-[#A8D400] text-xs">16:00 a 20:00</p>
                </div>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Rivadavia+36,+La+Falda,+Córdoba,+Argentina"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-xs mt-5 w-full justify-center"
            >
              Cómo llegar en Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
