"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { formatFechaHora, formatTamano } from "@/app/_lib/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listBackups, getBackupDownloadUrl, triggerManualBackup } from "./actions";
import { toast } from "sonner";
import { HardDrive, Play, Clock, CheckCircle2, XCircle, Settings, Download } from "lucide-react";
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
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    async function loadBackups() {
      const res = await listBackups();
      if (!res.error && res.data) {
        setBackups(res.data);
      } else if (res.error) {
        toast.error(res.error);
      }
      setLoading(false);
    }
    loadBackups();
  }, []);

  async function handleDescargar(nombreArchivo: string) {
    setDownloading(nombreArchivo);
    const res = await getBackupDownloadUrl(nombreArchivo);
    setDownloading(null);
    if (res.error) {
      toast.error(res.error);
    } else if (res.url) {
      window.open(res.url, "_blank");
    }
  }

  const completados = backups.length;
  const fallidos = 0; // Por ahora asumimos que no hay en bucket si fallan

  async function handleEjecutar() {
    setEjecutando(true);
    const res = await triggerManualBackup();
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("¡Respaldo iniciado remotamente en GitHub! Estará disponible en 1 minuto.", { duration: 5000 });
    }
    setEjecutando(false);
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
          <StatCard label="Total respaldos" value={backups.length} sub="Archivos detectados" icon={HardDrive} accent="green" />
          <StatCard label="Completados" value={completados} sub="Descargables" subColor="text-emerald-400" icon={CheckCircle2} accent="green" />
          <StatCard label="Fallidos" value={0} sub="0 Errores críticos" subColor="text-emerald-400" icon={XCircle} accent="green" />
          <StatCard label="Último respaldo" value={backups.length > 0 ? formatFechaHora(backups[0].created_at).split(",")[0] : "Ninguno"} sub={backups.length > 0 ? formatTamano(backups[0].metadata?.size || 0) : "Esperando..."} icon={Clock} accent="amber" />
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
              <p className="text-xs text-white/40">{completados} registros recuperados</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Fecha", "Archivo", "Tamaño", "Estado", "Acciones"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow className="border-white/4">
                       <TableCell colSpan={5} className="text-center py-6 text-sm text-white/40">Conectando seguro con Supabase Storage...</TableCell>
                   </TableRow>
                ) : backups.map((file) => (
                  <TableRow key={file.id} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm font-medium text-white/80">{formatFechaHora(file.created_at)}</TableCell>
                    <TableCell>
                       <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-xs text-white/60 font-mono">
                         {file.name}
                       </span>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-emerald-400/80">{formatTamano(file.metadata?.size || 0)}</TableCell>
                    <TableCell><StatusBadge status="completado" /></TableCell>
                    <TableCell>
                       <Button 
                          onClick={() => handleDescargar(file.name)}
                          disabled={downloading === file.name}
                          variant="ghost" 
                          size="sm" 
                          className="h-8 gap-2 text-white/60 hover:text-white hover:bg-emerald-500/20"
                       >
                         {downloading === file.name ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
                         ) : (
                            <Download className="h-3.5 w-3.5" />
                         )}
                         Descargar SQL
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {backups.length === 0 && !loading && (
              <div className="py-10 text-center text-sm text-white/40 px-5">
                <p className="font-semibold text-white/60 mb-1 text-base">Aún no hay respaldos generados</p>
                La tarea automática creará tu primer respaldo a la medianoche.
              </div>
            )}
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
