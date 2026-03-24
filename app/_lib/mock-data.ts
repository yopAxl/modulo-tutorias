// ─── Mock Data ──────────────────────────────────────────────────────────────
// Datos estáticos que simulan la BD. Reemplazar con Supabase queries más adelante.

export type RiesgoNivel = "Bajo" | "Medio" | "Alto";

export interface Alumno {
  id: string;
  matricula: string;
  nombre: string;
  carrera: string;
  cuatrimestre: number;
  promedio: number;
  riesgo: RiesgoNivel;
  correo: string;
  telefono: string;
  tutorId: string;
  docenteId: string;
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
  urgencia: "Baja" | "Media" | "Alta";
  duracionMin: number;
}

export interface Tutor {
  id: string;
  nombre: string;
  correo: string;
  departamento: string;
  alumnosAsignados: number;
  sesionesEsteCorte: number;
}

export interface Docente {
  id: string;
  nombre: string;
  correo: string;
  materia: string;
  grupo: string;
}

// ─── Tutores ─────────────────────────────────────────────────────────────────
export const TUTORES: Tutor[] = [
  {
    id: "t1",
    nombre: "Dra. María Rodríguez López",
    correo: "m.rodriguez@utnay.edu.mx",
    departamento: "Desarrollo y Gestión de Software",
    alumnosAsignados: 12,
    sesionesEsteCorte: 28,
  },
  {
    id: "t2",
    nombre: "Mtro. Carlos Vargas Soto",
    correo: "c.vargas@utnay.edu.mx",
    departamento: "Administración",
    alumnosAsignados: 9,
    sesionesEsteCorte: 17,
  },
  {
    id: "t3",
    nombre: "Ing. Patricia Hernández",
    correo: "p.hernandez@utnay.edu.mx",
    departamento: "Desarrollo y Gestión de Software",
    alumnosAsignados: 11,
    sesionesEsteCorte: 22,
  },
];

// ─── Alumnos ──────────────────────────────────────────────────────────────────
export const ALUMNOS: Alumno[] = [
  {
    id: "a1",
    matricula: "UTN20001",
    nombre: "Kevin Abraham",
    carrera: "IDGS",
    cuatrimestre: 7,
    promedio: 7.2,
    riesgo: "Alto",
    correo: "kkevin@alumnos.utnay.edu.mx",
    telefono: "3111234567",
    tutorId: "t1",
    docenteId: "d1",
  },
  {
    id: "a2",
    matricula: "UTN20042",
    nombre: "Axel Eduardo García Torres",
    carrera: "IDGS",
    cuatrimestre: 7,
    promedio: 8.9,
    riesgo: "Bajo",
    correo: "agarcia@alumnos.utnay.edu.mx",
    telefono: "3119876543",
    tutorId: "t1",
    docenteId: "d1",
  },
  {
    id: "a3",
    matricula: "UTN20078",
    nombre: "Roman Darío Pérez Salas",
    carrera: "IDGS",
    cuatrimestre: 5,
    promedio: 6.8,
    riesgo: "Alto",
    correo: "rperez@alumnos.utnay.edu.mx",
    telefono: "3117651234",
    tutorId: "t1",
    docenteId: "d2",
  },
  {
    id: "a4",
    matricula: "LA21003",
    nombre: "Emiliano Gómez Ruiz",
    carrera: "LA",
    cuatrimestre: 4,
    promedio: 9.1,
    riesgo: "Bajo",
    correo: "egomez@alumnos.utnay.edu.mx",
    telefono: "3113216789",
    tutorId: "t1",
    docenteId: "d1",
  },
  {
    id: "a5",
    matricula: "UTN21015",
    nombre: "Vladimir Cortez Silva",
    carrera: "IDGS",
    cuatrimestre: 6,
    promedio: 7.8,
    riesgo: "Medio",
    correo: "vcortez@alumnos.utnay.edu.mx",
    telefono: "3116543210",
    tutorId: "t1",
    docenteId: "d2",
  },
  {
    id: "a6",
    matricula: "UTN21028",
    nombre: "Valeria Cruz Montes",
    carrera: "IDGS",
    cuatrimestre: 6,
    promedio: 8.3,
    riesgo: "Bajo",
    correo: "vcruz@alumnos.utnay.edu.mx",
    telefono: "3111239876",
    tutorId: "t1",
    docenteId: "d2",
  },
  {
    id: "a7",
    matricula: "UTN22004",
    nombre: "Luis Ángel Ponce Villa",
    carrera: "IDGS",
    cuatrimestre: 3,
    promedio: 6.5,
    riesgo: "Medio",
    correo: "laponce@alumnos.utnay.edu.mx",
    telefono: "3118765321",
    tutorId: "t1",
    docenteId: "d1",
  },
  {
    id: "a8",
    matricula: "LA22009",
    nombre: "Karen Ibarra Llanes",
    carrera: "LA",
    cuatrimestre: 2,
    promedio: 9.5,
    riesgo: "Bajo",
    correo: "kibarra@alumnos.utnay.edu.mx",
    telefono: "3111567890",
    tutorId: "t2",
    docenteId: "d1",
  },
];

// ─── Sesiones ─────────────────────────────────────────────────────────────────
export const SESIONES: Sesion[] = [
  {
    id: "s1",
    alumnoId: "a1",
    alumnoNombre: "Kevin Abraham",
    tutorId: "t1",
    fecha: "2026-03-20",
    horaInicio: "10:00",
    horaFin: "11:00",
    temas: ["Bajo rendimiento en cálculo", "Estrategias de estudio"],
    acuerdos: "Acudir a asesorías de matemáticas 2 veces por semana.",
    urgencia: "Alta",
    duracionMin: 60,
  },
  {
    id: "s2",
    alumnoId: "a3",
    alumnoNombre: "Roman Darío Pérez Salas",
    tutorId: "t1",
    fecha: "2026-03-19",
    horaInicio: "12:00",
    horaFin: "12:45",
    temas: ["Ausencias injustificadas", "Situación familiar"],
    acuerdos: "Canalización a trabajo social. Seguimiento en 2 semanas.",
    urgencia: "Alta",
    duracionMin: 45,
  },
  {
    id: "s3",
    alumnoId: "a5",
    alumnoNombre: "Vladimir Cortez Silva",
    tutorId: "t1",
    fecha: "2026-03-18",
    horaInicio: "09:00",
    horaFin: "09:30",
    temas: ["Revisión de avance académico", "Orientación vocacional"],
    acuerdos: "Entrega de reporte parcial para siguiente sesión.",
    urgencia: "Baja",
    duracionMin: 30,
  },
  {
    id: "s4",
    alumnoId: "a7",
    alumnoNombre: "Luis Ángel Ponce Villa",
    tutorId: "t1",
    fecha: "2026-03-15",
    horaInicio: "11:00",
    horaFin: "11:45",
    temas: ["Reprobación de materia", "Plan de recursamiento"],
    acuerdos: "Inscribir materia recursada en próximo cuatrimestre.",
    urgencia: "Media",
    duracionMin: 45,
  },
  {
    id: "s5",
    alumnoId: "a2",
    alumnoNombre: "Axel Eduardo García Torres",
    tutorId: "t1",
    fecha: "2026-03-12",
    horaInicio: "10:30",
    horaFin: "11:00",
    temas: ["Seguimiento general", "Solicitud de beca"],
    acuerdos: "Gestionar documentación para beca de excelencia.",
    urgencia: "Baja",
    duracionMin: 30,
  },
];

// ─── Próximas sesiones ────────────────────────────────────────────────────────
export const PROXIMAS_SESIONES = [
  { id: "p1", alumnoNombre: "Kevin Abraham", dia: "25", mes: "Mar", hora: "10:00 AM" },
  { id: "p2", alumnoNombre: "Roman Darío Pérez Salas", dia: "26", mes: "Mar", hora: "12:00 PM" },
  { id: "p3", alumnoNombre: "Luis Ángel Ponce Villa", dia: "28", mes: "Mar", hora: "09:00 AM" },
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

export function formatFecha(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export function gpaClass(promedio: number) {
  if (promedio >= 8.5) return "gpa-high";
  if (promedio >= 7.0) return "gpa-mid";
  return "gpa-low";
}
