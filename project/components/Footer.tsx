import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-oscuro-medio border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Logo y descripción */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purpura flex items-center justify-center">
                <span className="text-verde-lima font-bold text-xs">PP</span>
              </div>
              <p className="font-semibold text-sm text-white">Clínica Veterinaria Peón Pet&apos;s</p>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Cuidamos a tu mejor amigo con amor y profesionalismo.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-white/50 font-semibold mb-3 text-xs uppercase tracking-wider">
              Navegación
            </p>
            <div className="flex flex-col gap-2">
              {[
                { href: "/#servicios", label: "Servicios" },
                { href: "/#equipo",    label: "Equipo" },
                { href: "/#horarios",  label: "Horarios" },
                { href: "/turnos",     label: "Sacar turno" },
                { href: "/#contacto",  label: "Contacto" },
              ].map((e) => (
                <Link
                  key={e.href}
                  href={e.href}
                  className="text-white/40 text-sm hover:text-verde-lima transition-colors"
                >
                  {e.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-white/50 font-semibold mb-3 text-xs uppercase tracking-wider">
              Contacto
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/40">
              <p>Rivadavia 36, La Falda, Cba.</p>
              <a href="tel:+543548495677" className="hover:text-verde-lima transition-colors">
                03548-495677
              </a>
              <a href="https://wa.me/5493548156327" className="hover:text-verde-lima transition-colors">
                WhatsApp: 03548 15-63-2527
              </a>
              <a
                href="https://instagram.com/peonpets.lafalda"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-violeta transition-colors"
              >
                @peonpets.lafalda
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            © 2026 Clínica Veterinaria Peón Pet&apos;s · La Falda, Córdoba, Argentina
          </p>
          <Link href="/admin" className="text-white/20 text-xs hover:text-white/40 transition-colors">
            Panel Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
