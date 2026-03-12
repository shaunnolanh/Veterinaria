import AdminShell from "@/components/admin/AdminShell";
import TurnosEspecialidad from "@/components/admin/TurnosEspecialidad";

export default function ClinicaPage() {
  return (
    <AdminShell>
      <div>
        <div className="px-6 pt-6 pb-0">
          <h1 className="text-xl font-black text-gray-900">🏥 Clínica General</h1>
          <p className="text-gray-500 text-sm">Turnos de clínica con la Dra. Nataly</p>
        </div>
        <TurnosEspecialidad especialidad="clinica" />
      </div>
    </AdminShell>
  );
}
