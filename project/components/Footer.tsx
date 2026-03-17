import Link from "next/link";
import PawPrint from "./icons/PawPrint";

export default function Footer() {
  return (
    <footer className="bg-neutral-100 border-t border-zinc-200 relative overflow-hidden">
      {/* Patitas decorativas */}
<div className="absolute right-4 bottom-40 opacity-10 pointer-events-none">
  <PawPrint className="w-32 h-32 text-[#6B2FA0]" />
</div>
<div className="absolute right-28 bottom-24 opacity-10 pointer-events-none">
  <PawPrint className="w-20 h-20 text-[#6B2FA0] rotate-12" />
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
