"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Loader2, CheckCircle2,
  Hash, GraduationCap, School,
  AlertCircle, Calendar, Clock, ClipboardList,
  ArrowRightLeft, AlertTriangle, Target, ChevronDown, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createSessionAction, updateSessionAction,
  createCanalizacionAction, createIncidenciaAction, createPlanAccionAction,
  getCatalogosCanalizacion
} from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumnos: { id: string; nombre: string; matricula?: string; carrera?: string; grupo?: string }[];
  catalogos: {
    motivos: { codigo: string; descripcion: string }[];
    urgencias: { codigo: string; descripcion: string }[];
  };
  tutorId: string;
  sessionToEdit?: any;
  onSuccess?: () => void;
}

export function CreateSessionModal({ isOpen, onClose, alumnos, catalogos, tutorId, sessionToEdit, onSuccess }: CreateSessionModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string>("");
  const [selectedMotivos, setSelectedMotivos] = useState<string[]>([]);
  const [urgencia, setUrgencia] = useState<string>("normal");
  const [estatus, setEstatus] = useState<string>("realizada");

  // Estados para campos del formulario
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [puntosRelevantes, setPuntosRelevantes] = useState("");
  const [compromisosAcuerdos, setCompromisosAcuerdos] = useState("");

  // ── Seguimiento opcional (canalizaciones, incidencias, plan) ──
  const [showCanalizacion, setShowCanalizacion] = useState(false);
  const [canTipoServicio, setCanTipoServicio] = useState("");
  const [canMotivo, setCanMotivo] = useState("");
  const [canSeguimiento, setCanSeguimiento] = useState("");

  const [showIncidencia, setShowIncidencia] = useState(false);
  const [incTipo, setIncTipo] = useState("");
  const [incDescripcion, setIncDescripcion] = useState("");
  const [incResolucion, setIncResolucion] = useState("");

  const [showPlan, setShowPlan] = useState(false);
  const [planObjetivo, setPlanObjetivo] = useState("");
  const [planMetas, setPlanMetas] = useState<{ descripcion: string; fecha_limite: string }[]>([]);

  // Catálogo dinámico de tipos de canalización
  const [catCanalizacion, setCatCanalizacion] = useState<{ codigo: string; descripcion: string }[]>([]);

  // Efecto para cargar datos en modo edición y catálogos
  useEffect(() => {
    if (isOpen) {
      // Cargar catálogo de canalizaciones
      getCatalogosCanalizacion().then(res => {
        if (res.data && res.data.length > 0) setCatCanalizacion(res.data);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (sessionToEdit && isOpen) {
      setSelectedAlumnoId(sessionToEdit.alumno_id || "");
      
      // Mapeo ultra-robusto de motivos: 
      // 1. Maneja arrays de objetos [{motivo_codigo: '...'}] o strings planos
      // 2. Normaliza guiones medios y bajos para evitar fallos de coincidencia
      const motivosRaw = sessionToEdit.sesion_motivos || [];
      const motivosCodes = motivosRaw.map((m: any) => {
        const code = (m.motivo_codigo || m || "").toString();
        // Normalizamos: todo a guión bajo para la comparación interna si es necesario, 
        // pero aquí simplemente aceptamos lo que venga y lo limpiamos.
        return code.trim();
      });
      
      // Intentamos coincidir con los códigos del catálogo para ser más precisos
      const validCodes = catalogos.motivos.map(m => m.codigo.trim());
      const filteredCodes = motivosCodes.filter((c: string) => validCodes.includes(c));
      
      setSelectedMotivos(filteredCodes);

      setUrgencia(sessionToEdit.nivel_urgencia || "normal");
      setEstatus(sessionToEdit.estatus || "realizada");
      setFecha(sessionToEdit.fecha || "");
      setHoraInicio(sessionToEdit.hora_inicio?.slice(0, 5) || "");
      setHoraFin(sessionToEdit.hora_fin?.slice(0, 5) || "");
      setPuntosRelevantes(sessionToEdit.puntos_relevantes || "");
      setCompromisosAcuerdos(sessionToEdit.compromisos_acuerdos || "");
      
      // Mapear seguimiento existente si está disponible
      const canalizacion = sessionToEdit.canalizaciones?.[0] || null;
      if (canalizacion) {
        setCanTipoServicio(canalizacion.tipo_servicio || "");
        setCanMotivo(canalizacion.motivo || "");
        setCanSeguimiento(canalizacion.seguimiento || "");
        setShowCanalizacion(true);
      } else {
        setCanTipoServicio(""); setCanMotivo(""); setCanSeguimiento("");
        setShowCanalizacion(false);
      }

      const incidencia = sessionToEdit.incidencias?.[0] || null;
      if (incidencia) {
        setIncTipo(incidencia.tipo_incidencia || "");
        setIncDescripcion(incidencia.descripcion || "");
        setIncResolucion(incidencia.resolucion || "");
        setShowIncidencia(true);
      } else {
        setIncTipo(""); setIncDescripcion(""); setIncResolucion("");
        setShowIncidencia(false);
      }

      const plan = sessionToEdit.planes_accion?.[0] || null;
      if (plan) {
        setPlanObjetivo(plan.objetivo_general || "");
        setPlanMetas(plan.metas || []);
        setShowPlan(true);
      } else {
        setPlanObjetivo(""); setPlanMetas([]);
        setShowPlan(false);
      }
    } else if (!sessionToEdit && isOpen) {
      // Limpiar para nueva sesión
      setSelectedAlumnoId("");
      setSelectedMotivos([]);
      setUrgencia("normal");
      setEstatus("realizada");
      setFecha("");
      setHoraInicio("");
      setHoraFin("");
      setPuntosRelevantes("");
      setCompromisosAcuerdos("");
      // Limpiar seguimiento
      setShowCanalizacion(false);
      setCanTipoServicio(""); setCanMotivo(""); setCanSeguimiento("");
      setShowIncidencia(false);
      setIncTipo(""); setIncDescripcion(""); setIncResolucion("");
      setShowPlan(false);
      setPlanObjetivo(""); setPlanMetas([]);
    }
  }, [sessionToEdit, isOpen]);

  // Buscar el registro del alumno seleccionado para el auto-llenado dinámico
  const selectedAlumno = useMemo(() => {
    return alumnos.find(a => a.id === selectedAlumnoId);
  }, [alumnos, selectedAlumnoId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAlumnoId) {
      toast.error("Por favor selecciona un alumno.");
      return;
    }
    if (selectedMotivos.length === 0) {
      toast.error("Por favor selecciona al menos un motivo.");
      return;
    }

    const payload = {
      alumno_id: selectedAlumnoId,
      tutor_id: tutorId,
      fecha,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      puntos_relevantes: puntosRelevantes,
      compromisos_acuerdos: compromisosAcuerdos,
      nivel_urgencia: urgencia,
      estatus,
      motivos: selectedMotivos
    };

    setLoading(true);
    let res;
    if (sessionToEdit?.id) {
      res = await updateSessionAction(sessionToEdit.id, payload);
    } else {
      res = await createSessionAction(payload);
    }
    setLoading(false);

    if (res.error) {
      toast.error("Error: " + res.error);
    } else {
      // Obtener sesion_id para relacionar seguimiento
      const sesionId = ('data' in res && res.data?.id) ? res.data.id : sessionToEdit?.id;

      // Crear seguimiento opcionales en paralelo
      const followups: Promise<any>[] = [];

      if (showCanalizacion && canTipoServicio && canMotivo) {
        followups.push(
          createCanalizacionAction({
            alumno_id: selectedAlumnoId,
            tutor_id: tutorId,
            sesion_id: sesionId,
            tipo_servicio: canTipoServicio,
            motivo: canMotivo,
            seguimiento: canSeguimiento,
          })
        );
      }

      if (showIncidencia && incTipo && incDescripcion) {
        followups.push(
          createIncidenciaAction({
            alumno_id: selectedAlumnoId,
            registrado_por: tutorId,
            tipo_incidencia: incTipo,
            descripcion: incDescripcion,
            resolucion: incResolucion,
          })
        );
      }

      if (showPlan && planObjetivo && planMetas.length > 0) {
        followups.push(
          createPlanAccionAction({
            alumno_id: selectedAlumnoId,
            tutor_id: tutorId,
            objetivo_general: planObjetivo,
            metas: planMetas.map(m => ({ ...m, lograda: false })),
          })
        );
      }

      if (followups.length > 0) {
        const results = await Promise.all(followups);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
          toast.warning("Sesión guardada, pero hubo errores en el seguimiento.");
        }
      }

      toast.success(sessionToEdit ? "Sesión actualizada exitosamente." : "Sesión registrada exitosamente.");
      if (onSuccess) onSuccess();
      onClose();
      router.refresh();
      // Pequeño hack para forzar recarga de datos en el cliente si es necesario
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('session-updated'));
      }
    }
  }

  function toggleMotivo(codigo: string) {
    setSelectedMotivos((prev) =>
      prev.includes(codigo) ? prev.filter((m) => m !== codigo) : [...prev, codigo]
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="border border-white/5 bg-[#0f151c] text-white sm:max-w-4xl p-0 overflow-hidden shadow-2xl shadow-emerald-900/10 sm:rounded-2xl outline-none ring-0">
        <div className="overflow-y-auto max-h-[85vh] p-6 md:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">

          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                Formato R07-M01-01 Digital
              </span>
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              {sessionToEdit ? "Editar Bitácora de Tutoría" : "Nueva Bitácora de Tutoría"}
            </DialogTitle>
            <DialogDescription className="text-white/40 text-sm mt-1">
              {sessionToEdit 
                ? "Actualiza la información de la sesión y completa la bitácora si es necesario." 
                : "Registro dinámico de sesión. La información institucional se carga automáticamente."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-8 mt-2">

            {/* SECCIÓN 1: DATOS INSTITUCIONALES (Auto-llenado) */}
            <div className="rounded-xl border border-white/5 bg-[#151c24] p-5 md:p-8 shadow-sm">
              <h3 className="text-xs font-bold text-emerald-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-[10px]">1</span>
                Información del Estudiante
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="space-y-2 flex flex-col">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Alumno a Atender</Label>
                  <Select value={selectedAlumnoId} onValueChange={(val) => setSelectedAlumnoId(val || "")} required>
                    <SelectTrigger className="h-12 rounded-xl border border-white/8 bg-white/4 text-sm text-white focus:ring-1 focus:ring-emerald-500/20 transition-all">
                      <SelectValue placeholder="Elegir alumno de la lista...">
                        {selectedAlumno ? selectedAlumno.nombre : "Elegir alumno de la lista..."}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#151c24] border-white/10 text-white">
                      {alumnos.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Estado de la Sesión</Label>
                  <Select value={estatus} onValueChange={(val) => setEstatus(val || "realizada")}>
                    <SelectTrigger className="h-12 rounded-xl border border-white/8 bg-white/4 text-sm text-white focus:ring-1 focus:ring-emerald-500/20 capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151c24] border-white/10 text-white min-w-[220px]">
                      <SelectItem value="programada" className="capitalize">📅 Programada / Agendar</SelectItem>
                      <SelectItem value="realizada" className="capitalize">✅ Realizada / Bitácora</SelectItem>
                      <SelectItem value="pendiente" className="capitalize">⏳ Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Prioridad / Urgencia</Label>
                  <Select name="nivel_urgencia" value={urgencia} onValueChange={(val) => setUrgencia(val || "normal")}>
                    <SelectTrigger className="h-12 rounded-xl border border-white/8 bg-white/4 text-sm text-white focus:ring-1 focus:ring-emerald-500/20 capitalize">
                      <SelectValue placeholder="Seleccionar urgencia" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151c24] border-white/10 text-white">
                      {catalogos.urgencias.map((u) => (
                        <SelectItem key={u.codigo} value={u.codigo} className="capitalize">
                          {u.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Grid de Datos Automáticos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-8">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 transition-all">
                  <div className="flex items-center gap-2 text-white/30 mb-1">
                    <Hash className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase">Matrícula</span>
                  </div>
                  <p className={cn("text-sm font-semibold", selectedAlumno ? "text-white/90" : "text-white/10 italic")}>
                    {selectedAlumno?.matricula || "Pendiente de selección"}
                  </p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 transition-all">
                  <div className="flex items-center gap-2 text-white/30 mb-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase">Carrera (Siglas)</span>
                  </div>
                  <p className={cn("text-sm font-semibold uppercase", selectedAlumno ? "text-white/90" : "text-white/10 italic")}>
                    {selectedAlumno?.carrera || "—"}
                  </p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 transition-all">
                  <div className="flex items-center gap-2 text-white/30 mb-1">
                    <School className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase">Grupo</span>
                  </div>
                  <p className={cn("text-sm font-semibold", selectedAlumno ? "text-white/90" : "text-white/10 italic")}>
                    {selectedAlumno?.grupo || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: HORARIO Y FECHA */}
            <div className="rounded-xl border border-white/5 bg-[#151c24] p-5 md:p-8 shadow-sm">
              <h3 className="text-xs font-bold text-emerald-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-[10px]">2</span>
                Tiempos de la Sesión
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2 flex flex-col">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Fecha de Encuentro</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input 
                      type="date" 
                      value={fecha} 
                      onChange={(e) => setFecha(e.target.value)} 
                      required 
                      className="h-12 rounded-xl border-white/8 bg-white/4 text-white pl-10" 
                    />
                  </div>
                </div>
                <div className="space-y-2 flex flex-col">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Hora Inicio</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input 
                      type="time" 
                      value={horaInicio} 
                      onChange={(e) => setHoraInicio(e.target.value)} 
                      required 
                      className="h-12 rounded-xl border-white/8 bg-white/4 text-white pl-10" 
                    />
                  </div>
                </div>
                <div className="space-y-2 flex flex-col">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Hora Fin</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input 
                      type="time" 
                      value={horaFin} 
                      onChange={(e) => setHoraFin(e.target.value)} 
                      required 
                      className="h-12 rounded-xl border-white/8 bg-white/4 text-white pl-10" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: MOTIVOS DINÁMICOS */}
            <div className="rounded-xl border border-white/5 bg-[#151c24] p-5 md:p-8 shadow-sm">
              <h3 className="text-xs font-bold text-emerald-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-[10px]">3</span>
                Motivos de Intervención
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {catalogos.motivos.map((m) => (
                  <button
                    key={m.codigo}
                    type="button"
                    onClick={() => toggleMotivo(m.codigo)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all group",
                      selectedMotivos.includes(m.codigo)
                        ? "border-emerald-500/40 bg-emerald-500/5 text-white"
                        : "border-white/5 bg-white/2 text-white/40 hover:border-white/10 hover:bg-white/4"
                    )}
                  >
                    <div className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all",
                      selectedMotivos.includes(m.codigo) ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-white/20 group-hover:border-white/40"
                    )}>
                      {selectedMotivos.includes(m.codigo) && <CheckCircle2 className="h-3.5 w-3.5 text-[#0f151c]" />}
                    </div>
                    <span className="text-xs font-medium leading-tight">{m.descripcion}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECCIÓN 4: BITÁCORA DETALLADA */}
            {estatus === "realizada" ? (
              <div className="rounded-xl border border-white/5 bg-[#151c24] p-5 md:p-8 shadow-sm">
                <h3 className="text-xs font-bold text-emerald-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-[10px]">4</span>
                  Bitácora y Acuerdos
                </h3>
                <div className="space-y-8">
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
                      <ClipboardList className="h-3 w-3" /> Puntos Relevantes Tratados
                    </Label>
                    <textarea
                      value={puntosRelevantes}
                      onChange={(e) => setPuntosRelevantes(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-white/8 bg-white/4 p-4 text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all resize-none"
                      placeholder="Escriba los puntos clave discutidos en la sesión..."
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-amber-500" /> Compromisos y Tareas del Alumno
                    </Label>
                    <textarea
                      value={compromisosAcuerdos}
                      onChange={(e) => setCompromisosAcuerdos(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-white/8 bg-white/4 p-4 text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all resize-none"
                      placeholder="Registre los compromisos y plazos establecidos..."
                    />
                  </div>
                </div>
              </div>
            ) : estatus === "cancelada" ? (
              <div className="bg-red-500/5 border border-dashed border-red-500/20 rounded-xl p-10 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-500/50" />
                  </div>
                </div>
                <div className="max-w-xs mx-auto space-y-2">
                  <p className="text-sm text-red-400 font-bold">
                    Sesión Cancelada
                  </p>
                  <p className="text-xs text-white/30 leading-relaxed">
                    Esta sesión ha sido marcada como cancelada. No se requiere bitácora de acuerdos para este registro.
                  </p>
                </div>
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => setEstatus("realizada")}
                  className="mt-4 text-[10px] uppercase tracking-widest text-white/20 hover:text-white/40"
                >
                  Re-activar y Comenzar Tutoría
                </Button>
              </div>
            ) : (
              <div className="bg-[#151c24]/50 border border-dashed border-white/10 rounded-xl p-10 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
                    <ClipboardList className="h-6 w-6 text-white/20" />
                  </div>
                </div>
                <div className="max-w-xs mx-auto space-y-2">
                  <p className="text-sm text-white/60 font-medium">
                    Gestión de Bitácora
                  </p>
                  <p className="text-xs text-white/30 leading-relaxed">
                    Para registrar compromisos y acuerdos, la tutoría debe estar en curso o finalizada.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                  <Button 
                    type="button"
                    onClick={() => setEstatus("realizada")}
                    className="w-full sm:w-auto border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 font-bold"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Comenzar Tutoría
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setEstatus("cancelada")}
                    className="w-full sm:w-auto border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 font-semibold"
                  >
                    Cancelar Sesión
                  </Button>
                </div>
              </div>
            )}

            {/* SECCIÓN 5: SEGUIMIENTO INTEGRAL (solo para sesiones realizadas) */}
            {estatus === "realizada" && (
              <div className="rounded-xl border border-white/5 bg-[#151c24] p-5 md:p-8 shadow-sm">
                <h3 className="text-xs font-bold text-emerald-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-[10px]">5</span>
                  Seguimiento Integral
                </h3>

                {/* ═══ Registros existentes (solo lectura) ═══ */}
                {sessionToEdit && (sessionToEdit._existingCanalizaciones?.length > 0 || sessionToEdit._existingIncidencias?.length > 0 || sessionToEdit._existingPlanes?.length > 0) && (
                  <div className="mb-6 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Registros guardados</p>

                    {(sessionToEdit._existingCanalizaciones || []).map((c: any) => (
                      <div key={c.id} className="flex items-center gap-3 rounded-lg border border-cyan-500/10 bg-cyan-500/[0.03] px-4 py-2.5">
                        <ArrowRightLeft className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-cyan-300 capitalize">{c.tipo_servicio?.replace(/_/g, " ")}</span>
                          <span className="text-[10px] text-white/30 mx-2">·</span>
                          <span className="text-xs text-white/50 truncate">{c.motivo}</span>
                        </div>
                        <span className="text-[10px] text-white/20 font-mono shrink-0">{new Date(c.fecha_canalizacion).toLocaleDateString('es-MX')}</span>
                      </div>
                    ))}

                    {(sessionToEdit._existingIncidencias || []).map((i: any) => (
                      <div key={i.id} className="flex items-center gap-3 rounded-lg border border-amber-500/10 bg-amber-500/[0.03] px-4 py-2.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-amber-300">{i.tipo_incidencia}</span>
                          <span className="text-[10px] text-white/30 mx-2">·</span>
                          <span className="text-xs text-white/50 truncate">{i.descripcion}</span>
                        </div>
                        <span className="text-[10px] text-white/20 font-mono shrink-0">{new Date(i.fecha).toLocaleDateString('es-MX')}</span>
                      </div>
                    ))}

                    {(sessionToEdit._existingPlanes || []).map((p: any) => (
                      <div key={p.id} className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] px-4 py-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-xs font-semibold text-emerald-300">Plan · {p.periodo}</span>
                          <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full capitalize">{p.estatus}</span>
                        </div>
                        <p className="text-xs text-white/50 ml-5.5 mb-1">{p.objetivo_general}</p>
                        <div className="ml-5.5 space-y-0.5">
                          {(p.metas || []).map((m: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <CheckCircle2 className={cn("h-2.5 w-2.5", m.lograda ? "text-emerald-400" : "text-white/15")} />
                              <span className={cn("text-[11px]", m.lograda ? "text-white/40 line-through" : "text-white/60")}>{m.descripcion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-white/5 pt-4 mt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">Agregar nuevo registro</p>
                    </div>
                  </div>
                )}

                {!sessionToEdit && (
                  <p className="text-xs text-white/30 mb-6">Activa las secciones que necesites registrar para este alumno.</p>
                )}

                <div className="space-y-4">
                  {/* ── Canalización ── */}
                  <div className="rounded-lg border border-cyan-500/10 bg-cyan-500/[0.02] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowCanalizacion(!showCanalizacion)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-cyan-500/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4 text-cyan-400" />
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Canalización</span>
                        {showCanalizacion && <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full">activo</span>}
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-white/20 transition-transform", showCanalizacion && "rotate-180")} />
                    </button>
                    {showCanalizacion && (
                      <div className="px-4 pb-4 space-y-3 border-t border-cyan-500/10">
                        <div className="pt-3 space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Tipo de Servicio *</Label>
                          <select
                            value={canTipoServicio}
                            onChange={(e) => setCanTipoServicio(e.target.value)}
                            className="w-full h-10 rounded-lg border border-white/8 bg-white/4 px-3 text-sm text-white outline-none focus:border-cyan-500/40"
                          >
                            <option value="">Seleccionar servicio...</option>
                            {catCanalizacion.length > 0 ? (
                              catCanalizacion.map((c) => (
                                <option key={c.codigo} value={c.codigo}>{c.descripcion}</option>
                              ))
                            ) : (
                              <>
                                <option value="psicologia">Psicología</option>
                                <option value="medico">Servicio Médico</option>
                                <option value="trabajo_social">Trabajo Social</option>
                                <option value="otro">Otro</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Motivo de la canalización *</Label>
                          <textarea
                            value={canMotivo}
                            onChange={(e) => setCanMotivo(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-white/8 bg-white/4 p-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 resize-none"
                            placeholder="Describa el motivo de la canalización..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Seguimiento</Label>
                          <textarea
                            value={canSeguimiento}
                            onChange={(e) => setCanSeguimiento(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-white/8 bg-white/4 p-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 resize-none"
                            placeholder="Notas de seguimiento (opcional)..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Incidencia ── */}
                  <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.02] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowIncidencia(!showIncidencia)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-amber-500/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Incidencia</span>
                        {showIncidencia && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">activo</span>}
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-white/20 transition-transform", showIncidencia && "rotate-180")} />
                    </button>
                    {showIncidencia && (
                      <div className="px-4 pb-4 space-y-3 border-t border-amber-500/10">
                        <div className="pt-3 space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Tipo de Incidencia *</Label>
                          <select
                            value={incTipo}
                            onChange={(e) => setIncTipo(e.target.value)}
                            className="w-full h-10 rounded-lg border border-white/8 bg-white/4 px-3 text-sm text-white outline-none focus:border-amber-500/40"
                          >
                            <option value="">Seleccionar tipo...</option>
                            <option value="academica">Académica</option>
                            <option value="conducta">Conducta</option>
                            <option value="inasistencia">Inasistencia</option>
                            <option value="salud">Salud</option>
                            <option value="familiar">Familiar</option>
                            <option value="economica">Económica</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Descripción *</Label>
                          <textarea
                            value={incDescripcion}
                            onChange={(e) => setIncDescripcion(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-white/8 bg-white/4 p-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-500/40 resize-none"
                            placeholder="Describa la incidencia detectada..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Resolución</Label>
                          <textarea
                            value={incResolucion}
                            onChange={(e) => setIncResolucion(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-white/8 bg-white/4 p-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-500/40 resize-none"
                            placeholder="Propuesta de resolución o acciones tomadas..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Plan de Acción ── */}
                  <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.02] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowPlan(!showPlan)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-emerald-500/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Plan de Acción</span>
                        {showPlan && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">activo</span>}
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-white/20 transition-transform", showPlan && "rotate-180")} />
                    </button>
                    {showPlan && (
                      <div className="px-4 pb-4 space-y-3 border-t border-emerald-500/10">
                        <div className="pt-3 space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Objetivo General *</Label>
                          <textarea
                            value={planObjetivo}
                            onChange={(e) => setPlanObjetivo(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-white/8 bg-white/4 p-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 resize-none"
                            placeholder="Describa el objetivo general del plan..."
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Metas</Label>
                            <button
                              type="button"
                              onClick={() => setPlanMetas([...planMetas, { descripcion: "", fecha_limite: "" }])}
                              className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                              <Plus className="h-3 w-3" /> Agregar meta
                            </button>
                          </div>
                          {planMetas.map((meta, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="flex-1 space-y-1">
                                <Input
                                  value={meta.descripcion}
                                  onChange={(e) => {
                                    const updated = [...planMetas];
                                    updated[idx].descripcion = e.target.value;
                                    setPlanMetas(updated);
                                  }}
                                  placeholder={`Meta ${idx + 1}`}
                                  className="h-9 rounded-lg border-white/8 bg-white/4 text-sm text-white"
                                />
                                <Input
                                  type="date"
                                  value={meta.fecha_limite}
                                  onChange={(e) => {
                                    const updated = [...planMetas];
                                    updated[idx].fecha_limite = e.target.value;
                                    setPlanMetas(updated);
                                  }}
                                  className="h-9 rounded-lg border-white/8 bg-white/4 text-sm text-white"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setPlanMetas(planMetas.filter((_, i) => i !== idx))}
                                className="mt-1 rounded-md p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          {planMetas.length === 0 && (
                            <p className="text-xs text-white/20 italic py-2">Agrega al menos una meta para el plan.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN 6: FIRMA DIGITAL */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400">Firma del Tutor Registrada</p>
                <p className="text-[10px] text-emerald-500/60 font-medium">Al confirmar, se estampará tu firma digital institucional automáticamente.</p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
                disabled={loading}
              >
                {sessionToEdit ? "Descartar Cambios" : "Cancelar Registro"}
              </button>
              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="h-12 px-10 font-bold bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 rounded-xl hover:bg-emerald-500 transition-all scale-100 active:scale-95">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (sessionToEdit ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />)}
                  {loading ? "Procesando..." : (sessionToEdit ? "Guardar Cambios" : "Registrar Sesión")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
