"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const enlaces = [
    { href: "/#servicios", label: "Servicios" },
    { href: "/#equipo", label: "Equipo" },
    { href: "/#horarios", label: "Horarios" },
    { href: "/#ubicacion", label: "Ubicación" },
    { href: "/#contacto", label: "Contacto" },
    { href: "/tienda", label: "Tienda" },
  ];

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-purpura flex items-center justify-center">
            <span className="text-verde-lima font-black text-sm">PP</span>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-sm text-white">Peón Pet's</p>
            <p className="text-xs text-white/50">Clínica Veterinaria</p>
          </div>
        </Link>

        {/* Navegación desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {enlaces.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="text-sm text-white/70 hover:text-verde-lima transition-colors font-medium"
            >
              {e.label}
            </Link>
          ))}
        </nav>

        {/* Botón turno + hamburguesa */}
        <div className="flex items-center gap-3">
          <Link href="/turnos" className="btn-primario text-sm py-2 px-4 hidden sm:inline-flex">
            Sacar turno
          </Link>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Abrir menú"
          >
            {menuAbierto ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menú mobile */}
      {menuAbierto && (
        <div className="md:hidden bg-oscuro-medio border-t border-white/10 px-4 py-4 flex flex-col gap-3">
          {enlaces.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              onClick={() => setMenuAbierto(false)}
              className="text-base text-white/80 hover:text-verde-lima py-2 transition-colors font-medium"
            >
              {e.label}
            </Link>
          ))}
          <Link
            href="/turnos"
            onClick={() => setMenuAbierto(false)}
            className="btn-primario text-sm py-3 mt-2 justify-center"
          >
            🐾 Sacar turno
          </Link>
        </div>
      )}
    </header>
  );
}
