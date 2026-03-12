"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icono: "📊", exacto: true },
  { href: "/admin/clinica", label: "Clínica General", icono: "🏥" },
  { href: "/admin/dermatologia", label: "Dermatología", icono: "🔬" },
  { href: "/admin/oftalmologia", label: "Oftalmología", icono: "👁️" },
  { href: "/admin/endocrinologia", label: "Endocrinología", icono: "💊" },
  { href: "/admin/especialidades", label: "Fechas Especialistas", icono: "📅" },
  { href: "/admin/tienda", label: "Tienda", icono: "🛒" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function cerrarSesion() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function esActivo(href: string, exacto?: boolean) {
    if (exacto) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-10">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purpura flex items-center justify-center shrink-0">
              <span className="text-verde-lima font-black text-xs">PP</span>
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm leading-tight">Panel Admin</p>
              <p className="text-gray-400 text-xs">Peón Pet's</p>
            </div>
          </Link>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const activo = esActivo(item.href, item.exacto);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activo
                    ? "bg-purpura/10 text-purpura font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-base">{item.icono}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={cerrarSesion}
            className="w-full text-left text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-2"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
