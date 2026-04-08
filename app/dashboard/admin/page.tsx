"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { StatCard } from "@/app/_components/StatCard";
import { CreateUserModal } from "./_components/CreateUserModal";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, GraduationCap, ClipboardList, TrendingUp, ChevronRight, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getAdminDashboardStats } from "./actions";
import { toast } from "sonner";

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

function RiskBadge({ riesgo }: { riesgo: string }) {
  const map: Record<string, string> = {
    Alto: "bg-red-500/10 text-red-400 border-red-500/20",
    Medio: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Bajo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", map[riesgo] || "bg-gray-500/10 text-gray-400")}>
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
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const res = await getAdminDashboardStats();
    if (res.data) {
      setStats(res.data);
    } else {
      toast.error(res.error || "Error al cargar estadísticas");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm text-white/40 animate-pulse">Sincronizando panel de control...</p>
        </div>
      </div>
    );
  }

  const { kpis, riesgo, tutorWorkload, recentAlumnos } = stats || {
    kpis: { totalAlumnos: 0, totalTutores: 0, totalSesiones: 0, promedioGeneral: "0.0" },
    riesgo: { alto: 0, medio: 0, bajo: 0 },
    tutorWorkload: [],
    recentAlumnos: []
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Panel de Administración</h1>
            <p className="mt-0.5 text-sm text-white/50">Datos en tiempo real · {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-white/4 text-white/60 hover:bg-white/8 hover:text-white">
              <Download className="h-3.5 w-3.5" /> Exportar
            </Button>
            <CreateUserModal onSuccess={fetchStats} />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total alumnos" value={kpis.totalAlumnos} sub="Inscritos activos" icon={Users} accent="green" />
          <StatCard label="Tutores activos" value={kpis.totalTutores} sub="Perfiles registrados" icon={GraduationCap} accent="green" />
          <StatCard label="Sesiones" value={kpis.totalSesiones} sub="Historial total" icon={ClipboardList} accent="green" />
          <StatCard label="Promedio general" value={kpis.promedioGeneral} sub="Métrica institucional" icon={TrendingUp} accent="amber" />
        </div>

        {/* Grid: distribución + carga */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Distribución de riesgo */}
          <SectionCard>
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Distribución por riesgo académico</p>
              <p className="text-xs text-white/40">{kpis.totalAlumnos} alumnos analizados</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { label: "Alto", count: riesgo.alto, barColor: "bg-red-500", textColor: "text-red-400" },
                { label: "Medio", count: riesgo.medio, barColor: "bg-amber-500", textColor: "text-amber-400" },
                { label: "Bajo", count: riesgo.bajo, barColor: "bg-emerald-500", textColor: "text-emerald-400" },
              ].map(({ label, count, barColor, textColor }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className={cn("w-10 text-xs font-semibold", textColor)}>{label}</span>
                  <div className="flex-1 rounded-full bg-white/6 overflow-hidden h-1.5">
                    <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: kpis.totalAlumnos > 0 ? `${(count / kpis.totalAlumnos) * 100}%` : "0%" }} />
                  </div>
                  <span className="w-5 text-right text-sm font-bold text-white">{count}</span>
                </div>
              ))}
              <div className="mt-4 grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
                {[
                  { label: "Riesgo Alto", count: riesgo.alto, cls: "border-red-500/20 bg-red-500/[0.08] text-red-400" },
                  { label: "Riesgo Medio", count: riesgo.medio, cls: "border-amber-500/20 bg-amber-500/[0.08] text-amber-400" },
                  { label: "Sin riesgo", count: riesgo.bajo, cls: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400" },
                ].map(({ label, count, cls }) => (
                  <div key={label} className={cn("rounded-lg border p-3 text-center", cls)}>
                    <p className="text-2xl font-extrabold leading-none">{count}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Carga por tutor */}
          <SectionCard>
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Carga de trabajo por tutor</p>
              <p className="text-xs text-white/40">{tutorWorkload.length} tutores en activo</p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/6 hover:bg-transparent">
                    {["Tutor", "Alumnos", "Sesiones"].map((h) => (
                      <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tutorWorkload.map((t: any) => (
                    <TableRow key={t.id} className="border-white/4 hover:bg-white/3">
                      <TableCell>
                        <p className="text-sm font-medium text-white/90">{t.nombre}</p>
                        <p className="text-xs text-white/35">{t.departamento}</p>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex min-w-8 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-600/10 px-2 py-0.5 text-xs font-bold text-emerald-400">
                          {t.alumnosAsignados}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-white/80">{t.sesionesTotales}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {tutorWorkload.length === 0 && (
                <p className="py-10 text-center text-xs text-white/20 italic">No hay tutores con carga activa.</p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Padrón de alumnos */}
        <SectionCard>
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">Últimos alumnos registrados</p>
              <p className="text-xs text-white/40">Mostrando {recentAlumnos.length} registros recientes</p>
            </div>
            <Link href="/dashboard/admin/usuarios?rol=Alumno" className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Alumno", "Matrícula", "Carrera", "Cuatr.", "Promedio", "Riesgo", "Tutor"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAlumnos.map((a: any) => (
                  <TableRow key={a.id} className="border-white/4 hover:bg-white/3">
                    <TableCell>
                      <p className="text-sm font-medium text-white/90">{a.nombre}</p>
                      <p className="text-xs text-white/35">{a.correo}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/50">{a.matricula}</TableCell>
                    <TableCell className="text-sm text-white/60">{a.carrera}</TableCell>
                    <TableCell className="text-sm text-white/60">{a.cuatrimestre}°</TableCell>
                    <TableCell>
                      <span className={cn("inline-flex min-w-10 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold", 
                        a.promedio >= 9 ? "bg-emerald-500/12 text-emerald-400" :
                        a.promedio >= 8 ? "bg-amber-500/12 text-amber-400" :
                        "bg-red-500/12 text-red-400"
                      )}>
                        {a.promedio.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell><RiskBadge riesgo={a.riesgo} /></TableCell>
                    <TableCell className="text-xs text-white/40 italic">{a.tutorNombre}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {recentAlumnos.length === 0 && (
              <p className="py-10 text-center text-xs text-white/20 italic">No hay alumnos registrados recientemente.</p>
            )}
          </div>
        </SectionCard>
      </main>
    </div>
  );
}
