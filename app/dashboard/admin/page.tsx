import Sidebar from "@/app/_components/Sidebar";
import { StatCard } from "@/app/_components/StatCard";
import { ALUMNOS, TUTORES, SESIONES, gpaClass, type RiesgoNivel } from "@/app/_lib/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, GraduationCap, ClipboardList, TrendingUp, ChevronRight, Plus, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

function RiskBadge({ riesgo }: { riesgo: RiesgoNivel }) {
  const map = {
    Alto: "bg-red-500/10 text-red-400 border-red-500/20",
    Medio: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Bajo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  } as const;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", map[riesgo])}>
      {riesgo}
    </span>
  );
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-white/6 bg-[#151c24]", className)}>{children}</div>
  );
}

export default function AdminDashboard() {
  const total = ALUMNOS.length;
  const alto = ALUMNOS.filter((a) => a.riesgo === "Alto").length;
  const medio = ALUMNOS.filter((a) => a.riesgo === "Medio").length;
  const bajo = ALUMNOS.filter((a) => a.riesgo === "Bajo").length;
  const promedio = (ALUMNOS.reduce((s, a) => s + a.promedio, 0) / total).toFixed(1);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Panel de Administración</h1>
            <p className="mt-0.5 text-sm text-white/50">Visión general del sistema · Marzo 2026</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-white/4 text-white/60 hover:bg-white/8 hover:text-white">
              <Download className="h-3.5 w-3.5" /> Exportar
            </Button>
            <Button size="sm" className="gap-2 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-600">
              <Plus className="h-4 w-4" /> Nuevo usuario
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total alumnos" value={total} sub="↑ Inscritos este cuatrimestre" subColor="text-emerald-400" icon={Users} accent="green" />
          <StatCard label="Tutores activos" value={TUTORES.length} sub="Asignados este período" icon={GraduationCap} accent="green" />
          <StatCard label="Sesiones registradas" value={SESIONES.length} sub="↑ Este mes" subColor="text-emerald-400" icon={ClipboardList} accent="green" />
          <StatCard label="Promedio general" value={promedio} sub="↑ +0.3 vs cuatrimestre anterior" subColor="text-emerald-400" icon={TrendingUp} accent="amber" />
        </div>

        {/* Grid: distribución + carga */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Distribución de riesgo */}
          <SectionCard>
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Distribución por riesgo académico</p>
              <p className="text-xs text-white/40">{total} alumnos en el sistema</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { label: "Alto", count: alto, barColor: "bg-red-500", textColor: "text-red-400" },
                { label: "Medio", count: medio, barColor: "bg-amber-500", textColor: "text-amber-400" },
                { label: "Bajo", count: bajo, barColor: "bg-emerald-500", textColor: "text-emerald-400" },
              ].map(({ label, count, barColor, textColor }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className={cn("w-10 text-xs font-semibold", textColor)}>{label}</span>
                  <div className="flex-1 rounded-full bg-white/6 overflow-hidden h-1.5">
                    <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                  <span className="w-5 text-right text-sm font-bold text-white">{count}</span>
                </div>
              ))}
              <div className="mt-4 grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
                {[
                  { label: "Riesgo Alto", count: alto, cls: "border-red-500/20 bg-red-500/[0.08] text-red-400" },
                  { label: "Riesgo Medio", count: medio, cls: "border-amber-500/20 bg-amber-500/[0.08] text-amber-400" },
                  { label: "Sin riesgo", count: bajo, cls: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400" },
                ].map(({ label, count, cls }) => (
                  <div key={label} className={cn("rounded-lg border p-3 text-center", cls)}>
                    <p className="text-2xl font-extrabold leading-none">{count}</p>
                    <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Carga por tutor */}
          <SectionCard>
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Carga de trabajo por tutor</p>
              <p className="text-xs text-white/40">{TUTORES.length} tutores activos este cuatrimestre</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Tutor", "Alumnos", "Sesiones"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {TUTORES.map((t) => (
                  <TableRow key={t.id} className="border-white/4 hover:bg-white/3">
                    <TableCell>
                      <p className="text-sm font-medium text-white/90">{t.nombre.split(" ").slice(0, 3).join(" ")}</p>
                      <p className="text-xs text-white/35">{t.departamento}</p>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex min-w-8 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-600/10 px-2 py-0.5 text-xs font-bold text-emerald-400">
                        {t.alumnosAsignados}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-white/80">{t.sesionesEsteCorte}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </div>

        {/* Padrón de alumnos */}
        <SectionCard>
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">Padrón de alumnos</p>
              <p className="text-xs text-white/40">{total} alumnos registrados</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
              Gestionar <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                {["Alumno", "Matrícula", "Carrera", "Cuatr.", "Promedio", "Riesgo", "Tutor"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ALUMNOS.map((a) => {
                const tutor = TUTORES.find((t) => t.id === a.tutorId);
                const gpc = gpaClass(a.promedio);
                return (
                  <TableRow key={a.id} className="border-white/4 hover:bg-white/3">
                    <TableCell>
                      <p className="text-sm font-medium text-white/90">{a.nombre}</p>
                      <p className="text-xs text-white/35">{a.correo}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/50">{a.matricula}</TableCell>
                    <TableCell className="text-sm text-white/60">{a.carrera}</TableCell>
                    <TableCell className="text-sm text-white/60">{a.cuatrimestre}°</TableCell>
                    <TableCell>
                      <span className={cn("inline-flex min-w-10 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold", {
                        "bg-emerald-500/12 text-emerald-400": gpc === "gpa-high",
                        "bg-amber-500/12 text-amber-400": gpc === "gpa-mid",
                        "bg-red-500/12 text-red-400": gpc === "gpa-low",
                      })}>
                        {a.promedio.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell><RiskBadge riesgo={a.riesgo} /></TableCell>
                    <TableCell className="text-xs text-white/40">{tutor?.nombre.split(" ").slice(0, 3).join(" ") ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </SectionCard>
      </main>
    </div>
  );
}
