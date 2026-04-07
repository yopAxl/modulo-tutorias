// ─── Mock Data ──────────────────────────────────────────────────────────────
// Datos estáticos que simulan la BD. Reemplazar con Supabase queries más adelante.

export type RiesgoNivel = "Bajo" | "Medio" | "Alto";

export interface Alumno {
  id: string;
  matricula: string;
  nombre: string;
  genero: "M" | "F" | "X";
  carrera: string;
  grupo: string;
  cuatrimestre: number;
  promedio: number;
  riesgo: RiesgoNivel;
  correo: string;
  telefono: string;
  tutorId: string;
  docenteId: string;
  activo: boolean;
}

export interface Sesion {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  tutorId: string;
  fecha: string; // ISO date
  horaInicio: string;
  horaFin: string;
  temas: string[];
  acuerdos: string;
  motivos: string[];
  urgencia: "Baja" | "Media" | "Alta";
  estatus: "programada" | "realizada" | "cancelada" | "pendiente" | "no_presentado";
  duracionMin: number;
  confirmadoTutor: boolean;
  confirmadoAlumno: boolean;
}

export interface Tutor {
  id: string;
  nombre: string;
  correo: string;
  departamento: string;
  especialidad: string;
  alumnosAsignados: number;
  sesionesEsteCorte: number;
  activo: boolean;
}

export interface Docente {
  id: string;
  nombre: string;
  correo: string;
  departamento: string;
  activo: boolean;
}

export interface Calificacion {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  docenteId: string;
  asignatura: string;
  periodo: string;
  calificacion: number;
  tipoEvaluacion: "ordinario" | "extraordinario" | "titulo" | "otro";
  observaciones: string;
  fecha: string;
}

export interface Incidencia {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  registradoPor: string;
  fecha: string;
  tipoIncidencia: string;
  descripcion: string;
  estatus: "abierta" | "en_proceso" | "cerrada" | "archivada";
  resolucion: string;
}

export interface Canalizacion {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  tutorId: string;
  sesionId: string | null;
  tipoServicio: string;
  fechaCanalizacion: string;
  motivo: string;
  estatus: "pendiente" | "en_atencion" | "concluida" | "cancelada";
  seguimiento: string;
}

export interface Documento {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  sesionId: string | null;
  tipoDocumento: string;
  nombreArchivo: string;
  nivelPrivacidad: "visible" | "oculto";
  subidoPor: string;
  mimeType: string;
  tamanoBytes: number;
  fecha: string;
}

export interface AuditEvent {
  id: string;
  userId: string;
  userName: string;
  rolActivo: string;
  evento: string;
  tablaAfectada: string;
  registroId: string;
  ipAddress: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Notificacion {
  id: string;
  userId: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  urlAccion: string;
  createdAt: string;
}

export interface PlanAccion {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  tutorId: string;
  periodo: string;
  objetivoGeneral: string;
  metas: { descripcion: string; fechaLimite: string; lograda: boolean }[];
  estatus: "activo" | "completado" | "cancelado";
  fechaInicio: string;
  fechaRevision: string;
}

export interface DisponibilidadTutor {
  id: string;
  tutorId: string;
  diaSemana: number; // 0=dom … 6=sab
  horaInicio: string;
  horaFin: string;
  activa: boolean;
}

export interface Respaldo {
  id: string;
  fecha: string;
  tipo: "automatico" | "manual";
  tamano: string;
  estado: "completado" | "en_proceso" | "fallido";
  ejecutadoPor: string;
}

// ─── Motivos de tutoría (catálogo R07-M01-01) ──────────────────────────────
export const MOTIVOS_TUTORIA = [
  { codigo: "reprobacion", descripcion: "Reprobación" },
  { codigo: "ausentismo", descripcion: "Ausentismo" },
  { codigo: "problemas_economicos", descripcion: "Problemas Económicos" },
  { codigo: "indisciplina", descripcion: "Indisciplina" },
  { codigo: "falta_atencion_clases", descripcion: "Falta de Atención en Clases" },
  { codigo: "problemas_familiares", descripcion: "Problemas Familiares o Personales" },
  { codigo: "impuntualidad", descripcion: "Impuntualidad" },
  { codigo: "falta_compromiso", descripcion: "Falta de Compromiso" },
  { codigo: "incumplimiento_expectativas", descripcion: "Incumplimiento de Expectativas" },
  { codigo: "otros", descripcion: "Otros" },
];

export const TIPOS_CANALIZACION = [
  { codigo: "psicologia", descripcion: "Psicología" },
  { codigo: "medico", descripcion: "Servicio Médico" },
  { codigo: "trabajo_social", descripcion: "Trabajo Social" },
];

export const NIVELES_URGENCIA = [
  { codigo: "normal", descripcion: "Normal" },
  { codigo: "medio", descripcion: "Medio" },
  { codigo: "urgente", descripcion: "Urgente" },
  { codigo: "critico", descripcion: "Crítico" },
];

// ─── Datos vacíos (se cargarán desde Supabase) ──────────────────────────────
// Los arrays están vacíos. En la siguiente fase se reemplazarán por queries
// reales a las tablas del esquema tutorias.

export const TUTORES: Tutor[] = [];
export const DOCENTES: Docente[] = [];
export const ALUMNOS: Alumno[] = [];
export const SESIONES: Sesion[] = [];
export const PROXIMAS_SESIONES: { id: string; alumnoNombre: string; dia: string; mes: string; hora: string }[] = [];
export const CALIFICACIONES: Calificacion[] = [];
export const INCIDENCIAS: Incidencia[] = [];
export const CANALIZACIONES: Canalizacion[] = [];
export const DOCUMENTOS: Documento[] = [];
export const AUDIT_LOG: AuditEvent[] = [];
export const NOTIFICACIONES: Notificacion[] = [];
export const PLANES_ACCION: PlanAccion[] = [];
export const DISPONIBILIDAD_TUTOR: DisponibilidadTutor[] = [];
export const RESPALDOS: Respaldo[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getAlumnosByTutor(tutorId: string) {
  return ALUMNOS.filter((a) => a.tutorId === tutorId);
}

export function getSesionesByTutor(tutorId: string) {
  return SESIONES.filter((s) => s.tutorId === tutorId);
}

export function getAlumnosByDocente(docenteId: string) {
  return ALUMNOS.filter((a) => a.docenteId === docenteId);
}

export function getCalificacionesByDocente(docenteId: string) {
  return CALIFICACIONES.filter((c) => c.docenteId === docenteId);
}

export function getCalificacionesByAlumno(alumnoId: string) {
  return CALIFICACIONES.filter((c) => c.alumnoId === alumnoId);
}

export function getDocumentosByAlumno(alumnoId: string, soloVisibles = false) {
  return DOCUMENTOS.filter((d) => d.alumnoId === alumnoId && (!soloVisibles || d.nivelPrivacidad === "visible"));
}

export function getIncidenciasByAlumno(alumnoId: string) {
  return INCIDENCIAS.filter((i) => i.alumnoId === alumnoId);
}

export function getCanalizacionesByAlumno(alumnoId: string) {
  return CANALIZACIONES.filter((c) => c.alumnoId === alumnoId);
}

export function getCanalizacionesByTutor(tutorId: string) {
  return CANALIZACIONES.filter((c) => c.tutorId === tutorId);
}

export function getPlanesAccionByAlumno(alumnoId: string) {
  return PLANES_ACCION.filter((p) => p.alumnoId === alumnoId);
}

export function formatFecha(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatFechaHora(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function gpaClass(promedio: number) {
  if (promedio >= 8.5) return "gpa-high";
  if (promedio >= 7.0) return "gpa-mid";
  return "gpa-low";
}

export function formatTamano(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
