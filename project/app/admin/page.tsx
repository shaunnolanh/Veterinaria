import { createAdminClient } from "@/lib/supabase-server";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";
import { ESPECIALIDAD_LABELS, Especialidad } from "@/types";
export const dynamic = 'force-dynamic';

async function obtenerResumen() {
  const supabase = createAdminClient();
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  const fechaHoy = `${yyyy}-${mm}-${dd}`;

  const [{ data: turnosHoy }, { data: pedidosPendientes }, { data: pedidosHoy }] =
    await Promise.all([
      supabase.from("turnos").select("id, estado, especialidad").eq("fecha", fechaHoy),
      supabase.from("pedidos").select("id").eq("estado", "pendiente"),
      supabase
        .from("pedidos")
        .select("id, estado, total")
        .gte("created_at", `${fechaHoy}T00:00:00`),
    ]);

  return {
    turnosHoy: turnosHoy || [],
    pedidosPendientes: pedidosPendientes || [],
    pedidosHoy: pedidosHoy || [],
  };
}

const ESPECIALIDADES: { key: Especialidad; href: string }[] = [
  { key: "clinica", href: "/admin/clinica" },
  { key: "dermatologia", href: "/admin/dermatologia" },
  { key: "oftalmologia", href: "/admin/oftalmologia" },
  { key: "endocrinologia", href: "/admin/endocrinologia" },
];

export default async function AdminDashboard() {
  const { turnosHoy, pedidosPendientes, pedidosHoy } = await obtenerResumen();

  const pendientesHoy = turnosHoy.filter((t) => t.estado === "pendiente").length;
  const confirmadosHoy = turnosHoy.filter((t) => t.estado === "confirmado").length;
  const ventasHoy = pedidosHoy.reduce((acc, p) => acc + (Number(p.total) || 0), 0);

  return (
    <AdminShell>
      <div className="p-8 max-w-[1280px]">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {new Date().toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Stats del día */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard titulo="Turnos hoy" valor={turnosHoy.length} color="lime" icono="📅" />
          <StatCard titulo="Pendientes" valor={pendientesHoy} color="purple" icono="⏳" />
          <StatCard titulo="Confirmados" valor={confirmadosHoy} color="neutral" icono="✅" />
          <StatCard
            titulo="Pedidos pendientes"
            valor={pedidosPendientes.length}
            color="purple"
            icono="🛒"
          />
        </div>

        {/* Turnos por especialidad */}
        <h2 className="text-base font-bold text-zinc-700 mb-3">Turnos hoy por especialidad</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {ESPECIALIDADES.map(({ key, href }) => {
            const cantidad = turnosHoy.filter((t) => t.especialidad === key).length;
            const { label, icono } = ESPECIALIDAD_LABELS[key];
            return (
              <Link
                key={key}
                href={href}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-purpura/30 transition-all group"
              >
                <p className="text-2xl mb-2">{icono}</p>
                <p className="text-3xl font-black text-gray-900 group-hover:text-purpura transition-colors">
                  {cantidad}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">{label}</p>
              </Link>
            );
          })}
        </div>

        {/* Accesos rápidos */}
        <h2 className="text-base font-bold text-zinc-700 mb-3">Accesos rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <QuickLink href="/admin/especialidades" icono="📅" label="Cargar fechas de especialistas" />
          <QuickLink
            href="/admin/tienda"
            icono="🛒"
            label={`Pedidos pendientes (${pedidosPendientes.length})`}
            badge={pedidosPendientes.length > 0}
          />
          <QuickLink href="/admin/tienda" icono="📦" label="Gestionar productos" />
        </div>

        {/* Ventas del día */}
        {ventasHoy > 0 && (
          <div className="mt-6 bg-verde-lima/10 border border-verde-lima/30 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="font-bold text-gray-900">
                ${ventasHoy.toLocaleString("es-AR")} en ventas hoy
              </p>
              <p className="text-gray-500 text-sm">{pedidosHoy.length} pedidos recibidos</p>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function StatCard({
  titulo,
  valor,
  color,
  icono,
}: {
  titulo: string;
  valor: number;
  color: "lime" | "purple" | "neutral";
  icono: string;
}) {
  const colores = {
    lime: "text-[#A8D400]",
    purple: "text-purpura",
    neutral: "text-zinc-600",
  };
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p className="text-lg mb-2">{icono}</p>
      <p className={`text-3xl font-black ${colores[color]}`}>{valor}</p>
      <p className="text-gray-500 text-xs mt-0.5">{titulo}</p>
    </div>
  );
}

function QuickLink({
  href,
  icono,
  label,
  badge,
}: {
  href: string;
  icono: string;
  label: string;
  badge?: boolean;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-purpura/30 transition-all flex items-center gap-3 group"
    >
      <span className="text-xl">{icono}</span>
      <p className="text-sm font-medium text-gray-700 group-hover:text-purpura transition-colors flex-1">
        {label}
      </p>
      {badge && <span className="w-2 h-2 bg-red-500 rounded-full shrink-0" />}
    </Link>
  );
}
