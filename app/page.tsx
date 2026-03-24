import Link from "next/link";
import { GraduationCap, Settings, BookOpen, Backpack, ArrowRight } from "lucide-react";

const ROLES = [
  {
    href:  "/dashboard/tutor",
    icon:  GraduationCap,
    title: "Tutor",
    desc:  "Gestiona tus alumnos, registra sesiones y da seguimiento al riesgo académico.",
    iconBg:   "bg-emerald-600/15",
    iconColor:"text-emerald-400",
    border:   "hover:border-emerald-500/40",
    glow:     "hover:shadow-emerald-500/10",
    accent:   "bg-emerald-600",
    arrowColor: "text-emerald-400",
  },
  {
    href:  "/dashboard/admin",
    icon:  Settings,
    title: "Administrador",
    desc:  "Visión completa del sistema: padrón, carga de tutores y estadísticas globales.",
    iconBg:   "bg-amber-500/15",
    iconColor:"text-amber-400",
    border:   "hover:border-amber-500/40",
    glow:     "hover:shadow-amber-500/10",
    accent:   "bg-amber-500",
    arrowColor: "text-amber-400",
  },
  {
    href:  "/dashboard/docente",
    icon:  BookOpen,
    title: "Docente",
    desc:  "Consulta el avance de tu grupo, registra calificaciones e identifica alumnos en riesgo.",
    iconBg:   "bg-pink-500/15",
    iconColor:"text-pink-400",
    border:   "hover:border-pink-500/40",
    glow:     "hover:shadow-pink-500/10",
    accent:   "bg-pink-500",
    arrowColor: "text-pink-400",
  },
  {
    href:  "/dashboard/alumno",
    icon:  Backpack,
    title: "Alumno",
    desc:  "Revisa tu promedio, historial de tutorías, expediente y documentos académicos.",
    iconBg:   "bg-emerald-500/15",
    iconColor:"text-emerald-400",
    border:   "hover:border-emerald-500/40",
    glow:     "hover:shadow-emerald-500/10",
    accent:   "bg-emerald-500",
    arrowColor: "text-emerald-400",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-14 bg-[#0f151c] px-6 py-16">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-5 text-center">
        {/* Logo mark */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 shadow-xl shadow-emerald-500/30">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Sistema de Tutorías
          </h1>
          <p className="mx-auto max-w-md text-base text-white/50 leading-relaxed">
            Plataforma integral para el seguimiento académico y gestión de tutorías.
            Selecciona tu rol para continuar.
          </p>
        </div>

        {/* Demo badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-600/8 px-4 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
            Modo Demo · Datos ficticios
          </span>
        </div>
      </div>

      {/* ── Role cards ─────────────────────────────────────────── */}
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {ROLES.map((role) => {
          const Icon = role.icon;
          return (
            <Link
              key={role.href}
              href={role.href}
              className={`group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/6 bg-[#151c24] p-6 transition-all duration-200 ${role.border} hover:shadow-xl ${role.glow}`}
            >
              {/* top accent stripe */}
              <div className={`absolute inset-x-0 top-0 h-0.5 ${role.accent}`} />

              {/* icon */}
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${role.iconBg}`}>
                <Icon className={`h-5 w-5 ${role.iconColor}`} />
              </div>

              {/* text */}
              <div className="flex flex-col gap-1.5">
                <p className="text-base font-bold text-white">{role.title}</p>
                <p className="text-sm leading-relaxed text-white/45">{role.desc}</p>
              </div>

              {/* arrow */}
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${role.arrowColor} transition-all group-hover:gap-2.5`}>
                Acceder al panel
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <p className="text-xs text-white/20">
        Instituto Tecnológico · Sistema de Seguimiento Académico · MVP v0.1
      </p>
    </div>
  );
}
