"use client";

import { useState } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { RESPALDOS, formatFechaHora } from "@/app/_lib/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HardDrive, Play, Clock, CheckCircle2, XCircle, Settings } from "lucide-react";
import { StatCard } from "@/app/_components/StatCard";

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

export default function RespaldosPage() {
  const [frecuencia, setFrecuencia] = useState("diario");
  const [hora, setHora] = useState("02:00");
  const [ejecutando, setEjecutando] = useState(false);

  const completados = RESPALDOS.filter((r) => r.estado === "completado").length;
  const fallidos = RESPALDOS.filter((r) => r.estado === "fallido").length;

  function handleEjecutar() {
    setEjecutando(true);
    setTimeout(() => setEjecutando(false), 2000);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Respaldos del Sistema"
          subtitle="Programación y gestión de respaldos automatizados"
          actions={
            <Button
              size="sm"
              onClick={handleEjecutar}
              disabled={ejecutando}
              className="gap-2 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-50"
            >
              {ejecutando ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {ejecutando ? "Ejecutando..." : "Ejecutar respaldo ahora"}
            </Button>
          }
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total respaldos" value={RESPALDOS.length} sub="Registrados en el sistema" icon={HardDrive} accent="green" />
          <StatCard label="Completados" value={completados} sub="Exitosos" subColor="text-emerald-400" icon={CheckCircle2} accent="green" />
          <StatCard label="Fallidos" value={fallidos} sub={fallidos > 0 ? "Requiere atención" : "Sin errores"} subColor={fallidos > 0 ? "text-red-400" : "text-emerald-400"} icon={XCircle} accent={fallidos > 0 ? "red" : "green"} />
          <StatCard label="Último respaldo" value={formatFechaHora(RESPALDOS[0].fecha).split(",")[0]} sub={RESPALDOS[0].tamano} icon={Clock} accent="amber" />
        </div>

        {/* Config */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SectionCard className="lg:col-span-1">
            <div className="border-b border-white/6 px-5 py-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-white/40" />
                <p className="text-sm font-semibold text-white">Configuración de respaldo</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Frecuencia</label>
                <select
                  value={frecuencia}
                  onChange={(e) => setFrecuencia(e.target.value)}
                  className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40"
                >
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Hora de ejecución</label>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Retención</label>
                <select className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40">
                  <option value="7">Últimos 7 días</option>
                  <option value="30">Últimos 30 días</option>
                  <option value="90">Últimos 90 días</option>
                </select>
              </div>
              <Button size="sm" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500 mt-2">
                Guardar configuración
              </Button>
            </div>
          </SectionCard>

          {/* History */}
          <SectionCard className="lg:col-span-2">
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Historial de respaldos</p>
              <p className="text-xs text-white/40">{RESPALDOS.length} registros</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Fecha", "Tipo", "Tamaño", "Estado", "Ejecutado por"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {RESPALDOS.map((r) => (
                  <TableRow key={r.id} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm text-white/60">{formatFechaHora(r.fecha)}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.tipo} variant={r.tipo === "automatico" ? "info" : "neutral"} />
                    </TableCell>
                    <TableCell className="text-sm font-mono text-white/50">{r.tamano}</TableCell>
                    <TableCell><StatusBadge status={r.estado} /></TableCell>
                    <TableCell className="text-sm text-white/40">{r.ejecutadoPor}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
