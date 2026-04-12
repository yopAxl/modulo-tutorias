"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { StatCard } from "@/app/_components/StatCard";
import { createClient } from "@/lib/supabase/client";
import { getDocenteDashboardStats } from "./actions";
import { toast } from "sonner";
import { BookOpen, TrendingUp, AlertTriangle, CheckCircle2, Plus, Loader2, ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SitemapFooter from "@/app/_components/SitemapFooter";
import { useI18n } from "@/app/_i18n/context";

function RiskBadge({ riesgo }: { riesgo: string }) {
  const map: any = {
    Alto: "bg-red-500/10 text-red-400 border-red-500/20",
    Medio: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Bajo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", map[riesgo] || "bg-gray-500/10 text-gray-400")}>{riesgo}</span>;
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-white/6 bg-[#151c24] overflow-hidden", className)}>{children}</div>;
}

function EmptyDataRow({ colSpan, message = "No data" }: { colSpan: number; message?: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-10 text-center text-xs text-white/20 italic font-medium">
        {message}
      </TableCell>
    </TableRow>
  );
}

export default function DocenteDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [docenteNombre, setDocenteNombre] = useState("...");

  const NAV_ITEMS = [
    { icon: "📊", label: t("nav.docente.dashboard"), href: "/dashboard/docente" },
    { icon: "👥", label: t("nav.docente.group"), href: "/dashboard/docente/grupo" },
    { icon: "📝", label: t("nav.docente.grades"), href: "/dashboard/docente/calificaciones" },
    { icon: "📈", label: t("nav.docente.reports"), href: "/dashboard/docente/reportes" },
  ];

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const res = await getDocenteDashboardStats(user.id);
        if (res.error === "PERFIL_NO_ENCONTRADO") {
          setData({ error: "PERFIL_NO_ENCONTRADO" });
          setDocenteNombre(user.user_metadata?.nombre_completo || user.email || "Docente");
        } else if (res.data) {
          setData(res.data);
          setDocenteNombre(res.data.docente.nombre_completo || user.user_metadata?.nombre_completo || user.email);
        } else {
          toast.error(res.error || t("common.errorLoading"));
        }
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        toast.error(t("common.connectionError"));
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (data?.error === "PERFIL_NO_ENCONTRADO") {
    return (
      <div className="flex h-screen overflow-hidden bg-[#0f151c]">
        <Sidebar role="Docente" userName={docenteNombre} navItems={NAV_ITEMS} />
        <main className="flex flex-1 items-center justify-center p-8">
          <SectionCard className="max-w-md p-8 text-center border-amber-500/20 bg-amber-500/5">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">{t("docente.profileNotFound")}</h2>
            <p className="text-sm text-white/60 mb-6">
              {t("docente.profileNotFoundDesc")}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="border-white/10 hover:bg-white/5">
              {t("common.retry")}
            </Button>
          </SectionCard>
        </main>
      </div>
    );
  }

  const alumnos = data?.alumnos || [];
  const total = alumnos.length;
  const promedio = total > 0 ? (alumnos.reduce((s: number, a: any) => s + (a.promedio || 0), 0) / total).toFixed(1) : "0.0";
  const enRiesgo = alumnos.filter((a: any) => a.riesgo !== "Bajo").length;
  const calificaciones = data?.calificacionesRecientes || [];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Docente" userName={docenteNombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{t("docente.title")}</h1>
            <p className="mt-0.5 text-sm text-white/50 space-x-2">
              <span>{t("docente.welcome", { name: docenteNombre })}</span>
              <span className="text-emerald-400 font-medium">
                {data?.docente?.departamento || t("docente.department")}
              </span>
            </p>
          </div>
          <Button size="sm" className="gap-2 bg-emerald-600 text-white shadow-lg shadow-emerald-500/10 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> {t("docente.newGrade")}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label={t("docente.stats.relatedStudents")} value={total} sub={t("docente.stats.relatedStudentsSub")} icon={Users} accent="green" />
          <StatCard label={t("docente.stats.groupAvg")} value={promedio} sub={t("docente.stats.groupAvgSub")} icon={TrendingUp} accent="amber" />
          <StatCard label={t("docente.stats.atRisk")} value={enRiesgo} sub={t("docente.stats.atRiskSub", { percent: total > 0 ? ((enRiesgo / total) * 100).toFixed(0) : "0" })} icon={AlertTriangle} accent="red" />
          <StatCard label={t("docente.stats.grades")} value={calificaciones.length} sub={t("docente.stats.gradesSub")} icon={CheckCircle2} accent="green" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SectionCard className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">{t("docente.courseStudents")}</p>
              <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
                {t("common.viewHistory")} <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {[t("docente.headers.student"), t("docente.headers.matricula"), t("docente.headers.gpa"), t("docente.headers.risk")].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumnos.length > 0 ? alumnos.map((a: any) => (
                  <TableRow key={a.id} className="border-white/4 hover:bg-white/3 transition-colors">
                    <TableCell>
                      <p className="text-sm font-medium text-white/90">{a.nombre_completo}</p>
                      <p className="text-[10px] text-white/35 uppercase">{a.grupo} · {a.carrera}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/50">{a.matricula}</TableCell>
                    <TableCell>
                      <span className={cn("inline-flex min-w-10 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold", {
                        "bg-emerald-500/12 text-emerald-400": a.promedio >= 8.5,
                        "bg-amber-500/12 text-amber-400": a.promedio >= 7 && a.promedio < 8.5,
                        "bg-red-500/12 text-red-400": a.promedio < 7,
                      })}>
                        {a.promedio.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell><RiskBadge riesgo={a.riesgo} /></TableCell>
                  </TableRow>
                )) : (
                  <EmptyDataRow colSpan={4} message={t("docente.noCourseStudents")} />
                )}
              </TableBody>
            </Table>
          </SectionCard>

          <SectionCard>
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">{t("docente.registeredGrades")}</p>
              <p className="text-xs text-white/40">{t("docente.recentEvaluations")}</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {[t("docente.headers.student"), t("docente.headers.subject"), t("docente.headers.grade")].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {calificaciones.length > 0 ? calificaciones.map((c: any) => (
                  <TableRow key={c.id} className="border-white/4 hover:bg-white/3 transition-colors">
                    <TableCell>
                      <p className="text-sm font-medium text-white/90">{c.nombre?.split(" ")[0]}</p>
                      <p className="text-[10px] text-white/35 font-mono">{c.fecha}</p>
                    </TableCell>
                    <TableCell>
                      <span className="truncate block max-w-[120px] text-[11px] text-white/60">
                        {c.materia}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex min-w-9 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold", {
                        "bg-emerald-500/12 text-emerald-400": c.cal >= 8.5,
                        "bg-amber-500/12 text-amber-400": c.cal >= 7 && c.cal < 8.5,
                        "bg-red-500/12 text-red-400": c.cal < 7,
                      })}>
                        {c.cal.toFixed(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                )) : (
                  <EmptyDataRow colSpan={3} />
                )}
              </TableBody>
            </Table>
          </SectionCard>
        </div>
        
        {/* Sitemap Footer */}
        <div className="-mx-4 -mb-4 md:-mx-8 md:-mb-8 mt-12">
          <SitemapFooter />
        </div>
      </main>
    </div>
  );
}