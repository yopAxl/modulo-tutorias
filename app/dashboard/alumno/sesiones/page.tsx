"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { ALUMNOS, SESIONES, MOTIVOS_TUTORIA, formatFecha } from "@/app/_lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { CalendarDays, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Definición del Fallback para consistencia
const FallbackAlumno = {
  id: "a1", matricula: "—", nombre: "Alumno (Sin datos)",
  genero: "M", carrera: "—", grupo: "—", cuatrimestre: 1,
  promedio: 0, riesgo: "Bajo" as const,
  correo: "—", telefono: "—",
  tutorId: "t1", docenteId: "d1", activo: true,
};

const NAV_ITEMS = [
  { icon: "📊", label: "Mi panel", href: "/dashboard/alumno" },
  { icon: "📅", label: "Mis sesiones", href: "/dashboard/alumno/sesiones" },
  { icon: "📁", label: "Expediente", href: "/dashboard/alumno/expediente" },
  { icon: "📄", label: "Documentos", href: "/dashboard/alumno/documentos" },
];

export default function SesionesAlumnoPage() {
  const supabase = createClient();
  
  // Estados para el inicio de sesión
  const [alumno, setAlumno] = useState(FallbackAlumno);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("todas");

  useEffect(() => {
    async function inicializarSesion() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.email) {
          // Buscamos al alumno por correo
          const alumnoReal = ALUMNOS.find(a => a.correo === user.email);
          if (alumnoReal) {
            setAlumno(alumnoReal);
          } else {
            // Si no está en mock-data, actualizamos nombre y correo del fallback
            setAlumno({
              ...FallbackAlumno,
              nombre: user.user_metadata?.nombre_completo || user.email.split('@')[0],
              correo: user.email
            });
          }
        }
      } catch (error) {
        console.error("Error al cargar sesiones del alumno:", error);
      } finally {
        setLoading(false);
      }
    }
    inicializarSesion();
  }, [supabase]);

  // Filtrado de sesiones basado en el alumno logueado
  const mySesiones = SESIONES.filter((s) => s.alumnoId === alumno.id);
  const filtered = mySesiones.filter(
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
      <Sidebar role="Alumno" userName={alumno.nombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Mis Sesiones de Tutoría"
          subtitle={`${mySesiones.length} sesiones registradas con tu tutor`}
        />

        {/* Filtros */}
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {["todas", "programada", "realizada", "cancelada"].map((s) => (
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
              {s === "todas" ? "Todas" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Listado de Sesiones */}
        <div className="flex flex-col gap-4">
          {filtered.map((s) => {
            const motivoLabels = s.motivos.map(
              (m) => MOTIVOS_TUTORIA.find((mt) => mt.codigo === m)?.descripcion ?? m
            );

            return (
              <SectionCard key={s.id}>
                <div className="flex flex-col gap-4 p-5">
                  {/* Cabecera de la Sesión */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-600/10">
                      <span className="text-lg font-extrabold leading-none text-emerald-400">
                        {new Date(s.fecha + "T00:00:00").getDate()}
                      </span>
                      <span className="text-[9px] font-semibold uppercase text-emerald-400/60">
                        {new Date(s.fecha + "T00:00:00").toLocaleDateString("es-MX", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{s.temas[0]}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <Clock className="h-3 w-3" /> {s.horaInicio} – {s.horaFin}
                        </span>
                        <StatusBadge status={s.estatus} />
                        <StatusBadge
                          status={s.urgencia}
                          variant={s.urgencia === "Alta" ? "danger" : s.urgencia === "Media" ? "warning" : "success"}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Motivos */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Motivos</p>
                    <div className="flex flex-wrap gap-1.5">
                      {motivoLabels.map((m) => (
                        <span key={m} className="rounded-md border border-white/8 bg-white/4 px-2.5 py-1 text-xs text-white/60">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Acuerdos si existen */}
                  {s.acuerdos && (
                    <div className="rounded-lg border border-emerald-500/15 bg-emerald-600/5 px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/50 mb-1">Acuerdos</p>
                      <p className="text-sm text-emerald-300/80 italic">"{s.acuerdos}"</p>
                    </div>
                  )}

                  {/* Firmas de Confirmación */}
                  <div className="flex items-center gap-4 rounded-lg border border-white/6 bg-white/2 px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {s.confirmadoTutor ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-white/10" />
                      )}
                      <span className={s.confirmadoTutor ? "text-emerald-400" : "text-white/20"}>Firma Tutor</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {s.confirmadoAlumno ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-white/10" />
                      )}
                      <span className={s.confirmadoAlumno ? "text-emerald-400" : "text-white/20"}>Mi Firma</span>
                    </div>
                    
                    {!s.confirmadoAlumno && s.estatus === "realizada" && (
                      <button className="ml-auto rounded-lg bg-emerald-600/20 px-3 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-600/30 transition-all">
                        Confirmar asistencia
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