"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { login, isValidEmail, isValidPassword, DEMO_USERS, getRolLabel } from "@/app/_lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email) e.email = "El correo es requerido";
    else if (!isValidEmail(email)) e.email = "Formato de correo inválido";
    if (!password) e.password = "La contraseña es requerida";
    else if (!isValidPassword(password)) e.password = "Mínimo 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    // Simulated delay
    setTimeout(() => {
      const result = login(email, password);
      if (result.success && result.user) {
        router.push(result.user.dashboardPath);
      } else {
        setError(result.error ?? "Error desconocido");
        setLoading(false);
      }
    }, 600);
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
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Iniciar Sesión</h1>
            <p className="mt-1 text-sm text-white/45">Sistema de Tutorías Académicas · UTNay</p>
          </div>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-white/8 bg-[#151c24]/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Error global */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/8 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Correo institucional
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="correo@utnay.edu.mx"
                  className={`w-full rounded-xl border bg-white/4 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 ${
                    errors.email ? "border-red-500/40" : "border-white/8"
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-white/4 py-2.5 pl-10 pr-11 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 ${
                    errors.password ? "border-red-500/40" : "border-white/8"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
              <div className="flex justify-end">
                <Link
                  href="/recuperar-contrasena"
                  className="text-xs font-medium text-emerald-400/70 transition-colors hover:text-emerald-400"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
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
                  Acceder <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/6" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20">Demo</span>
            <div className="h-px flex-1 bg-white/6" />
          </div>

          {/* Demo credentials toggle */}
          <button
            onClick={() => setShowCredentials(!showCredentials)}
            className="w-full rounded-lg border border-white/6 bg-white/3 px-4 py-2.5 text-xs font-medium text-white/50 transition-colors hover:bg-white/6 hover:text-white/70"
          >
            {showCredentials ? "Ocultar credenciales demo" : "Ver credenciales demo"}
          </button>

          {showCredentials && (
            <div className="mt-3 flex flex-col gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.password); setErrors({}); setError(""); }}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/2 px-3 py-2.5 text-left transition-colors hover:border-emerald-500/20 hover:bg-emerald-600/5"
                >
                  <div>
                    <p className="text-xs font-semibold text-white/80">{u.nombre}</p>
                    <p className="text-[11px] text-white/35">{u.email}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/40">
                    {getRolLabel(u.role)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Back to home */}
        <Link
          href="/"
          className="group flex items-center justify-center gap-2 text-sm text-white/30 transition-colors hover:text-white/60"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
