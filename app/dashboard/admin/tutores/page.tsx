import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatCard } from "@/app/_components/StatCard";
import { RiskBadge } from "@/app/_components/RiskBadge";
import { TUTORES, ALUMNOS, SESIONES, getAlumnosByTutor } from "@/app/_lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, GraduationCap, CalendarDays, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/admin" },
  { icon: "👥", label: "Usuarios", href: "/dashboard/admin/usuarios" },
  { icon: "🎓", label: "Tutores", href: "/dashboard/admin/tutores" },
  { icon: "📋", label: "Sesiones", href: "/dashboard/admin/sesiones" },
  { icon: "📈", label: "Reportes", href: "/dashboard/admin/reportes" },
  { icon: "📁", label: "Respaldos", href: "/dashboard/admin/respaldos" },
  { icon: "📚", label: "Auditoría", href: "/dashboard/admin/audit" },
  { icon: "⚙️", label: "Configuración", href: "/dashboard/admin/config" },
];

export default function TutoresAdminPage() {
  const totalAlumnos = ALUMNOS.length;
  const totalSesiones = SESIONES.length;
  const promedioAlumnosPorTutor = (totalAlumnos / TUTORES.length).toFixed(1);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Gestión de Tutores"
          subtitle={`${TUTORES.length} tutores activos · Asignaciones y carga de trabajo`}
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total tutores" value={TUTORES.length} sub="Activos este cuatrimestre" icon={GraduationCap} accent="green" />
          <StatCard label="Alumnos asignados" value={totalAlumnos} sub="Total en el sistema" icon={Users} accent="green" />
          <StatCard label="Sesiones totales" value={totalSesiones} sub="Este cuatrimestre" icon={CalendarDays} accent="amber" />
          <StatCard label="Prom. alumnos/tutor" value={promedioAlumnosPorTutor} sub="Distribución de carga" icon={BarChart3} accent="green" />
        </div>

        {/* Tutor detail cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {TUTORES.map((tutor) => {
            const alumnos = getAlumnosByTutor(tutor.id);
            const enRiesgo = alumnos.filter((a) => a.riesgo !== "Bajo").length;

            return (
              <SectionCard key={tutor.id}>
                <div className="border-b border-white/6 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/15">
                      <GraduationCap className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{tutor.nombre}</p>
                      <p className="text-xs text-white/40">{tutor.departamento}</p>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <div className="mb-3 grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-white">{tutor.alumnosAsignados}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Alumnos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-extrabold text-white">{tutor.sesionesEsteCorte}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Sesiones</p>
                    </div>
                    <div className="text-center">
                      <p className={cn("text-lg font-extrabold", enRiesgo > 0 ? "text-amber-400" : "text-emerald-400")}>{enRiesgo}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">En riesgo</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-white/35"><span className="text-white/50">Especialidad:</span> {tutor.especialidad}</p>
                    <p className="text-xs text-white/35"><span className="text-white/50">Correo:</span> {tutor.correo}</p>
                  </div>
                </div>
              </SectionCard>
            );
          })}
        </div>

        {/* Full tutor table */}
        <SectionCard>
          <div className="border-b border-white/6 px-5 py-4">
            <p className="text-sm font-semibold text-white">Asignaciones tutor-alumno</p>
            <p className="text-xs text-white/40">Detalle de alumnos asignados a cada tutor</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                {["Tutor", "Alumno", "Matrícula", "Carrera", "Cuatr.", "Riesgo"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {TUTORES.flatMap((tutor) =>
                getAlumnosByTutor(tutor.id).map((a) => (
                  <TableRow key={`${tutor.id}-${a.id}`} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm text-white/60">{tutor.nombre.split(" ").slice(0, 3).join(" ")}</TableCell>
                    <TableCell className="text-sm font-medium text-white/90">{a.nombre}</TableCell>
                    <TableCell className="font-mono text-xs text-white/50">{a.matricula}</TableCell>
                    <TableCell className="text-sm text-white/50">{a.carrera}</TableCell>
                    <TableCell className="text-sm text-white/50">{a.cuatrimestre}°</TableCell>
                    <TableCell><RiskBadge riesgo={a.riesgo} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </SectionCard>
      </main>
    </div>
  );
}
