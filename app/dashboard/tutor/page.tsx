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

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/tutor" },
  { icon: "👥", label: "Mis alumnos", href: "/dashboard/tutor/alumnos" },
  { icon: "📅", label: "Sesiones", href: "/dashboard/tutor/sesiones" },
  { icon: "📁", label: "Expedientes", href: "/dashboard/tutor/expedientes" },
  { icon: "📈", label: "Reportes", href: "/dashboard/tutor/reportes" },
];

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
    <div className={cn("rounded-xl border border-white/6 bg-[#151c24]", className)}>
      {children}
    </div>
  );
}

export default function TutorDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tutorNombre, setTutorNombre] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setTutorNombre(user.user_metadata?.nombre_completo || user.email);
        const result = await getTutorDashboardStats(user.id);
        if (result) setData(result);
      } catch (err) {
        toast.error("Error de conexión");
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

  const stats = data?.stats || { totalAlumnos: 0, sesionesPendientes: 0, alertasRiesgo: 0, sesionesCompletadas: 0 };
  const alumnos = data?.alumnosRecientes || [];
  const sesiones = data?.proximasSesiones || [];
  const alumnosEnRiesgo = alumnos.filter((a: any) => (a.nivel_riesgo || a.riesgo) === "Alto" || (a.nivel_riesgo || a.riesgo) === "Medio");

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Tutor" userName={tutorNombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Panel de Tutor</h1>
            <p className="mt-0.5 text-sm text-white/50">Bienvenido, {tutorNombre}</p>
          </div>
          <Button size="sm" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Nueva sesión
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Alumnos asignados" value={stats.totalAlumnos} sub="Total cuatrimestre" icon={Users} accent="green" />
          <StatCard label="Sesiones pendientes" value={stats.sesionesPendientes} sub="Por realizar" icon={CalendarDays} accent="green" />
          <StatCard label="En riesgo alto" value={stats.alertasRiesgo} sub="Atención urgente" icon={AlertTriangle} accent="red" />
          <StatCard label="Sesiones completadas" value={stats.sesionesCompletadas} sub="Historial" icon={CalendarCheck2} accent="green" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SectionCard className="col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Alumnos que requieren atención</p>
              <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                Ver todos <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  <TableHead className="text-[11px] text-white/30 uppercase">Alumno</TableHead>
                  <TableHead className="text-[11px] text-white/30 uppercase">Prom.</TableHead>
                  <TableHead className="text-[11px] text-white/30 uppercase">Riesgo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumnosEnRiesgo.map((a: any) => (
                  <TableRow key={a.id} className="border-white/4 hover:bg-white/3">
                    <TableCell>
                      <p className="text-sm font-medium text-white/90">{a.nombre_completo || a.nombre}</p>
                      <p className="text-xs text-white/35">{a.matricula}</p>
                    </TableCell>
                    <TableCell><GpaCell value={a.promedio} /></TableCell>
                    <TableCell><RiskBadge riesgo={a.nivel_riesgo || a.riesgo} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>

          <SectionCard>
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Próximas sesiones</p>
            </div>
            <div className="flex flex-col gap-2 p-4">
              {sesiones.map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white/90">Sesión Programada</p>
                    <p className="flex items-center gap-1 text-xs text-white/40"><Clock className="h-3 w-3" /> {s.hora}</p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px]">PENDIENTE</Badge>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard>
          <div className="border-b border-white/6 px-5 py-4">
            <p className="text-sm font-semibold text-white">Todos mis alumnos asignados</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                <TableHead className="text-[11px] text-white/30 uppercase">Nombre</TableHead>
                <TableHead className="text-[11px] text-white/30 uppercase">Matrícula</TableHead>
                <TableHead className="text-[11px] text-white/30 uppercase">Promedio</TableHead>
                <TableHead className="text-[11px] text-white/30 uppercase">Riesgo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alumnos.map((a: any) => (
                <TableRow key={a.id} className="border-white/4 hover:bg-white/3">
                  <TableCell className="text-sm font-medium text-white/90">{a.nombre_completo || a.nombre}</TableCell>
                  <TableCell className="text-xs text-white/40 font-mono">{a.matricula}</TableCell>
                  <TableCell><GpaCell value={a.promedio} /></TableCell>
                  <TableCell><RiskBadge riesgo={a.nivel_riesgo || a.riesgo} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </main>
    </div>
  );
}