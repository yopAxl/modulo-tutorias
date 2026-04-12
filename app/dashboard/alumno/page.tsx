"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { StatCard } from "@/app/_components/StatCard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart3, CalendarDays, AlertTriangle, FolderOpen,
  Download, Clock, CalendarRange, ChevronRight, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  getAlumnoPerfil,
  getSesionesAlumno,
  getDocumentosAlumno,
  getCalificacionesAlumno,
  type AlumnoPerfil,
  type SesionAlumno,
  type DocumentoAlumno,
} from "./actions";
import { generateExpedientePDF } from "@/app/_lib/pdf-utils";
import SitemapFooter from "@/app/_components/SitemapFooter";
import { useI18n } from "@/app/_i18n/context";

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-white/6 bg-[#151c24]", className)}>
      {children}
    </div>
  );
}

function gpaColor(p: number) {
  if (p >= 8.5) return "text-emerald-400";
  if (p >= 7.0) return "text-amber-400";
  return "text-red-400";
}

export default function AlumnoDashboard() {
  const router = useRouter();
  const { t } = useI18n();
  const [alumno, setAlumno] = useState<AlumnoPerfil | null>(null);
  const [sesiones, setSesiones] = useState<SesionAlumno[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoAlumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const NAV_ITEMS = [
    { icon: "📊", label: t("nav.alumno.dashboard"), href: "/dashboard/alumno" },
    { icon: "📅", label: t("nav.alumno.sessions"), href: "/dashboard/alumno/sesiones" },
    { icon: "📁", label: t("nav.alumno.record"), href: "/dashboard/alumno/expediente" },
    { icon: "📄", label: t("nav.alumno.documents"), href: "/dashboard/alumno/documentos" },
  ];

  useEffect(() => {
    async function cargar() {
      const [perfilRes, sesionesRes, docsRes] = await Promise.all([
        getAlumnoPerfil(),
        getSesionesAlumno(),
        getDocumentosAlumno(),
      ]);

      if ("data" in perfilRes) setAlumno(perfilRes.data);
      else toast.error("Error al cargar perfil: " + perfilRes.error);

      if ("data" in sesionesRes) setSesiones(sesionesRes.data);
      if ("data" in docsRes) setDocumentos(docsRes.data);

      setLoading(false);
    }
    cargar();
  }, []);

  const handleDescargarExpediente = async () => {
    if (!alumno) return;
    setIsDownloading(true);
    try {
      const [calsRes, sesRes] = await Promise.all([
        getCalificacionesAlumno(),
        getSesionesAlumno(),
      ]);

      await generateExpedientePDF(
        alumno,
        "data" in calsRes ? calsRes.data : [],
        "data" in sesRes ? sesRes.data : []
      );
      toast.success(t("alumno.panel.downloadSuccess"));
    } catch (e: any) {
      toast.error(t("alumno.panel.downloadError", { error: e.message }));
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f151c]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f151c]">
        <p className="text-sm text-white/40">{t("common.profileNotFound")}</p>
      </div>
    );
  }

  const riesgoMap: Record<string, { label: string; cls: string; accent: "green" | "amber" | "red" }> = {
    bajo: { label: t("alumno.risk.bajo"), cls: "text-emerald-400", accent: "green" },
    medio: { label: t("alumno.risk.medio"), cls: "text-amber-400", accent: "amber" },
    alto: { label: t("alumno.risk.alto"), cls: "text-red-400", accent: "red" },
  };

  const riesgo = riesgoMap[alumno.riesgo_academico] ?? riesgoMap["bajo"];
  const pendientes = documentos.filter((d) => (d as any).estado === "Pendiente").length;
  const primerNombre = alumno.nombre_completo.split(" ")[0];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Alumno" userName={alumno.nombre_completo} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{t("alumno.panel.title")}</h1>
            <p className="mt-0.5 text-sm text-white/50">
              {t("alumno.panel.greeting", { name: primerNombre })}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDescargarExpediente}
            disabled={isDownloading}
            className="gap-2 border-white/10 bg-white/4 text-white/60 hover:bg-white/8 hover:text-white"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {isDownloading ? t("alumno.panel.generating") : t("alumno.panel.downloadRecord")}
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label={t("alumno.stats.gpa")}
            value={Number(alumno.promedio_general).toFixed(1)}
            sub={t("alumno.stats.gpaDescription")}
            subColor={gpaColor(alumno.promedio_general)}
            icon={BarChart3}
            accent={alumno.promedio_general >= 8.5 ? "green" : alumno.promedio_general >= 7.0 ? "amber" : "red"}
          />
          <StatCard
            label={t("alumno.stats.sessions")}
            value={sesiones.length}
            sub={t("alumno.stats.sessionsDescription")}
            icon={CalendarDays}
            accent="green"
          />
          <StatCard
            label={t("alumno.stats.documents")}
            value={documentos.length}
            sub={pendientes > 0 ? t("alumno.stats.pendingDocs", { count: pendientes }) : t("alumno.stats.noPendingDocs")}
            subColor={pendientes > 0 ? "text-amber-400" : "text-emerald-400"}
            icon={FolderOpen}
            accent="amber"
          />
          <StatCard
            label={t("alumno.stats.academicStatus")}
            value={riesgo.label}
            sub={t("alumno.stats.riskLevel")}
            subColor={riesgo.cls}
            icon={AlertTriangle}
            accent={riesgo.accent}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Información académica */}
          <SectionCard>
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">{t("alumno.info.title")}</p>
              <p className="text-xs text-white/40">{t("alumno.info.subtitle")}</p>
            </div>
            <div className="divide-y divide-white/4 px-5">
              {[
                [t("alumno.info.matricula"), alumno.matricula, true],
                [t("alumno.info.fullName"), alumno.nombre_completo, false],
                [t("alumno.info.career"), alumno.carrera, false],
                [t("alumno.info.semester"), `${alumno.cuatrimestre}°`, false],
                [t("alumno.info.email"), alumno.correo_institucional, false],
                [t("alumno.info.phone"), alumno.telefono, true],
              ].map(([label, value, mono]: any) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <span className="text-xs font-medium text-white/40">{label}</span>
                  <span className={cn("text-sm font-semibold text-white/90", mono && "font-mono text-xs")}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Mis sesiones recientes */}
          <SectionCard>
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">{t("alumno.sessionsList.title")}</p>
              <p className="text-xs text-white/40">{t("alumno.sessionsList.count", { count: sesiones.length })}</p>
            </div>
            <div className="divide-y divide-white/4">
              {sesiones.length > 0 ? sesiones.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10">
                    <CalendarRange className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white/90 capitalize">
                      {s.estatus.replace("_", " ")}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-white/40">
                      {s.puntos_relevantes?.slice(0, 60) ?? t("alumno.sessionsList.noObservations")}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px] text-white/35">
                        <CalendarDays className="h-3 w-3" /> {s.fecha}
                      </span>
                      {s.duracion_minutos > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-white/35">
                          <Clock className="h-3 w-3" /> {s.duracion_minutos} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <p className="py-20 text-center text-sm text-white/30 italic">
                  {t("alumno.sessionsList.noSessions")}
                </p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Tabla de Documentos */}
        <SectionCard>
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">{t("alumno.docs.title")}</p>
              <p className="text-xs text-white/40">{t("alumno.docs.subtitle")}</p>
            </div>
            <button
              onClick={() => router.push("/dashboard/alumno/documentos?upload=true")}
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {t("alumno.docs.uploadDoc")} <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                {[t("alumno.docs.headers.document"), t("alumno.docs.headers.type"), t("alumno.docs.headers.date"), t("alumno.docs.headers.size")].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.length > 0 ? documentos.slice(0, 5).map((d) => (
                <TableRow key={d.id} className="border-white/4 hover:bg-white/3">
                  <TableCell className="text-sm font-medium text-white/90">{d.nombre_archivo}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md border border-white/8 bg-white/4 px-2 py-0.5 font-mono text-xs text-white/50 uppercase">
                      {d.tipo_documento}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-white/50">
                    {new Date(d.created_at).toLocaleDateString("es-MX", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
                  </TableCell>
                  <TableCell className="text-sm text-white/50">
                    {d.tamano_bytes < 1024 * 1024
                      ? `${Math.round(d.tamano_bytes / 1024)} KB`
                      : `${(d.tamano_bytes / (1024 * 1024)).toFixed(1)} MB`}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-white/30 italic">
                    {t("alumno.docs.noDocs")}
                  </TableCell>
                </TableRow>
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