"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  function isValidEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email) { setError("Ingresa tu correo institucional"); return; }
    if (!isValidEmail(email)) { setError("Formato de correo inválido"); return; }

    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer-contrasena`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    // Supabase siempre responde éxito por seguridad (no revela si existe el correo)
    setEnviado(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f151c] px-4 py-10">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[600px] w-[600px] rounded-full bg-emerald-600/5 blur-[140px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 shadow-xl shadow-emerald-500/30">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Recuperar Contraseña</h1>
            <p className="mt-1 text-sm text-white/45">Ingresa tu correo para recibir instrucciones</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-[#151c24]/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {!enviado ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Instrucciones */}
              <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-4 py-3">
                <p className="text-xs text-sky-300/80">
                  Se enviará un enlace de restablecimiento a tu correo institucional. El enlace expira en 30 minutos.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/8 px-4 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="recover-email" className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Correo institucional
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                  <input
                    id="recover-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="correo@utnay.edu.mx"
                    className={`w-full rounded-xl border bg-white/4 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 ${
                      error ? "border-red-500/40" : "border-white/8"
                    }`}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Enviar instrucciones <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success state */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600/15">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">¡Correo enviado!</p>
                <p className="mt-1 text-sm text-white/50">
                  Si existe una cuenta con ese correo, recibirás las instrucciones en:
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-400">{email}</p>
              </div>
              <div className="w-full rounded-lg border border-white/6 bg-white/3 px-4 py-3">
                <p className="text-xs text-white/40">
                  Revisa tu bandeja de entrada y sigue las instrucciones del correo. Si no lo encuentras, revisa la carpeta de spam. El enlace expira en <span className="font-semibold text-white/60">30 minutos</span>.
                </p>
              </div>
              <button
                onClick={() => { setEnviado(false); setEmail(""); }}
                className="mt-2 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                ¿No recibiste el correo? Reenviar
              </button>
            </div>
          )}
        </div>

        {/* Back to login */}
        <Link
          href="/login"
          className="group flex items-center justify-center gap-2 text-sm text-white/30 transition-colors hover:text-white/60"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
