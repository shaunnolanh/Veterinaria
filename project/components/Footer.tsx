import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-100 border-t border-zinc-200 relative overflow-hidden">
      <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
        <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M101 142.686L104.15 136.006C108.357 127.085 115.932 120.198 125.21 116.866C134.488 113.534 144.708 114.025 153.629 118.232L160.31 121.382C172.344 127.056 186.138 127.717 198.655 123.223L204.364 121.172C230.429 111.811 243.973 83.0858 234.612 57.0208C228.944 41.2358 215.763 29.3315 199.487 25.2918C181.177 20.747 164.154 12.0462 149.742 -0.143188L128.116 -18.4328C113.015 -31.2019 92.2457 -34.9513 73.6338 -28.2678C55.3253 -21.6937 41.817  -6.00169 38.0359 13.0749L32.0408 43.3286C28.5024 61.1789 21.0401 78.0182 10.1916 92.6557L9.56226 93.5047C-0.443718 107.008 -3.04368 124.62 2.62417 140.405C11.9855 166.47 40.7107 180.014 66.7758 170.653L72.4847 168.603C85.0022 164.108 95.3262 154.72 101 142.686Z" fill="#6B2FA0"/>
        </svg>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-20 py-14 relative">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#6B2FA0] flex items-center justify-center">
                <span className="text-[#A8D400] font-bold text-sm">PP</span>
              </div>
              <p className="font-semibold text-base text-zinc-900">Clínica Veterinaria Peón Pet&apos;s</p>
            </div>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Cuidamos a tu mejor amigo con amor y profesionalismo.
            </p>
          </div>

          <div>
            <p className="text-zinc-500 font-semibold mb-4 text-xs uppercase tracking-wider">Navegación</p>
            <div className="flex flex-col gap-2">
              {[
                { href: "/#servicios", label: "Servicios" },
                { href: "/#equipo", label: "Equipo" },
                { href: "/#horarios", label: "Horarios" },
                { href: "/turnos", label: "Sacar turno" },
                { href: "/#contacto", label: "Contacto" },
              ].map((e) => (
                <Link key={e.href} href={e.href} className="text-zinc-600 text-sm hover:text-[#6B2FA0] transition-colors">
                  {e.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-500 font-semibold mb-4 text-xs uppercase tracking-wider">Contacto</p>
            <div className="flex flex-col gap-2 text-sm text-zinc-600">
              <p>Rivadavia 36, La Falda, Cba.</p>
              <a href="tel:+543548495677" className="hover:text-[#6B2FA0] transition-colors">
                03548-495677
              </a>
              <a href="https://wa.me/5493548156327" className="hover:text-[#6B2FA0] transition-colors">
                WhatsApp: 03548 15-63-2527
              </a>
              <a
                href="https://instagram.com/peonpets.lafalda"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#6B2FA0] transition-colors"
              >
                @peonpets.lafalda
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-300 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-zinc-500 text-xs">© 2026 Clínica Veterinaria Peón Pet&apos;s · La Falda, Córdoba, Argentina</p>
          <Link href="/admin" className="text-zinc-500 text-xs hover:text-[#6B2FA0] transition-colors">
            Panel Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
