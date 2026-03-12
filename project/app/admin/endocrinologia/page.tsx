import AdminShell from "@/components/admin/AdminShell";
import TurnosEspecialidad from "@/components/admin/TurnosEspecialidad";

export default function EndocrinologiaPage() {
  return (
    <AdminShell>
      <div>
        <div className="px-6 pt-6 pb-0">
          <h1 className="text-xl font-black text-gray-900">💊 Endocrinología</h1>
          <p className="text-gray-500 text-sm">Turnos con el especialista en endocrinología</p>
        </div>
        <TurnosEspecialidad especialidad="endocrinologia" />
      </div>
    </AdminShell>
  );
}
