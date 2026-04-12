"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { RiskBadge } from "@/app/_components/RiskBadge";
import { GpaCell } from "@/app/_components/GpaCell";
import { StatusBadge } from "@/app/_components/StatusBadge";
import SitemapFooter from "@/app/_components/SitemapFooter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Target, Loader2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  getAlumnoPerfil,
  getCalificacionesAlumno,
  getPlanesAccionAlumno,
  getSesionesAlumno,
  type AlumnoPerfil,
  type CalificacionAlumno,
  type PlanAccionAlumno,
} from "../actions";
import { generateExpedientePDF } from "@/app/_lib/pdf-utils";
import { useI18n } from "@/app/_i18n/context";

// Mapa de colores para riesgo académico (backend usa lowercase)
const riesgoDisplay: Record<string, "Bajo" | "Medio" | "Alto"> = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
};

export default function ExpedienteAlumnoPage() {
  const { t } = useI18n();
  const [alumno, setAlumno] = useState<AlumnoPerfil | null>(null);
  const [calificaciones, setCalificaciones] = useState<CalificacionAlumno[]>([]);
  const [planes, setPlanes] = useState<PlanAccionAlumno[]>([]);
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
      const [perfilRes, calsRes, planesRes] = await Promise.all([
        getAlumnoPerfil(),
        getCalificacionesAlumno(),
        getPlanesAccionAlumno(),
      ]);

      if ("data" in perfilRes) setAlumno(perfilRes.data);
      else toast.error("Error al cargar perfil: " + perfilRes.error);

      if ("data" in calsRes) setCalificaciones(calsRes.data);
      if ("data" in planesRes) setPlanes(planesRes.data);

      setLoading(false);
    }
    cargar();
  }, []);

  const handleDescargarExpediente = async () => {
    if (!alumno) return;
    setIsDownloading(true);
    try {
      const sesionesRes = await getSesionesAlumno();
      await generateExpedientePDF(
        alumno,
        calificaciones,
        "data" in sesionesRes ? sesionesRes.data : []
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

  const riesgoLabel = riesgoDisplay[alumno.riesgo_academico] ?? "Bajo";

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Alumno" userName={alumno.nombre_completo} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title={t("alumno.expediente.title")}
          subtitle={t("alumno.expediente.subtitle")}
          actions={
            <Button
              size="sm"
              onClick={handleDescargarExpediente}
              disabled={isDownloading}
              variant="outline"
              className="gap-2 border-white/10 bg-white/4 text-white/60 hover:bg-white/8 hover:text-white"
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {isDownloading ? t("alumno.panel.generating") : t("alumno.panel.downloadRecord")}
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Datos personales */}
          <SectionCard>
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">{t("alumno.expediente.personalData")}</p>
            </div>
            <div className="divide-y divide-white/4 px-5">
              {[
                [t("alumno.expediente.matricula"), alumno.matricula, true],
                [t("alumno.expediente.name"), alumno.nombre_completo, false],
                [t("alumno.expediente.career"), alumno.carrera, false],
                [t("alumno.expediente.group"), alumno.grupo, false],
                [t("alumno.expediente.semester"), `${alumno.cuatrimestre}°`, false],
                [t("alumno.expediente.email"), alumno.correo_institucional, false],
                [t("alumno.expediente.phone"), alumno.telefono, true],
              ].map(([label, value, mono]: any) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <span className="text-xs font-medium text-white/40">{label}</span>
                  <span className={cn("text-sm font-semibold text-white/90", mono && "font-mono text-xs")}>
                    {value}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-medium text-white/40">{t("alumno.expediente.gpa")}</span>
                <GpaCell value={alumno.promedio_general} />
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-medium text-white/40">{t("alumno.expediente.risk")}</span>
                <RiskBadge riesgo={riesgoLabel} />
              </div>
            </div>
          </SectionCard>

          {/* Calificaciones */}
          <SectionCard>
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">{t("alumno.expediente.grades")}</p>
              <p className="text-xs text-white/40">{t("alumno.expediente.gradesCount", { count: calificaciones.length })}</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {[t("alumno.expediente.gradesHeaders.subject"), t("alumno.expediente.gradesHeaders.period"), t("alumno.expediente.gradesHeaders.grade"), t("alumno.expediente.gradesHeaders.type")].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {calificaciones.map((c) => (
                  <TableRow key={c.id} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm font-medium text-white/80">{c.asignatura}</TableCell>
                    <TableCell className="text-sm text-white/50">{c.periodo}</TableCell>
                    <TableCell><GpaCell value={Number(c.calificacion)} /></TableCell>
                    <TableCell><StatusBadge status={c.tipo_evaluacion} variant="neutral" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {calificaciones.length === 0 && (
              <p className="py-10 text-center text-sm text-white/30 italic">
                {t("alumno.expediente.noGrades")}
              </p>
            )}
          </SectionCard>
        </div>

        {/* Planes de acción */}
        {planes.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              <p className="text-sm font-semibold text-white">{t("alumno.expediente.actionPlan")}</p>
            </div>
            {planes.map((p) => (
              <SectionCard key={p.id}>
                <div className="border-b border-white/6 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{t("alumno.expediente.period", { period: p.periodo })}</p>
                      <p className="text-xs text-white/40">{p.objetivo_general}</p>
                      {p.tutor && (
                        <p className="mt-0.5 text-xs text-white/30">Tutor: {p.tutor.nombre_completo}</p>
                      )}
                    </div>
                    <StatusBadge status={p.estatus} />
                  </div>
                </div>
                <div className="flex flex-col gap-3 p-5">
                  {(p.metas ?? []).map((meta, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        meta.lograda ? "bg-emerald-600/20" : "bg-white/6"
                      )}>
                        <CheckCircle2 className={cn("h-3 w-3", meta.lograda ? "text-emerald-400" : "text-white/20")} />
                      </div>
                      <div>
                        <p className={cn("text-sm", meta.lograda ? "text-white/50 line-through" : "text-white/80")}>
                          {meta.descripcion}
                        </p>
                        <p className="text-xs text-white/30">
                          {t("alumno.expediente.deadline", {
                            date: new Date(meta.fecha_limite + "T00:00:00").toLocaleDateString("es-MX", {
                              day: "2-digit", month: "short", year: "numeric"
                            })
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            ))}
          </div>
        )}

        <div className="-mx-4 -mb-4 md:-mx-8 md:-mb-8 mt-12">
          <SitemapFooter />
        </div>
      </main>
    </div>
  );
}