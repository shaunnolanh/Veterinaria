"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const enlaces = [
    { href: "/#servicios", label: "Servicios" },
    { href: "/#equipo", label: "Equipo" },
    { href: "/#horarios", label: "Horarios" },
    { href: "/tienda", label: "Tienda" },
    { href: "/#ubicacion", label: "Ubicación" },
    { href: "/#contacto", label: "Contacto" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200/80">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-20 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#6B2FA0]/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.915 18.55L9.25417 18.2108C9.70684 17.7582 10.3209 17.5038 10.9614 17.5038C11.6019 17.5038 12.216 17.7582 12.6686 18.2108L13.0078 18.55C13.6188 19.1609 14.4475 19.5042 15.3117 19.5042H15.706V19.5042C17.5055 19.5042 18.9642 18.0455 18.9642 16.246V16.246C18.9642 15.1566 18.4198 14.1393 17.5134 13.535C16.4935 12.8552 15.644 11.9496 15.0306 10.8884L14.1102 9.2962C13.4675 8.18426 12.2806 7.49902 10.9963 7.49902V7.49902C9.73214 7.49902 8.56142 8.16186 7.9114 9.24512L6.8813 10.9619C6.27328 11.9752 5.44786 12.8409 4.4646 13.4964V13.4964C3.55815 14.1007 3.01379 15.118 3.01379 16.2074V16.2074C3.01379 18.0069 4.4725 19.4656 6.27198 19.4656V19.4656H6.66631C7.53048 19.4656 8.35918 19.1223 8.97013 18.5114L8.915 18.55Z" fill="#A8D400" stroke="#A8D400" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="3.75" cy="8" r="1.5" fill="#A8D400" stroke="#A8D400" strokeWidth="1.4"/>
              <circle cx="20.25" cy="8" r="1.5" fill="#A8D400" stroke="#A8D400" strokeWidth="1.4"/>
              <circle cx="8.5" cy="2.5" r="1.5" fill="#A8D400" stroke="#A8D400" strokeWidth="1.4"/>
              <circle cx="15.5" cy="2.5" r="1.5" fill="#A8D400" stroke="#A8D400" strokeWidth="1.4"/>
            </svg>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-base text-zinc-900">Peón Pet&apos;s</p>
            <p className="text-xs text-zinc-500">Clínica Veterinaria</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {enlaces.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="text-base text-zinc-900 hover:text-[#6B2FA0] transition-colors font-medium"
            >
              {e.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/turnos" className="btn-primario text-sm hidden sm:inline-flex">
            Sacar turno
          </Link>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 transition-colors"
            aria-label="Abrir menú"
          >
            {menuAbierto ? (
              <svg className="w-5 h-5 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuAbierto && (
        <div className="md:hidden bg-white border-t border-zinc-200 px-6 py-4 flex flex-col gap-3">
          {enlaces.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              onClick={() => setMenuAbierto(false)}
              className="text-base text-zinc-700 hover:text-[#6B2FA0] py-2 transition-colors font-medium"
            >
              {e.label}
            </Link>
          ))}
          <Link
            href="/turnos"
            onClick={() => setMenuAbierto(false)}
            className="btn-primario text-sm py-3 mt-2"
          >
            Sacar turno
          </Link>
        </div>
      )}
    </header>
  );
}
