"use client";

import Link from "next/link";
import { GraduationCap, LogIn, ArrowRight } from "lucide-react";
import { useI18n } from "@/app/_i18n/context";

export default function HomePage() {
  const { t } = useI18n();

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
            {t("home.title")}
          </h1>
          <p className="mx-auto max-w-lg text-base text-white/50 leading-relaxed sm:text-lg">
            {t("home.description")}
          </p>
        </div>

        {/* Login button */}
        <Link
          href="/login"
          className="group inline-flex items-center gap-3 rounded-2xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-600/25 transition-all duration-200 hover:bg-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/30"
        >
          <LogIn className="h-5 w-5" />
          {t("home.login")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* ── Features ────────────────────────────────────────────── */}
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {(["tracking", "sessions", "reports"] as const).map((key) => (
          <div
            key={key}
            className="rounded-2xl border border-white/6 bg-[#151c24] p-6 text-center"
          >
            <p className="text-sm font-bold text-white/80">{t(`home.features.${key}.title`)}</p>
            <p className="mt-2 text-xs leading-relaxed text-white/35">{t(`home.features.${key}.desc`)}</p>
          </div>
        ))}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <p className="text-xs text-white/20">
        {t("brand.university")} · {t("brand.fullTitle")}
      </p>
    </div>
  );
}
