"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { 
  CalendarDays, Clock, User, Users, 
  FileText, ClipboardList, CheckCircle2, 
  XCircle, Download, AlertCircle, Hash, GraduationCap, School,
  ArrowRightLeft, AlertTriangle, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFecha } from "@/app/_lib/mock-data";

interface SessionDetailsModalProps {
  session: any | null;
  isOpen: boolean;
  onClose: () => void;
  tutorName?: string;
}

function formatFechaLocal(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString('es-MX');
}

export function SessionDetailsModal({ session, isOpen, onClose, tutorName }: SessionDetailsModalProps) {
  if (!session) return null;

  // Extraer datos del objeto relacional de Supabase si existen
  const alumnoInfo = session.alumnos || {};
  const nombreAlumno = alumnoInfo.nombre_completo || session.alumnoNombre || "Alumno";

  // Datos extras para sesiones realizadas
  const canalizaciones = session._canalizaciones || [];
  const incidencias = session._incidencias || [];
  const planesAccion = session._planes || [];

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="border border-white/5 bg-[#0f151c] text-white sm:max-w-2xl p-0 overflow-hidden shadow-2xl shadow-emerald-900/10 sm:rounded-2xl outline-none ring-0">
        <div className="overflow-y-auto max-h-[85vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          
          <div className="bg-gradient-to-b from-emerald-500/10 to-transparent p-6 md:p-8 pb-4">
            <DialogHeader className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                  Formato R07-M01-01
                </span>
                <StatusBadge status={session.estatus} />
              </div>
              <DialogTitle className="text-2xl font-bold text-white">
                Detalle de Sesión de Tutoría
              </DialogTitle>
              <DialogDescription className="text-white/40 text-sm mt-1">
                Consulta la bitácora institucional y los acuerdos establecidos.
              </DialogDescription>
            </DialogHeader>

            {/* Grid de Identificación */}
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Alumno</p>
                    <p className="text-sm font-semibold text-white/90">{nombreAlumno}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Tutor Responsable</p>
                    <p className="text-sm font-semibold text-white/90">{tutorName || "Tutor Asignado"}</p>
                  </div>
                </div>
              </div>

              {/* Fila de Datos Académicos */}
              <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold text-white/20 flex items-center gap-1.5">
                    <Hash className="h-3 w-3" /> Matrícula
                  </span>
                  <span className="text-xs font-mono text-white/60">{alumnoInfo.matricula || "—"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold text-white/20 flex items-center gap-1.5">
                    <GraduationCap className="h-3 w-3" /> Carrera
                  </span>
                  <span className="text-xs text-white/60">{alumnoInfo.carrera || "—"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold text-white/20 flex items-center gap-1.5">
                    <School className="h-3 w-3" /> Grupo
                  </span>
                  <span className="text-xs text-white/60">{alumnoInfo.grupo || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 pt-0 space-y-6">
            {/* Información de Tiempo y Lugar */}
            <div className="flex flex-wrap gap-6 py-4 border-y border-white/6">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-white/20" />
                <span className="text-sm text-white/70">{formatFecha(session.fecha)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-white/20" />
                <span className="text-sm text-white/70">
                  {session.hora_inicio?.slice(0, 5)} – {session.hora_fin?.slice(0, 5)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-white/20" />
                <span className="text-sm text-white/70">Urgencia: </span>
                <StatusBadge 
                  status={session.nivel_urgencia} 
                  variant={session.nivel_urgencia === "alta" || session.nivel_urgencia === "critica" ? "danger" : session.nivel_urgencia === "media" ? "warning" : "success"}
                />
              </div>
            </div>

            {/* Bitácora de Contenido */}
            <div className="space-y-4">
              <div className="rounded-xl border border-white/6 bg-[#151c24] p-5 shadow-sm">
                <h3 className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
                  <ClipboardList className="h-4 w-4" /> Puntos Relevantes
                </h3>
                <p className="text-sm text-white/70 leading-relaxed italic">
                  {session.puntos_relevantes || "No se registraron puntos específicos en esta sesión."}
                </p>
              </div>

              <div className="rounded-xl border border-white/6 bg-[#151c24] p-5 shadow-sm">
                <h3 className="text-xs font-bold text-amber-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
                  <CheckCircle2 className="h-4 w-4" /> Compromisos y Acuerdos
                </h3>
                <p className="text-sm text-white/70 leading-relaxed italic">
                  {session.compromisos_acuerdos || "Sin compromisos registrados."}
                </p>
              </div>
            </div>

            {/* Motivos de la sesión */}
            <div>
              <h3 className="text-[10px] font-bold text-white/30 mb-3 uppercase tracking-[0.2em]">Motivos Seleccionados</h3>
              <div className="flex flex-wrap gap-2">
                {session.motivos?.map((motivo: string) => (
                  <span key={motivo} className="rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-white/60">
                    {motivo}
                  </span>
                )) || <span className="text-xs text-white/20 italic">No especificados</span>}
              </div>
            </div>

            {/* ═══ Secciones extras para sesiones realizadas ═══ */}
            {session.estatus === "realizada" && (
              <div className="space-y-4 border-t border-white/6 pt-6">
                <h3 className="text-[10px] font-bold text-white/30 mb-2 uppercase tracking-[0.2em]">
                  Seguimiento Integral
                </h3>

                {/* Canalizaciones */}
                <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-5 shadow-sm">
                  <h4 className="text-xs font-bold text-cyan-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
                    <ArrowRightLeft className="h-4 w-4" /> Canalizaciones
                  </h4>
                  {canalizaciones.length > 0 ? (
                    <div className="space-y-3">
                      {canalizaciones.map((c: any) => (
                        <div key={c.id} className="rounded-lg border border-white/5 bg-white/2 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-white/80 capitalize">{c.tipo_servicio?.replace(/_/g, " ")}</span>
                            <StatusBadge status={c.estatus} />
                          </div>
                          <p className="text-xs text-white/50 line-clamp-2">{c.motivo}</p>
                          <p className="text-[10px] text-white/30 mt-1 font-mono">{formatFechaLocal(c.fecha_canalizacion)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/20 italic">Sin canalizaciones registradas para este alumno.</p>
                  )}
                </div>

                {/* Incidencias */}
                <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-5 shadow-sm">
                  <h4 className="text-xs font-bold text-amber-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
                    <AlertTriangle className="h-4 w-4" /> Incidencias
                  </h4>
                  {incidencias.length > 0 ? (
                    <div className="space-y-3">
                      {incidencias.map((i: any) => (
                        <div key={i.id} className="rounded-lg border border-white/5 bg-white/2 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-white/80">{i.tipo_incidencia}</span>
                            <StatusBadge status={i.estatus} />
                          </div>
                          <p className="text-xs text-white/50 line-clamp-2">{i.descripcion}</p>
                          <p className="text-[10px] text-white/30 mt-1 font-mono">{formatFechaLocal(i.fecha)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/20 italic">Sin incidencias registradas para este alumno.</p>
                  )}
                </div>

                {/* Planes de Acción */}
                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-5 shadow-sm">
                  <h4 className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
                    <Target className="h-4 w-4" /> Planes de Acción
                  </h4>
                  {planesAccion.length > 0 ? (
                    <div className="space-y-4">
                      {planesAccion.map((p: any) => (
                        <div key={p.id} className="rounded-lg border border-white/5 bg-white/2 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-white/80">Plan · {p.periodo}</span>
                            <StatusBadge status={p.estatus} />
                          </div>
                          <p className="text-xs text-white/50 mb-2">{p.objetivo_general}</p>
                          <div className="space-y-1.5">
                            {(p.metas || []).map((meta: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-2">
                                <div className={cn(
                                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                                  meta.lograda ? "bg-emerald-600/20" : "bg-white/6"
                                )}>
                                  <CheckCircle2 className={cn("h-2.5 w-2.5", meta.lograda ? "text-emerald-400" : "text-white/20")} />
                                </div>
                                <span className={cn("text-xs", meta.lograda ? "text-white/40 line-through" : "text-white/70")}>
                                  {meta.descripcion}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/20 italic">Sin planes de acción para este alumno.</p>
                  )}
                </div>
              </div>
            )}

            {/* Estado de Firmas */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-3 transition-colors",
                session.confirmado_tutor ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-white/2"
              )}>
                {session.confirmado_tutor ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-white/10" />}
                <span className={cn("text-xs font-medium", session.confirmado_tutor ? "text-emerald-400" : "text-white/20")}>
                  Firma del Tutor
                </span>
              </div>
              <div className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-3 transition-colors",
                session.confirmado_alumno ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-white/2"
              )}>
                {session.confirmado_alumno ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-white/10" />}
                <span className={cn("text-xs font-medium", session.confirmado_alumno ? "text-emerald-400" : "text-white/20")}>
                  Firma del Alumno
                </span>
              </div>
            </div>

            {/* Footer / Acciones */}
            <div className="pt-6 flex items-center justify-between border-t border-white/6">
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="text-white/40 hover:text-white hover:bg-white/5"
              >
                Cerrar consulta
              </Button>
              <Button 
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
              >
                <Download className="h-4 w-4" /> Exportar PDF Oficial
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
