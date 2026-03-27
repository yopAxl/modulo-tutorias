import Link from "next/link";
import { GraduationCap, ArrowLeft, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-[#0f151c] px-6 py-16">

      {/* ── Glowing background orb ──────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[500px] w-[500px] rounded-full bg-emerald-600/5 blur-[120px]" />
      </div>

      {/* ── Logo mark ───────────────────────────────────────────── */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 shadow-xl shadow-emerald-500/30">
        <GraduationCap className="h-8 w-8 text-white" />
      </div>

      {/* ── 404 content ─────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center gap-6 text-center">

        {/* Large 404 */}
        <div className="relative select-none">
          <span className="text-[8rem] font-black leading-none tracking-tighter text-white/5">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center gap-3">
            <MapPin className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-4xl font-extrabold tracking-tight text-white">
              Página no encontrada
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-24 bg-linear-to-r from-transparent via-white/15 to-transparent" />

        {/* Description */}
        <p className="max-w-sm text-sm leading-relaxed text-white/45">
          La ruta que buscas no existe o fue movida. Verifica la URL o regresa
          al inicio para seleccionar tu rol.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-600/10 px-6 py-3 text-sm font-semibold text-emerald-400 transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-600/20 hover:shadow-lg hover:shadow-emerald-500/10"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Volver al inicio
        </Link>
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <p className="text-xs text-white/20">
        Universidad Tecnológica de Nayarit · Sistema de Seguimiento Académico Enfocado a Tutorias · MVP v0.1
      </p>
    </div>
  );
}
