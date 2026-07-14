"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { StatCard } from "@/app/_components/StatCard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart3, CalendarDays, AlertTriangle, FolderOpen,
  Download, ChevronRight, Loader2,
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
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

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
  const [calificaciones, setCalificaciones] = useState<any[]>([]);
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
      const [perfilRes, sesionesRes, docsRes, calsRes] = await Promise.all([
        getAlumnoPerfil(),
        getSesionesAlumno(),
        getDocumentosAlumno(),
        getCalificacionesAlumno(),
      ]);

      if ("data" in perfilRes) setAlumno(perfilRes.data);
      else toast.error("Error al cargar perfil: " + perfilRes.error);

      if ("data" in sesionesRes) setSesiones(sesionesRes.data);
      if ("data" in docsRes) setDocumentos(docsRes.data);
      if ("data" in calsRes) setCalificaciones(calsRes.data);

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

  // Mapear calificaciones al chart usando los campos reales del tipo CalificacionAlumno
  const chartData = calificaciones.map((c) => ({
    name: c.asignatura?.slice(0, 7) ?? "—",
    gpa: Number(c.calificacion),
  }));

  const showDemoData = chartData.length < 2;
  const displayData = showDemoData
    ? [
        { name: "Ene", gpa: 8.5 },
        { name: "Feb", gpa: 7.8 },
        { name: "Mar", gpa: 9.2 },
        { name: "Abr", gpa: 6.5 },
        { name: "May", gpa: 8.0 },
      ]
    : chartData;

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{t("alumno.panel.title")}</h1>
            <p className="mt-0.5 text-sm text-white/50">{t("alumno.panel.greeting", { name: primerNombre })}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDescargarExpediente}
            disabled={isDownloading}
            className="gap-2 border-white/10 bg-white/4 text-white/60 hover:bg-white/8 hover:text-white"
          >
            {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {isDownloading ? t("alumno.panel.generating") : t("alumno.panel.downloadRecord")}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label={t("alumno.stats.gpa")} value={Number(alumno.promedio_general).toFixed(1)} sub={t("alumno.stats.gpaDescription")} subColor={gpaColor(alumno.promedio_general)} icon={BarChart3} accent={alumno.promedio_general >= 8.5 ? "green" : alumno.promedio_general >= 7.0 ? "amber" : "red"} />
          <StatCard label={t("alumno.stats.sessions")} value={sesiones.length} sub={t("alumno.stats.sessionsDescription")} icon={CalendarDays} accent="green" />
          <StatCard label={t("alumno.stats.documents")} value={documentos.length} sub={pendientes > 0 ? t("alumno.stats.pendingDocs", { count: pendientes }) : t("alumno.stats.noPendingDocs")} subColor={pendientes > 0 ? "text-amber-400" : "text-emerald-400"} icon={FolderOpen} accent="amber" />
          <StatCard label={t("alumno.stats.academicStatus")} value={riesgo.label} sub={t("alumno.stats.riskLevel")} subColor={riesgo.cls} icon={AlertTriangle} accent={riesgo.accent} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SectionCard className="lg:col-span-2 p-5">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm font-semibold text-white">{t("alumno.charts.evolution")}</p>
              {showDemoData && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded italic">Datos ilustrativos</span>}
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayData}>
                  <defs>
                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f151c", borderColor: "#ffffff10" }} />
                  <Area type="step" dataKey="gpa" stroke="#10b981" fillOpacity={1} fill="url(#colorGpa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
          <SectionCard className="p-0">
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">{t("alumno.info.title")}</p>
            </div>
            <div className="divide-y divide-white/4 px-5">
              {[
                [t("alumno.info.matricula"), alumno.matricula],
                [t("alumno.info.career"), alumno.carrera],
                [t("alumno.info.semester"), `${alumno.cuatrimestre}°`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <span className="text-xs text-white/40">{label}</span>
                  <span className="text-sm font-medium text-white">{value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard>
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">{t("alumno.docs.title")}</p>
            </div>
            <button onClick={() => router.push("/dashboard/alumno/documentos?upload=true")} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
              {t("alumno.docs.uploadDoc")} <ChevronRight className="h-3 w-3 inline" />
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                {[t("alumno.docs.headers.document"), t("alumno.docs.headers.type"), t("alumno.docs.headers.date")].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase text-white/30">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.length > 0 ? documentos.slice(0, 5).map((d) => (
                <TableRow key={d.id} className="border-white/4 hover:bg-white/3">
                  <TableCell className="text-sm text-white/90">{d.nombre_archivo}</TableCell>
                  <TableCell className="text-xs uppercase text-white/50">{d.tipo_documento}</TableCell>
                  <TableCell className="text-sm text-white/50">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-sm text-white/30 italic">{t("alumno.docs.noDocs")}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </SectionCard>

        <div className="-mx-4 -mb-4 md:-mx-8 md:-mb-8 mt-12">
          <SitemapFooter />
        </div>
      </main>
    </div>
  );
}