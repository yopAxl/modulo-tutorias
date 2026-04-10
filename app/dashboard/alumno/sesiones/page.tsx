"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { MOTIVOS_TUTORIA } from "@/app/_lib/mock-data";
import { CalendarDays, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  getSesionesAlumno,
  getAlumnoPerfil,
  confirmarAsistenciaAlumno,
  type SesionAlumno,
  type AlumnoPerfil,
} from "../actions";

const NAV_ITEMS = [
  { icon: "📊", label: "Mi panel", href: "/dashboard/alumno" },
  { icon: "📅", label: "Mis sesiones", href: "/dashboard/alumno/sesiones" },
  { icon: "📁", label: "Expediente", href: "/dashboard/alumno/expediente" },
  { icon: "📄", label: "Documentos", href: "/dashboard/alumno/documentos" },
];

const URGENCIA_LABEL: Record<string, string> = {
  normal: "Normal",
  medio: "Medio",
  urgente: "Urgente",
  critico: "Crítico",
};

const URGENCIA_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  normal: "success",
  medio: "warning",
  urgente: "danger",
  critico: "danger",
};

export default function SesionesAlumnoPage() {
  const [alumno, setAlumno] = useState<AlumnoPerfil | null>(null);
  const [sesiones, setSesiones] = useState<SesionAlumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("todas");
  const [confirmando, setConfirmando] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      const [perfilRes, sesionesRes] = await Promise.all([
        getAlumnoPerfil(),
        getSesionesAlumno(),
      ]);

      if ("data" in perfilRes) setAlumno(perfilRes.data);
      else toast.error("Error al cargar perfil: " + perfilRes.error);

      if ("data" in sesionesRes) setSesiones(sesionesRes.data);
      else toast.error("Error al cargar sesiones: " + (sesionesRes as any).error);

      setLoading(false);
    }
    cargar();
  }, []);

  const handleConfirmar = async (sesionId: string) => {
    setConfirmando(sesionId);
    const result = await confirmarAsistenciaAlumno(sesionId);
    if ("success" in result) {
      toast.success("Asistencia confirmada correctamente");
      // Actualizar localmente sin refetch
      setSesiones((prev) =>
        prev.map((s) =>
          s.id === sesionId ? { ...s, confirmado_alumno: true } : s
        )
      );
    } else {
      toast.error("Error: " + result.error);
    }
    setConfirmando(null);
  };

  const filtered = sesiones.filter(
    (s) => filterStatus === "todas" || s.estatus === filterStatus
  );

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f151c]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar
        role="Alumno"
        userName={alumno?.nombre_completo ?? "Alumno"}
        navItems={NAV_ITEMS}
      />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Mis Sesiones de Tutoría"
          subtitle={`${sesiones.length} sesiones registradas con tu tutor`}
        />

        {/* Filtros */}
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {["todas", "programada", "realizada", "cancelada", "no_presentado"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                filterStatus === s
                  ? "bg-emerald-600/15 text-emerald-400"
                  : "text-white/40 hover:bg-white/6 hover:text-white/60"
              )}
            >
              {s === "todas" ? "Todas" : s.replace("_", " ").charAt(0).toUpperCase() + s.replace("_", " ").slice(1)}
            </button>
          ))}
        </div>

        {/* Listado de Sesiones */}
        <div className="flex flex-col gap-4">
          {filtered.map((s) => {
            const motivoLabels = (s.motivos ?? []).map(
              (m) => MOTIVOS_TUTORIA.find((mt) => mt.codigo === m.motivo_codigo)?.descripcion ?? m.motivo_codigo
            );
            const fechaDate = new Date(s.fecha + "T00:00:00");
            const urgenciaLabel = URGENCIA_LABEL[s.nivel_urgencia] ?? s.nivel_urgencia;
            const urgenciaVariant = URGENCIA_VARIANT[s.nivel_urgencia] ?? "success";

            return (
              <SectionCard key={s.id}>
                <div className="flex flex-col gap-4 p-5">
                  {/* Cabecera */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-600/10">
                      <span className="text-lg font-extrabold leading-none text-emerald-400">
                        {fechaDate.getDate()}
                      </span>
                      <span className="text-[9px] font-semibold uppercase text-emerald-400/60">
                        {fechaDate.toLocaleDateString("es-MX", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white capitalize">
                        Sesión {s.estatus.replace("_", " ")}
                      </p>
                      {s.tutor && (
                        <p className="text-xs text-white/40 mt-0.5">Tutor: {s.tutor.nombre_completo}</p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <Clock className="h-3 w-3" /> {s.hora_inicio} – {s.hora_fin}
                        </span>
                        {s.duracion_minutos > 0 && (
                          <span className="text-xs text-white/30">{s.duracion_minutos} min</span>
                        )}
                        <StatusBadge status={s.estatus} />
                        <StatusBadge status={urgenciaLabel} variant={urgenciaVariant} />
                      </div>
                    </div>
                  </div>

                  {/* Motivos */}
                  {motivoLabels.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">
                        Motivos
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {motivoLabels.map((m) => (
                          <span
                            key={m}
                            className="rounded-md border border-white/8 bg-white/4 px-2.5 py-1 text-xs text-white/60"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Puntos relevantes */}
                  {s.puntos_relevantes && (
                    <div className="rounded-lg border border-emerald-500/15 bg-emerald-600/5 px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/50 mb-1">
                        Puntos relevantes
                      </p>
                      <p className="text-sm text-emerald-300/80 italic">"{s.puntos_relevantes}"</p>
                    </div>
                  )}

                  {/* Compromisos */}
                  {s.compromisos_acuerdos && (
                    <div className="rounded-lg border border-white/6 bg-white/2 px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">
                        Compromisos y acuerdos
                      </p>
                      <p className="text-sm text-white/70 italic">"{s.compromisos_acuerdos}"</p>
                    </div>
                  )}

                  {/* Firmas de Confirmación */}
                  <div className="flex items-center gap-4 rounded-lg border border-white/6 bg-white/2 px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {s.confirmado_tutor ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-white/10" />
                      )}
                      <span className={s.confirmado_tutor ? "text-emerald-400" : "text-white/20"}>
                        Firma Tutor
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {s.confirmado_alumno ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-white/10" />
                      )}
                      <span className={s.confirmado_alumno ? "text-emerald-400" : "text-white/20"}>
                        Mi Firma
                      </span>
                    </div>

                    {!s.confirmado_alumno && s.estatus === "realizada" && (
                      <button
                        disabled={confirmando === s.id}
                        onClick={() => handleConfirmar(s.id)}
                        className="ml-auto rounded-lg bg-emerald-600/20 px-3 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-600/30 transition-all disabled:opacity-50"
                      >
                        {confirmando === s.id ? "Confirmando..." : "Confirmar asistencia"}
                      </button>
                    )}
                  </div>
                </div>
              </SectionCard>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <CalendarDays className="h-10 w-10 text-white/5 mx-auto mb-3" />
              <p className="text-sm text-white/20 font-medium">No se encontraron sesiones.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}