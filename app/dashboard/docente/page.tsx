import Sidebar from "@/app/_components/Sidebar";
import { StatCard } from "@/app/_components/StatCard";
import { getAlumnosByDocente, gpaClass, type RiesgoNivel } from "@/app/_lib/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, TrendingUp, AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const DOCENTE_ID    = "d1";
const DOCENTE_NOMBRE = "Mtro. José Antonio Pérez Ruiz";
const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard",     href: "/dashboard/docente" },
  { icon: "👥", label: "Mi grupo",      href: "/dashboard/docente/grupo" },
  { icon: "📝", label: "Calificaciones",href: "/dashboard/docente/calificaciones" },
  { icon: "📋", label: "Asistencias",   href: "/dashboard/docente/asistencias" },
  { icon: "📁", label: "Reportes",      href: "/dashboard/docente/reportes" },
];

function RiskBadge({ riesgo }: { riesgo: RiesgoNivel }) {
  const map = {
    Alto:  "bg-red-500/10 text-red-400 border-red-500/20",
    Medio: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Bajo:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  } as const;
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", map[riesgo])}>{riesgo}</span>;
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-white/[0.06] bg-[#161b27]", className)}>{children}</div>;
}

const CALIFICACIONES = [
  { id: "c1", nombre: "Axel Eduardo García Torres", materia: "Cálculo Diferencial", cal: 6.5, fecha: "15 Mar 2026" },
  { id: "c2", nombre: "Fernanda Ramírez Félix",     materia: "Cálculo Diferencial", cal: 9.2, fecha: "15 Mar 2026" },
  { id: "c3", nombre: "Sofía Beltrán Chávez",       materia: "Ing. de Software",    cal: 9.5, fecha: "14 Mar 2026" },
  { id: "c4", nombre: "Luis Ángel Ponce Villa",     materia: "Cálculo Diferencial", cal: 6.0, fecha: "12 Mar 2026" },
  { id: "c5", nombre: "Karen Ibarra Llanes",        materia: "Ing. de Software",    cal: 9.8, fecha: "10 Mar 2026" },
];

export default function DocenteDashboard() {
  const alumnos   = getAlumnosByDocente(DOCENTE_ID);
  const total     = alumnos.length;
  const promedio  = (alumnos.reduce((s, a) => s + a.promedio, 0) / total).toFixed(1);
  const enRiesgo  = alumnos.filter((a) => a.riesgo !== "Bajo").length;
  const aprobacion = ((alumnos.filter((a) => a.promedio >= 7).length / total) * 100).toFixed(0);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1117]">
      <Sidebar role="Docente" userName={DOCENTE_NOMBRE} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Panel de Docente</h1>
            <p className="mt-0.5 text-sm text-white/50">
              Bienvenido, {DOCENTE_NOMBRE.split(" ")[1]}. Grupo ISC-7A · Cuatrimestre actual.
            </p>
          </div>
          <Button size="sm" className="gap-2 bg-pink-600 text-white shadow-lg shadow-pink-600/25 hover:bg-pink-500">
            <Plus className="h-4 w-4" /> Registrar calificación
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Alumnos en grupo"     value={total}           sub="Grupo ISC-7A"                                      icon={Users}        accent="indigo" />
          <StatCard label="Promedio grupal"       value={promedio}        sub="↑ +0.4 vs parcial anterior" subColor="text-emerald-400" icon={TrendingUp}   accent="amber"  />
          <StatCard label="Alumnos en riesgo"     value={enRiesgo}        sub={`${((enRiesgo / total) * 100).toFixed(0)}% del grupo`} subColor="text-amber-400" icon={AlertTriangle} accent="red" />
          <StatCard label="Índice de aprobación"  value={`${aprobacion}%`} sub="Alumnos con promedio ≥ 7"  subColor="text-emerald-400" icon={CheckCircle2} accent="green"  />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Lista del grupo */}
          <SectionCard>
            <div className="border-b border-white/[0.06] px-5 py-4">
              <p className="text-sm font-semibold text-white">Lista del grupo</p>
              <p className="text-xs text-white/40">{total} alumnos · ISC-7A</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  {["Alumno", "Matrícula", "Promedio", "Estado"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumnos.map((a) => {
                  const gpc = gpaClass(a.promedio);
                  return (
                    <TableRow key={a.id} className="border-white/[0.04] hover:bg-white/[0.03]">
                      <TableCell>
                        <p className="text-sm font-medium text-white/90">{a.nombre}</p>
                        <p className="text-xs text-white/35">{a.carrera} · {a.cuatrimestre}°</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-white/50">{a.matricula}</TableCell>
                      <TableCell>
                        <span className={cn("inline-flex min-w-[2.5rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold",{
                          "bg-emerald-500/12 text-emerald-400": gpc === "gpa-high",
                          "bg-amber-500/12 text-amber-400":     gpc === "gpa-mid",
                          "bg-red-500/12 text-red-400":         gpc === "gpa-low",
                        })}>
                          {a.promedio.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell><RiskBadge riesgo={a.riesgo} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </SectionCard>

          {/* Calificaciones recientes */}
          <SectionCard>
            <div className="border-b border-white/[0.06] px-5 py-4">
              <p className="text-sm font-semibold text-white">Calificaciones recientes</p>
              <p className="text-xs text-white/40">Últimas evaluaciones registradas</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  {["Alumno", "Materia", "Cal."].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {CALIFICACIONES.map((c) => {
                  const gpc = gpaClass(c.cal);
                  return (
                    <TableRow key={c.id} className="border-white/[0.04] hover:bg-white/[0.03]">
                      <TableCell>
                        <p className="text-sm font-medium text-white/90">{c.nombre.split(" ").slice(0, 2).join(" ")}</p>
                        <p className="text-xs text-white/35">{c.fecha}</p>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-xs text-white/60">
                          {c.materia}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn("inline-flex min-w-[2.5rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold",{
                          "bg-emerald-500/12 text-emerald-400": gpc === "gpa-high",
                          "bg-amber-500/12 text-amber-400":     gpc === "gpa-mid",
                          "bg-red-500/12 text-red-400":         gpc === "gpa-low",
                        })}>
                          {c.cal.toFixed(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
