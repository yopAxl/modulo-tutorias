"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { createClient } from "@/lib/supabase/client";
import { StatCard } from "@/app/_components/StatCard"; 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, CalendarDays, AlertTriangle, CalendarCheck2,
  Plus, Clock, ChevronRight, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTutorDashboardStats } from "./actions"; 
import { toast } from "sonner";
import SitemapFooter from "@/app/_components/SitemapFooter";
import { useI18n } from "@/app/_i18n/context";

function RiskBadge({ riesgo }: { riesgo: string }) {
  const map = {
    Alto: "bg-red-500/10 text-red-400 border-red-500/20",
    Medio: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Bajo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  } as any;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", map[riesgo] || map.Bajo)}>
      {riesgo}
    </span>
  );
}

function GpaCell({ value }: { value: number }) {
  return (
    <span className={cn("inline-flex min-w-11 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold", {
      "bg-emerald-500/12 text-emerald-400": value >= 9,
      "bg-amber-500/12 text-amber-400": value >= 8 && value < 9,
      "bg-red-500/12 text-red-400": value < 8,
    })}>
      {value?.toFixed(1) || "0.0"}
    </span>
  );
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-white/6 bg-[#151c24] overflow-hidden", className)}>
      {children}
    </div>
  );
}

function EmptyDataRow({ colSpan, message = "No data" }: { colSpan: number; message?: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-10 text-center text-xs text-white/20 italic">
        {message}
      </TableCell>
    </TableRow>
  );
}

export default function TutorDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tutorNombre, setTutorNombre] = useState("");

  const NAV_ITEMS = [
    { icon: "📊", label: t("nav.tutor.dashboard"), href: "/dashboard/tutor" },
    { icon: "👥", label: t("nav.tutor.students"), href: "/dashboard/tutor/alumnos" },
    { icon: "📅", label: t("nav.tutor.sessions"), href: "/dashboard/tutor/sesiones" },
    { icon: "📁", label: t("nav.tutor.records"), href: "/dashboard/tutor/expedientes" },
    { icon: "📈", label: t("nav.tutor.reports"), href: "/dashboard/tutor/reportes" },
  ];

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const res = await getTutorDashboardStats(user.id);
        
        if (res.error === "PERFIL_NO_ENCONTRADO") {
          setData({ error: "PERFIL_NO_ENCONTRADO" });
          setTutorNombre(user.user_metadata?.nombre_completo || user.email || "Usuario");
        } else if (res.data) {
          setData(res.data);
          setTutorNombre(res.data.tutor.nombre_completo || user.user_metadata?.nombre_completo || user.email);
        } else {
          toast.error(res.error || t("common.errorLoading"));
        }
      } catch (err) {
        toast.error(t("common.connectionError"));
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
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
        <Sidebar role="Tutor" userName={tutorNombre} navItems={NAV_ITEMS} />
        <main className="flex flex-1 items-center justify-center p-8">
          <SectionCard className="max-w-md p-8 text-center border-amber-500/20 bg-amber-500/5">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">{t("tutor.profileNotFound")}</h2>
            <p className="text-sm text-white/60 mb-6">
              {t("tutor.profileNotFoundDesc")}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="border-white/10 hover:bg-white/5">
              {t("common.retry")}
            </Button>
          </SectionCard>
        </main>
      </div>
    );
  }

  const stats = data?.stats || { totalAlumnos: 0, sesionesPendientes: 0, alertasRiesgo: 0, sesionesCompletadas: 0 };
  const alumnos = data?.alumnosRecientes || [];
  const sesiones = data?.proximasSesiones || [];
  const alumnosEnRiesgo = alumnos.filter((a: any) => (a.riesgo) === "Alto" || (a.riesgo) === "Medio");

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Tutor" userName={tutorNombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{t("tutor.title")}</h1>
            <p className="mt-0.5 text-sm text-white/50">{t("tutor.welcome", { name: tutorNombre })}</p>
          </div>
          <Button size="sm" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> {t("tutor.newSession")}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label={t("tutor.stats.assigned")} value={stats.totalAlumnos} sub={t("tutor.stats.assignedSub")} icon={Users} accent="green" />
          <StatCard label={t("tutor.stats.pending")} value={stats.sesionesPendientes} sub={t("tutor.stats.pendingSub")} icon={CalendarDays} accent="green" />
          <StatCard label={t("tutor.stats.risk")} value={stats.alertasRiesgo} sub={t("tutor.stats.riskSub")} icon={AlertTriangle} accent="red" />
          <StatCard label={t("tutor.stats.completed")} value={stats.sesionesCompletadas} sub={t("tutor.stats.completedSub")} icon={CalendarCheck2} accent="green" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SectionCard className="col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">{t("tutor.attentionNeeded")}</p>
              <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                {t("common.viewAll")} <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  <TableHead className="text-[11px] text-white/30 uppercase">{t("tutor.headers.student")}</TableHead>
                  <TableHead className="text-[11px] text-white/30 uppercase">{t("tutor.headers.gpa")}</TableHead>
                  <TableHead className="text-[11px] text-white/30 uppercase">{t("tutor.headers.risk")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumnosEnRiesgo.length > 0 ? (
                  alumnosEnRiesgo.map((a: any, index: number) => (
                    <TableRow key={a.id || `riesgo-${index}`} className="border-white/4 hover:bg-white/3">
                      <TableCell>
                        <p className="text-sm font-medium text-white/90">{a.nombre_completo || a.nombre}</p>
                        <p className="text-xs text-white/35">{a.matricula}</p>
                      </TableCell>
                      <TableCell><GpaCell value={a.promedio} /></TableCell>
                      <TableCell><RiskBadge riesgo={a.riesgo} /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyDataRow colSpan={3} message={t("tutor.noRiskStudents")} />
                )}
              </TableBody>
            </Table>
          </SectionCard>

          <SectionCard>
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">{t("tutor.upcomingSessions")}</p>
            </div>
            <div className="flex flex-col gap-2 p-4">
              {sesiones.length > 0 ? (
                sesiones.map((s: any, index: number) => (
                  <div key={s.id || `sesion-${index}`} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-white/90">{t("tutor.scheduledSession")}</p>
                      <p className="flex items-center gap-1 text-xs text-white/40"><Clock className="h-3 w-3" /> {s.hora}</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px]">{t("tutor.pending")}</Badge>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-xs text-white/20 italic">{t("tutor.noUpcoming")}</p>
              )}
            </div>
          </SectionCard>
        </div>

        <SectionCard>
          <div className="border-b border-white/6 px-5 py-4">
            <p className="text-sm font-semibold text-white">{t("tutor.allStudents")}</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                <TableHead className="text-[11px] text-white/30 uppercase">{t("tutor.headers.student")}</TableHead>
                <TableHead className="text-[11px] text-white/30 uppercase">{t("tutor.headers.matricula")}</TableHead>
                <TableHead className="text-[11px] text-white/30 uppercase">{t("tutor.headers.gpa")}</TableHead>
                <TableHead className="text-[11px] text-white/30 uppercase">{t("tutor.headers.risk")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alumnos.length > 0 ? (
                alumnos.map((a: any, index: number) => (
                  <TableRow key={a.id || `alumno-${index}`} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm font-medium text-white/90">{a.nombre_completo || a.nombre}</TableCell>
                    <TableCell className="text-xs text-white/40 font-mono">{a.matricula}</TableCell>
                    <TableCell><GpaCell value={a.promedio} /></TableCell>
                    <TableCell><RiskBadge riesgo={a.riesgo} /></TableCell>
                  </TableRow>
                ))
              ) : (
                <EmptyDataRow colSpan={4} message={t("tutor.noStudents")} />
              )}
            </TableBody>
          </Table>
        </SectionCard>

        {/* Sitemap Footer */}
        <div className="-mx-4 -mb-4 md:-mx-8 md:-mb-8 mt-12">
          <SitemapFooter />
        </div>
      </main>
    </div>
  );
}