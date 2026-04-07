import Link from "next/link";
import { GraduationCap, LogIn, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-[#0f151c] px-6 py-16">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Logo mark */}
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-emerald-500 to-emerald-700 shadow-2xl shadow-emerald-500/30">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Sistema de Tutorías
          </h1>
          <p className="mx-auto max-w-lg text-base text-white/50 leading-relaxed sm:text-lg">
            Plataforma integral para el seguimiento académico y gestión de tutorías
            de la Universidad Tecnológica de Nayarit.
          </p>
        </div>

        {/* Login button */}
        <Link
          href="/login"
          className="group inline-flex items-center gap-3 rounded-2xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-600/25 transition-all duration-200 hover:bg-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/30"
        >
          <LogIn className="h-5 w-5" />
          Iniciar sesión
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* ── Features ────────────────────────────────────────────── */}
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { title: "Seguimiento", desc: "Monitoreo continuo del desempeño académico de cada alumno." },
          { title: "Sesiones", desc: "Registro digital de tutorías con formato oficial R07-M01-01." },
          { title: "Reportes", desc: "Estadísticas y reportes en tiempo real del sistema de tutorías." },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-white/6 bg-[#151c24] p-6 text-center"
          >
            <p className="text-sm font-bold text-white/80">{f.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-white/35">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <p className="text-xs text-white/20">
        Universidad Tecnológica de Nayarit · Sistema de Seguimiento Académico Enfocado a Tutorías
      </p>
    </div>
  );
}
