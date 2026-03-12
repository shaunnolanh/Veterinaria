import AdminShell from "@/components/admin/AdminShell";
import TurnosEspecialidad from "@/components/admin/TurnosEspecialidad";

export default function OftalmologiaPage() {
  return (
    <AdminShell>
      <div>
        <div className="px-6 pt-6 pb-0">
          <h1 className="text-xl font-black text-gray-900">👁️ Oftalmología</h1>
          <p className="text-gray-500 text-sm">Turnos con el especialista en oftalmología</p>
        </div>
        <TurnosEspecialidad especialidad="oftalmologia" />
      </div>
    </AdminShell>
  );
}
