"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { RiskBadge } from "@/app/_components/RiskBadge";
import { GpaCell } from "@/app/_components/GpaCell";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, BookOpen, CalendarDays, AlertTriangle, ArrowRightLeft, FileText, Target, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getTutorAlumnos, getExpedienteAlumno } from "../actions";
import { toast } from "sonner";
import SitemapFooter from "@/app/_components/SitemapFooter";
import { useI18n } from "@/app/_i18n/context";

function formatFechaReal(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString('es-MX');
}

const TUTOR_ID = "t1";
const TUTOR_NOMBRE = "Dra. María Rodríguez López";

type Tab = "datos" | "calificaciones" | "sesiones" | "canalizaciones" | "incidencias" | "documentos" | "plan";

export default function ExpedientesTutorPage() {
  const { t } = useI18n();

  const NAV_ITEMS = [
  { icon: "📊", label: t("nav.tutor.dashboard"), href: "/dashboard/tutor" },
  { icon: "👥", label: t("nav.tutor.students"), href: "/dashboard/tutor/alumnos" },
  { icon: "📅", label: t("nav.tutor.sessions"), href: "/dashboard/tutor/sesiones" },
  { icon: "📁", label: t("nav.tutor.records"), href: "/dashboard/tutor/expedientes" },
  { icon: "📈", label: t("nav.tutor.reports"), href: "/dashboard/tutor/reportes" },
];
  const router = useRouter();
  const supabase = createClient();

  const [tutorId, setTutorId] = useState<string | null>(null);
  const [tutorNombre, setTutorNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string>("");
  const [tab, setTab] = useState<Tab>("datos");

  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    async function loadAlumnos() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const res = await getTutorAlumnos(user.id);
        if (res.error === "PERFIL_NO_ENCONTRADO") {
          setTutorId("NO_PROFILE");
          setTutorNombre(user.user_metadata?.nombre_completo || user.email);
        } else if (res.data) {
          setTutorId(res.data.tutor.id);
          setTutorNombre(res.data.tutor.nombre_completo || user.email);
          setAlumnos(res.data.alumnos);
          if (res.data.alumnos.length > 0) {
            setSelectedAlumnoId(res.data.alumnos[0].id);
          }
        }
      } catch (err) {
        toast.error("Error al cargar lista de alumnos");
      } finally {
        setLoading(false);
      }
    }
    loadAlumnos();
  }, [router, supabase]);

  useEffect(() => {
    async function loadExpediente() {
      if (!selectedAlumnoId || tutorId === "NO_PROFILE") return;
      
      setLoadingDetail(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const res = await getExpedienteAlumno(user.id, selectedAlumnoId);
        if (res.data) {
          setDetail(res.data);
        } else {
          toast.error(res.error || "Error al cargar expediente");
        }
      } catch (err) {
        toast.error("Error de conexión");
      } finally {
        setLoadingDetail(false);
      }
    }
    loadExpediente();
  }, [selectedAlumnoId, tutorId, supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (tutorId === "NO_PROFILE") {
    return (
      <div className="flex h-screen overflow-hidden bg-[#0f151c]">
        <Sidebar role="Tutor" userName={tutorNombre} navItems={NAV_ITEMS} />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md w-full rounded-xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Perfil de Tutor no encontrado</h2>
            <p className="text-sm text-white/60 mb-6">
              Contacta al administrador para habilitar tu perfil de tutor.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const alumno = detail?.alumno || alumnos.find(a => a.id === selectedAlumnoId);
  const calificaciones = detail?.calificaciones || [];
  const sesiones = detail?.sesiones || [];
  const canalizaciones = detail?.canalizaciones || [];
  const incidencias = detail?.incidencias || [];
  const documentos = detail?.documentos || [];
  const planesAccion = detail?.planes || [];

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "datos", label: "Datos", icon: User },
    { key: "calificaciones", label: "Calificaciones", icon: BookOpen },
    { key: "sesiones", label: t("nav.tutor.sessions"), icon: CalendarDays },
    { key: "canalizaciones", label: "Canalizaciones", icon: ArrowRightLeft },
    { key: "incidencias", label: "Incidencias", icon: AlertTriangle },
    { key: "documentos", label: "Documentos", icon: FileText },
    { key: "plan", label: "Plan de acción", icon: Target },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Tutor" userName={tutorNombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader title="Expedientes" subtitle="Expediente integral por alumno" />

        {/* Alumno selector */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedAlumnoId}
            onChange={(e) => { setSelectedAlumnoId(e.target.value); setTab("datos"); }}
            className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40"
          >
            {alumnos.length > 0 ? (
              alumnos.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre_completo || a.nombre} — {a.matricula}</option>
              ))
            ) : (
              <option value="">No hay alumnos asignados</option>
            )}
          </select>
          {alumno && (
            <div className="flex items-center gap-2">
              <GpaCell value={parseFloat(alumno.promedio_general) || 0} />
              <RiskBadge riesgo={alumno.riesgo_academico === 'alto' ? 'Alto' : (alumno.riesgo_academico === 'medio' ? 'Medio' : 'Bajo')} />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-white/6 bg-white/2 p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                tab === key ? "bg-emerald-600/15 text-emerald-400" : "text-white/40 hover:text-white/60"
              )}
            >
              <Icon className="h-3 w-3" /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "datos" && (
          <SectionCard>
            <div className="divide-y divide-white/4 px-5">
              {([
                ["Matrícula", alumno.matricula, true],
                ["Nombre completo", alumno.nombre_completo || alumno.nombre, false],
                ["Género", alumno.genero === "M" ? "Masculino" : alumno.genero === "F" ? "Femenino" : "Otro", false],
                ["Carrera", alumno.carrera, false],
                ["Grupo", alumno.grupo, false],
                ["Cuatrimestre", `${alumno.cuatrimestre}°`, false],
                ["Correo institucional", alumno.correo_institucional || alumno.correo, false],
                ["Teléfono", alumno.telefono, true],
              ] as [string, string, boolean][]).map(([label, value, mono]) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <span className="text-xs font-medium text-white/40">{label}</span>
                  <span className={cn("text-sm font-semibold text-white/90", mono && "font-mono text-xs")}>{value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {tab === "calificaciones" && (
          <SectionCard>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Asignatura", "Período", "Calificación", "Tipo", "Observaciones"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {calificaciones.map((c: any) => (
                  <TableRow key={c.id} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm font-medium text-white/90">{c.asignatura}</TableCell>
                    <TableCell className="text-sm text-white/50">{c.periodo}</TableCell>
                    <TableCell><GpaCell value={parseFloat(c.calificacion)} /></TableCell>
                    <TableCell><StatusBadge status={c.tipo_evaluacion} variant="neutral" /></TableCell>
                    <TableCell className="text-xs text-white/40">{c.observaciones || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {calificaciones.length === 0 && (
              <p className="py-10 text-center text-xs text-white/20 italic">No hay datos en esta tabla.</p>
            )}
          </SectionCard>
        )}

        {tab === "sesiones" && (
          <SectionCard>
            <div className="divide-y divide-white/4">
              {sesiones.map((s: any) => (
                <div key={s.id} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10">
                    <CalendarDays className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/90">Sesión de Tutoría</p>
                    <p className="mt-0.5 text-xs text-white/40 line-clamp-2">{s.puntos_relevantes || s.compromisos_acuerdos}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="text-[11px] text-white/35 font-mono">{formatFechaReal(s.fecha)}</span>
                      <span className="text-[11px] text-white/35 font-mono">{s.hora_inicio?.substring(0, 5)}–{s.hora_fin?.substring(0, 5)}</span>
                      <StatusBadge status={s.estatus} />
                    </div>
                  </div>
                </div>
              ))}
              {sesiones.length === 0 && (
                <p className="py-10 text-center text-xs text-white/20 italic">No hay datos en esta tabla.</p>
              )}
            </div>
          </SectionCard>
        )}

        {tab === "canalizaciones" && (
          <SectionCard>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Servicio", "Fecha", "Motivo", "Estatus", "Seguimiento"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {canalizaciones.map((c: any) => (
                  <TableRow key={c.id} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm text-white/80">{c.tipo_servicio}</TableCell>
                    <TableCell className="text-sm text-white/50">{formatFechaReal(c.fecha_canalizacion)}</TableCell>
                    <TableCell className="text-xs text-white/40 max-w-[200px]"><p className="truncate">{c.motivo}</p></TableCell>
                    <TableCell><StatusBadge status={c.estatus} /></TableCell>
                    <TableCell className="text-xs text-white/40">{c.seguimiento || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {canalizaciones.length === 0 && (
              <p className="py-10 text-center text-xs text-white/20 italic">No hay datos en esta tabla.</p>
            )}
          </SectionCard>
        )}

        {tab === "incidencias" && (
          <SectionCard>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Fecha", "Tipo", "Descripción", "Estatus", "Resolución"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidencias.map((i: any) => (
                  <TableRow key={i.id} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm text-white/50">{formatFechaReal(i.fecha)}</TableCell>
                    <TableCell><StatusBadge status={i.tipo_incidencia} variant="neutral" /></TableCell>
                    <TableCell className="text-xs text-white/40 max-w-[200px]"><p className="truncate">{i.descripcion}</p></TableCell>
                    <TableCell><StatusBadge status={i.estatus} /></TableCell>
                    <TableCell className="text-xs text-white/40">{i.resolucion || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {incidencias.length === 0 && (
              <p className="py-10 text-center text-xs text-white/20 italic">No hay datos en esta tabla.</p>
            )}
          </SectionCard>
        )}

        {tab === "documentos" && (
          <SectionCard>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Archivo", "Tipo", "Privacidad", "Tamaño", "Fecha"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.map((d: any) => (
                  <TableRow key={d.id} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm font-medium text-white/90">{d.nombre_archivo}</TableCell>
                    <TableCell><StatusBadge status={d.tipo_documento} variant="neutral" /></TableCell>
                    <TableCell><StatusBadge status={d.nivel_privacidad} variant={d.nivel_privacidad === "visible" ? "success" : "warning"} /></TableCell>
                    <TableCell className="text-xs text-white/50 font-mono">{(d.tamano_bytes / 1024).toFixed(1)} KB</TableCell>
                    <TableCell className="text-sm text-white/50">{formatFechaReal(d.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {documentos.length === 0 && (
              <p className="py-10 text-center text-xs text-white/20 italic">No hay datos en esta tabla.</p>
            )}
          </SectionCard>
        )}

        {tab === "plan" && (
          <div className="flex flex-col gap-4">
            {planesAccion.map((p: any) => (
              <SectionCard key={p.id}>
                <div className="border-b border-white/6 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Plan de Acción · {p.periodo}</p>
                      <p className="text-xs text-white/40">{p.objetivo_general}</p>
                    </div>
                    <StatusBadge status={p.estatus} />
                  </div>
                </div>
                <div className="flex flex-col gap-3 p-5">
                  {(p.metas || []).map((meta: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        meta.lograda ? "bg-emerald-600/20" : "bg-white/6"
                      )}>
                        <CheckCircle2 className={cn("h-3 w-3", meta.lograda ? "text-emerald-400" : "text-white/20")} />
                      </div>
                      <div>
                        <p className={cn("text-sm", meta.lograda ? "text-white/50 line-through" : "text-white/80")}>{meta.descripcion}</p>
                        <p className="text-xs text-white/30">Límite: {formatFechaReal(meta.fecha_limite)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 text-xs text-white/30 truncate">
                    Revisión programada: {formatFechaReal(p.fecha_revision)}
                  </div>
                </div>
              </SectionCard>
            ))}
            {planesAccion.length === 0 && (
              <p className="py-10 text-center text-xs text-white/20 italic">No hay planes de acción para este alumno.</p>
            )}
          </div>
        )}
      
        <div className="-mx-4 -mb-4 md:-mx-8 md:-mb-8 mt-12">
          <SitemapFooter />
        </div>
      </main>
    </div>
  );
}