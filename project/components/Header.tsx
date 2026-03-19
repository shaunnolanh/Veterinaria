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
          <img
         src="/logo.png"
         alt="Peón Pet's"
         className="w-10 h-10 object-contain"
         />
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
              className="relative text-base text-zinc-900 hover:text-[#6B2FA0] transition-colors font-medium
              after:absolute after:bottom-0 after:left-0
              after:h-[2px] after:w-0 after:bg-[#6B2FA0]
              after:transition-all after:duration-300
              hover:after:w-full"
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
