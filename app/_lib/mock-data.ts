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

// ─── Tutores ─────────────────────────────────────────────────────────────────
export const TUTORES: Tutor[] = [
  {
    id: "t1",
    nombre: "Dra. María Rodríguez López",
    correo: "m.rodriguez@utnay.edu.mx",
    departamento: "Desarrollo y Gestión de Software",
    especialidad: "Ingeniería de Software",
    alumnosAsignados: 12,
    sesionesEsteCorte: 28,
    activo: true,
  },
  {
    id: "t2",
    nombre: "Mtro. Carlos Vargas Soto",
    correo: "c.vargas@utnay.edu.mx",
    departamento: "Administración",
    especialidad: "Gestión Empresarial",
    alumnosAsignados: 9,
    sesionesEsteCorte: 17,
    activo: true,
  },
  {
    id: "t3",
    nombre: "Ing. Patricia Hernández",
    correo: "p.hernandez@utnay.edu.mx",
    departamento: "Desarrollo y Gestión de Software",
    especialidad: "Bases de Datos",
    alumnosAsignados: 11,
    sesionesEsteCorte: 22,
    activo: true,
  },
];

// ─── Docentes ────────────────────────────────────────────────────────────────
export const DOCENTES: Docente[] = [
  { id: "d1", nombre: "Mtro. José Antonio Pérez Ruiz", correo: "jperez@utnay.edu.mx", departamento: "Desarrollo y Gestión de Software", activo: true },
  { id: "d2", nombre: "Dra. Laura Sánchez Varela", correo: "lsanchez@utnay.edu.mx", departamento: "Ciencias Básicas", activo: true },
];

// ─── Alumnos ──────────────────────────────────────────────────────────────────
export const ALUMNOS: Alumno[] = [
  {
    id: "a1", matricula: "UTN20001", nombre: "Kevin Abraham",
    genero: "M", carrera: "IDGS", grupo: "8", cuatrimestre: 7,
    promedio: 7.2, riesgo: "Alto",
    correo: "kkevin@alumnos.utnay.edu.mx", telefono: "3111234567",
    tutorId: "t1", docenteId: "d1", activo: true,
  },
  {
    id: "a2", matricula: "UTN20042", nombre: "Axel Eduardo García Torres",
    genero: "M", carrera: "IDGS", grupo: "8", cuatrimestre: 7,
    promedio: 8.9, riesgo: "Bajo",
    correo: "agarcia@alumnos.utnay.edu.mx", telefono: "3119876543",
    tutorId: "t1", docenteId: "d1", activo: true,
  },
  {
    id: "a3", matricula: "UTN20078", nombre: "Roman Darío Pérez Salas",
    genero: "M", carrera: "IDGS", grupo: "5A", cuatrimestre: 5,
    promedio: 6.8, riesgo: "Alto",
    correo: "rperez@alumnos.utnay.edu.mx", telefono: "3117651234",
    tutorId: "t1", docenteId: "d2", activo: true,
  },
  {
    id: "a4", matricula: "LA21003", nombre: "Emiliano Gómez Ruiz",
    genero: "M", carrera: "LA", grupo: "4B", cuatrimestre: 4,
    promedio: 9.1, riesgo: "Bajo",
    correo: "egomez@alumnos.utnay.edu.mx", telefono: "3113216789",
    tutorId: "t1", docenteId: "d1", activo: true,
  },
  {
    id: "a5", matricula: "UTN21015", nombre: "Vladimir Cortez Silva",
    genero: "M", carrera: "IDGS", grupo: "6A", cuatrimestre: 6,
    promedio: 7.8, riesgo: "Medio",
    correo: "vcortez@alumnos.utnay.edu.mx", telefono: "3116543210",
    tutorId: "t1", docenteId: "d2", activo: true,
  },
  {
    id: "a6", matricula: "UTN21028", nombre: "Valeria Cruz Montes",
    genero: "F", carrera: "IDGS", grupo: "6A", cuatrimestre: 6,
    promedio: 8.3, riesgo: "Bajo",
    correo: "vcruz@alumnos.utnay.edu.mx", telefono: "3111239876",
    tutorId: "t1", docenteId: "d2", activo: true,
  },
  {
    id: "a7", matricula: "UTN22004", nombre: "Luis Ángel Ponce Villa",
    genero: "M", carrera: "IDGS", grupo: "3A", cuatrimestre: 3,
    promedio: 6.5, riesgo: "Medio",
    correo: "laponce@alumnos.utnay.edu.mx", telefono: "3118765321",
    tutorId: "t1", docenteId: "d1", activo: true,
  },
  {
    id: "a8", matricula: "LA22009", nombre: "Karen Ibarra Llanes",
    genero: "F", carrera: "LA", grupo: "2B", cuatrimestre: 2,
    promedio: 9.5, riesgo: "Bajo",
    correo: "kibarra@alumnos.utnay.edu.mx", telefono: "3111567890",
    tutorId: "t2", docenteId: "d1", activo: true,
  },
  {
    id: "a9", matricula: "UTN21032", nombre: "Sofía Beltrán Chávez",
    genero: "F", carrera: "IDGS", grupo: "6A", cuatrimestre: 6,
    promedio: 9.5, riesgo: "Bajo",
    correo: "sbeltran@alumnos.utnay.edu.mx", telefono: "3112345678",
    tutorId: "t1", docenteId: "d1", activo: true,
  },
  {
    id: "a10", matricula: "UTN20099", nombre: "Fernanda Ramírez Félix",
    genero: "F", carrera: "IDGS", grupo: "8", cuatrimestre: 7,
    promedio: 9.2, riesgo: "Bajo",
    correo: "framirez@alumnos.utnay.edu.mx", telefono: "3119871234",
    tutorId: "t1", docenteId: "d1", activo: true,
  },
];

// ─── Sesiones ─────────────────────────────────────────────────────────────────
export const SESIONES: Sesion[] = [
  {
    id: "s1", alumnoId: "a1", alumnoNombre: "Kevin Abraham", tutorId: "t1",
    fecha: "2026-03-20", horaInicio: "10:00", horaFin: "11:00",
    temas: ["Bajo rendimiento en cálculo", "Estrategias de estudio"],
    acuerdos: "Acudir a asesorías de matemáticas 2 veces por semana.",
    motivos: ["reprobacion", "falta_atencion_clases"],
    urgencia: "Alta", estatus: "realizada", duracionMin: 60,
    confirmadoTutor: true, confirmadoAlumno: true,
  },
  {
    id: "s2", alumnoId: "a3", alumnoNombre: "Roman Darío Pérez Salas", tutorId: "t1",
    fecha: "2026-03-19", horaInicio: "12:00", horaFin: "12:45",
    temas: ["Ausencias injustificadas", "Situación familiar"],
    acuerdos: "Canalización a trabajo social. Seguimiento en 2 semanas.",
    motivos: ["ausentismo", "problemas_familiares"],
    urgencia: "Alta", estatus: "realizada", duracionMin: 45,
    confirmadoTutor: true, confirmadoAlumno: true,
  },
  {
    id: "s3", alumnoId: "a5", alumnoNombre: "Vladimir Cortez Silva", tutorId: "t1",
    fecha: "2026-03-18", horaInicio: "09:00", horaFin: "09:30",
    temas: ["Revisión de avance académico", "Orientación vocacional"],
    acuerdos: "Entrega de reporte parcial para siguiente sesión.",
    motivos: ["falta_compromiso"],
    urgencia: "Baja", estatus: "realizada", duracionMin: 30,
    confirmadoTutor: true, confirmadoAlumno: false,
  },
  {
    id: "s4", alumnoId: "a7", alumnoNombre: "Luis Ángel Ponce Villa", tutorId: "t1",
    fecha: "2026-03-15", horaInicio: "11:00", horaFin: "11:45",
    temas: ["Reprobación de materia", "Plan de recursamiento"],
    acuerdos: "Inscribir materia recursada en próximo cuatrimestre.",
    motivos: ["reprobacion", "incumplimiento_expectativas"],
    urgencia: "Media", estatus: "realizada", duracionMin: 45,
    confirmadoTutor: true, confirmadoAlumno: true,
  },
  {
    id: "s5", alumnoId: "a2", alumnoNombre: "Axel Eduardo García Torres", tutorId: "t1",
    fecha: "2026-03-12", horaInicio: "10:30", horaFin: "11:00",
    temas: ["Seguimiento general", "Solicitud de beca"],
    acuerdos: "Gestionar documentación para beca de excelencia.",
    motivos: ["otros"],
    urgencia: "Baja", estatus: "realizada", duracionMin: 30,
    confirmadoTutor: true, confirmadoAlumno: true,
  },
  {
    id: "s6", alumnoId: "a1", alumnoNombre: "Kevin Abraham", tutorId: "t1",
    fecha: "2026-03-25", horaInicio: "10:00", horaFin: "10:45",
    temas: ["Seguimiento a asesorías"],
    acuerdos: "",
    motivos: ["reprobacion"],
    urgencia: "Media", estatus: "programada", duracionMin: 45,
    confirmadoTutor: false, confirmadoAlumno: false,
  },
  {
    id: "s7", alumnoId: "a3", alumnoNombre: "Roman Darío Pérez Salas", tutorId: "t1",
    fecha: "2026-03-26", horaInicio: "12:00", horaFin: "12:30",
    temas: ["Revisión post-canalización"],
    acuerdos: "",
    motivos: ["problemas_familiares"],
    urgencia: "Alta", estatus: "programada", duracionMin: 30,
    confirmadoTutor: false, confirmadoAlumno: false,
  },
];

// ─── Próximas sesiones ────────────────────────────────────────────────────────
export const PROXIMAS_SESIONES = [
  { id: "p1", alumnoNombre: "Kevin Abraham", dia: "25", mes: "Mar", hora: "10:00 AM" },
  { id: "p2", alumnoNombre: "Roman Darío Pérez Salas", dia: "26", mes: "Mar", hora: "12:00 PM" },
  { id: "p3", alumnoNombre: "Luis Ángel Ponce Villa", dia: "28", mes: "Mar", hora: "09:00 AM" },
];

// ─── Calificaciones ──────────────────────────────────────────────────────────
export const CALIFICACIONES: Calificacion[] = [
  { id: "c1", alumnoId: "a1", alumnoNombre: "Kevin Abraham", docenteId: "d1", asignatura: "Cálculo Diferencial", periodo: "2026-1", calificacion: 6.5, tipoEvaluacion: "ordinario", observaciones: "Dificultad con integrales", fecha: "2026-03-15" },
  { id: "c2", alumnoId: "a2", alumnoNombre: "Axel Eduardo García Torres", docenteId: "d1", asignatura: "Cálculo Diferencial", periodo: "2026-1", calificacion: 9.2, tipoEvaluacion: "ordinario", observaciones: "", fecha: "2026-03-15" },
  { id: "c3", alumnoId: "a9", alumnoNombre: "Sofía Beltrán Chávez", docenteId: "d1", asignatura: "Ing. de Software", periodo: "2026-1", calificacion: 9.5, tipoEvaluacion: "ordinario", observaciones: "Excelente participación", fecha: "2026-03-14" },
  { id: "c4", alumnoId: "a7", alumnoNombre: "Luis Ángel Ponce Villa", docenteId: "d1", asignatura: "Cálculo Diferencial", periodo: "2026-1", calificacion: 6.0, tipoEvaluacion: "ordinario", observaciones: "Requiere apoyo extraclase", fecha: "2026-03-12" },
  { id: "c5", alumnoId: "a5", alumnoNombre: "Vladimir Cortez Silva", docenteId: "d2", asignatura: "Ing. de Software", periodo: "2026-1", calificacion: 9.8, tipoEvaluacion: "ordinario", observaciones: "", fecha: "2026-03-10" },
  { id: "c6", alumnoId: "a10", alumnoNombre: "Fernanda Ramírez Félix", docenteId: "d1", asignatura: "Ing. de Software", periodo: "2026-1", calificacion: 8.7, tipoEvaluacion: "ordinario", observaciones: "", fecha: "2026-03-15" },
  { id: "c7", alumnoId: "a1", alumnoNombre: "Kevin Abraham", docenteId: "d1", asignatura: "Ing. de Software", periodo: "2026-1", calificacion: 7.5, tipoEvaluacion: "ordinario", observaciones: "", fecha: "2026-03-15" },
  { id: "c8", alumnoId: "a3", alumnoNombre: "Roman Darío Pérez Salas", docenteId: "d2", asignatura: "Base de Datos", periodo: "2026-1", calificacion: 5.8, tipoEvaluacion: "ordinario", observaciones: "No entregó proyecto final", fecha: "2026-03-12" },
  { id: "c9", alumnoId: "a4", alumnoNombre: "Emiliano Gómez Ruiz", docenteId: "d1", asignatura: "Administración", periodo: "2026-1", calificacion: 9.3, tipoEvaluacion: "ordinario", observaciones: "", fecha: "2026-03-14" },
  { id: "c10", alumnoId: "a6", alumnoNombre: "Valeria Cruz Montes", docenteId: "d2", asignatura: "Base de Datos", periodo: "2026-1", calificacion: 8.8, tipoEvaluacion: "ordinario", observaciones: "", fecha: "2026-03-15" },
];

// ─── Incidencias ──────────────────────────────────────────────────────────────
export const INCIDENCIAS: Incidencia[] = [
  { id: "i1", alumnoId: "a1", alumnoNombre: "Kevin Abraham", registradoPor: "t1", fecha: "2026-03-10", tipoIncidencia: "Académica", descripcion: "No presentó 3 trabajos consecutivos en Cálculo Diferencial.", estatus: "en_proceso", resolucion: "" },
  { id: "i2", alumnoId: "a3", alumnoNombre: "Roman Darío Pérez Salas", registradoPor: "t1", fecha: "2026-03-08", tipoIncidencia: "Asistencia", descripcion: "5 faltas injustificadas consecutivas.", estatus: "abierta", resolucion: "" },
  { id: "i3", alumnoId: "a7", alumnoNombre: "Luis Ángel Ponce Villa", registradoPor: "d1", fecha: "2026-02-28", tipoIncidencia: "Disciplinaria", descripcion: "Comportamiento disruptivo en clase de laboratorio.", estatus: "cerrada", resolucion: "Se habló con el alumno y firmó carta compromiso." },
  { id: "i4", alumnoId: "a5", alumnoNombre: "Vladimir Cortez Silva", registradoPor: "t1", fecha: "2026-03-15", tipoIncidencia: "Académica", descripcion: "Bajo rendimiento en evaluación parcial.", estatus: "abierta", resolucion: "" },
];

// ─── Canalizaciones ──────────────────────────────────────────────────────────
export const CANALIZACIONES: Canalizacion[] = [
  { id: "cn1", alumnoId: "a3", alumnoNombre: "Roman Darío Pérez Salas", tutorId: "t1", sesionId: "s2", tipoServicio: "trabajo_social", fechaCanalizacion: "2026-03-19", motivo: "Situación familiar compleja que afecta rendimiento académico.", estatus: "en_atencion", seguimiento: "Primera cita atendida el 21 de marzo." },
  { id: "cn2", alumnoId: "a1", alumnoNombre: "Kevin Abraham", tutorId: "t1", sesionId: "s1", tipoServicio: "psicologia", fechaCanalizacion: "2026-03-20", motivo: "Ansiedad ante exámenes y baja autoestima académica.", estatus: "pendiente", seguimiento: "" },
  { id: "cn3", alumnoId: "a7", alumnoNombre: "Luis Ángel Ponce Villa", tutorId: "t1", sesionId: null, tipoServicio: "medico", fechaCanalizacion: "2026-02-15", motivo: "Dolores de cabeza frecuentes que afectan concentración.", estatus: "concluida", seguimiento: "Se diagnosticó problema de visión. Se canalizó a oftalmólogo." },
];

// ─── Documentos ──────────────────────────────────────────────────────────────
export const DOCUMENTOS: Documento[] = [
  { id: "doc1", alumnoId: "a1", alumnoNombre: "Kevin Abraham", sesionId: null, tipoDocumento: "kardex", nombreArchivo: "kardex_kevin_2026.pdf", nivelPrivacidad: "visible", subidoPor: "admin", mimeType: "application/pdf", tamanoBytes: 245000, fecha: "2026-01-10" },
  { id: "doc2", alumnoId: "a1", alumnoNombre: "Kevin Abraham", sesionId: "s1", tipoDocumento: "plan_accion", nombreArchivo: "plan_accion_kevin_mar2026.pdf", nivelPrivacidad: "visible", subidoPor: "t1", mimeType: "application/pdf", tamanoBytes: 128000, fecha: "2026-03-20" },
  { id: "doc3", alumnoId: "a2", alumnoNombre: "Axel Eduardo García Torres", sesionId: null, tipoDocumento: "constancia", nombreArchivo: "constancia_inscripcion_axel.pdf", nivelPrivacidad: "visible", subidoPor: "admin", mimeType: "application/pdf", tamanoBytes: 95000, fecha: "2026-01-15" },
  { id: "doc4", alumnoId: "a2", alumnoNombre: "Axel Eduardo García Torres", sesionId: null, tipoDocumento: "kardex", nombreArchivo: "kardex_axel_2026.pdf", nivelPrivacidad: "visible", subidoPor: "admin", mimeType: "application/pdf", tamanoBytes: 230000, fecha: "2026-01-15" },
  { id: "doc5", alumnoId: "a3", alumnoNombre: "Roman Darío Pérez Salas", sesionId: "s2", tipoDocumento: "constancia", nombreArchivo: "justificante_medico_roman.pdf", nivelPrivacidad: "oculto", subidoPor: "t1", mimeType: "application/pdf", tamanoBytes: 180000, fecha: "2026-03-19" },
  { id: "doc6", alumnoId: "a3", alumnoNombre: "Roman Darío Pérez Salas", sesionId: null, tipoDocumento: "kardex", nombreArchivo: "kardex_roman_2026.pdf", nivelPrivacidad: "visible", subidoPor: "admin", mimeType: "application/pdf", tamanoBytes: 210000, fecha: "2026-01-10" },
];

// ─── Audit Log ───────────────────────────────────────────────────────────────
export const AUDIT_LOG: AuditEvent[] = [
  { id: "au1", userId: "admin1", userName: "Admin General", rolActivo: "rol_administrador", evento: "login", tablaAfectada: "", registroId: "", ipAddress: "192.168.1.100", metadata: {}, createdAt: "2026-03-20T08:00:00Z" },
  { id: "au2", userId: "t1", userName: "Dra. María Rodríguez", rolActivo: "rol_tutor", evento: "write", tablaAfectada: "sesiones_tutoria", registroId: "s1", ipAddress: "192.168.1.45", metadata: { accion: "crear_sesion" }, createdAt: "2026-03-20T10:15:00Z" },
  { id: "au3", userId: "t1", userName: "Dra. María Rodríguez", rolActivo: "rol_tutor", evento: "write", tablaAfectada: "canalizaciones", registroId: "cn2", ipAddress: "192.168.1.45", metadata: { accion: "crear_canalizacion" }, createdAt: "2026-03-20T11:00:00Z" },
  { id: "au4", userId: "d1", userName: "Mtro. José A. Pérez", rolActivo: "rol_docente", evento: "write", tablaAfectada: "calificaciones", registroId: "c1", ipAddress: "192.168.1.72", metadata: { accion: "registrar_calificacion" }, createdAt: "2026-03-15T14:30:00Z" },
  { id: "au5", userId: "a2", userName: "Axel Eduardo García", rolActivo: "rol_alumno", evento: "login", tablaAfectada: "", registroId: "", ipAddress: "10.0.0.25", metadata: {}, createdAt: "2026-03-18T09:00:00Z" },
  { id: "au6", userId: "admin1", userName: "Admin General", rolActivo: "rol_administrador", evento: "write", tablaAfectada: "alumnos", registroId: "a9", ipAddress: "192.168.1.100", metadata: { accion: "crear_alumno" }, createdAt: "2026-03-10T10:00:00Z" },
  { id: "au7", userId: "t1", userName: "Dra. María Rodríguez", rolActivo: "rol_tutor", evento: "write", tablaAfectada: "sesiones_tutoria", registroId: "s2", ipAddress: "192.168.1.45", metadata: { accion: "crear_sesion" }, createdAt: "2026-03-19T12:50:00Z" },
  { id: "au8", userId: "admin1", userName: "Admin General", rolActivo: "rol_administrador", evento: "access_denied", tablaAfectada: "audit_log", registroId: "", ipAddress: "192.168.1.200", metadata: { intento: "delete" }, createdAt: "2026-03-19T15:00:00Z" },
];

// ─── Notificaciones ──────────────────────────────────────────────────────────
export const NOTIFICACIONES: Notificacion[] = [
  { id: "n1", userId: "t1", tipo: "riesgo_alto", titulo: "Alumno en riesgo alto", mensaje: "Kevin Abraham ha sido clasificado como riesgo alto.", leida: false, urlAccion: "/dashboard/tutor/alumnos", createdAt: "2026-03-20T10:00:00Z" },
  { id: "n2", userId: "t1", tipo: "sesion_proxima", titulo: "Sesión programada mañana", mensaje: "Tienes una sesión con Kevin Abraham mañana a las 10:00.", leida: true, urlAccion: "/dashboard/tutor/sesiones", createdAt: "2026-03-24T18:00:00Z" },
  { id: "n3", userId: "a1", tipo: "canalizacion_pendiente", titulo: "Canalización a Psicología", mensaje: "Has sido canalizado al servicio de Psicología.", leida: false, urlAccion: "/dashboard/alumno/sesiones", createdAt: "2026-03-20T11:00:00Z" },
];

// ─── Planes de acción ────────────────────────────────────────────────────────
export const PLANES_ACCION: PlanAccion[] = [
  {
    id: "pa1", alumnoId: "a1", alumnoNombre: "Kevin Abraham", tutorId: "t1", periodo: "2026-1",
    objetivoGeneral: "Mejorar rendimiento en materias de ciencias exactas y reducir nivel de riesgo.",
    metas: [
      { descripcion: "Asistir a asesorías de cálculo 2 veces/semana", fechaLimite: "2026-04-30", lograda: false },
      { descripcion: "Entregar todos los trabajos pendientes de cálculo", fechaLimite: "2026-04-15", lograda: false },
      { descripcion: "Obtener calificación ≥ 7 en segundo parcial", fechaLimite: "2026-05-15", lograda: false },
    ],
    estatus: "activo", fechaInicio: "2026-03-20", fechaRevision: "2026-04-20",
  },
  {
    id: "pa2", alumnoId: "a3", alumnoNombre: "Roman Darío Pérez Salas", tutorId: "t1", periodo: "2026-1",
    objetivoGeneral: "Regularizar asistencia y resolver situación familiar con apoyo institucional.",
    metas: [
      { descripcion: "Asistencia mínima del 80% durante abril", fechaLimite: "2026-04-30", lograda: false },
      { descripcion: "Completar proceso con Trabajo Social", fechaLimite: "2026-04-15", lograda: false },
      { descripcion: "Presentar justificantes de faltas anteriores", fechaLimite: "2026-03-30", lograda: true },
    ],
    estatus: "activo", fechaInicio: "2026-03-19", fechaRevision: "2026-04-19",
  },
];

// ─── Disponibilidad tutor ────────────────────────────────────────────────────
export const DISPONIBILIDAD_TUTOR: DisponibilidadTutor[] = [
  { id: "dt1", tutorId: "t1", diaSemana: 1, horaInicio: "09:00", horaFin: "11:00", activa: true },
  { id: "dt2", tutorId: "t1", diaSemana: 1, horaInicio: "14:00", horaFin: "16:00", activa: true },
  { id: "dt3", tutorId: "t1", diaSemana: 3, horaInicio: "10:00", horaFin: "12:00", activa: true },
  { id: "dt4", tutorId: "t1", diaSemana: 5, horaInicio: "09:00", horaFin: "11:00", activa: true },
  { id: "dt5", tutorId: "t2", diaSemana: 2, horaInicio: "08:00", horaFin: "10:00", activa: true },
  { id: "dt6", tutorId: "t2", diaSemana: 4, horaInicio: "14:00", horaFin: "16:00", activa: true },
];

// ─── Respaldos ───────────────────────────────────────────────────────────────
export const RESPALDOS: Respaldo[] = [
  { id: "bk1", fecha: "2026-03-20T02:00:00Z", tipo: "automatico", tamano: "245 MB", estado: "completado", ejecutadoPor: "Sistema" },
  { id: "bk2", fecha: "2026-03-19T02:00:00Z", tipo: "automatico", tamano: "243 MB", estado: "completado", ejecutadoPor: "Sistema" },
  { id: "bk3", fecha: "2026-03-18T02:00:00Z", tipo: "automatico", tamano: "241 MB", estado: "completado", ejecutadoPor: "Sistema" },
  { id: "bk4", fecha: "2026-03-17T14:30:00Z", tipo: "manual", tamano: "240 MB", estado: "completado", ejecutadoPor: "Admin General" },
  { id: "bk5", fecha: "2026-03-17T02:00:00Z", tipo: "automatico", tamano: "239 MB", estado: "fallido", ejecutadoPor: "Sistema" },
];

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
