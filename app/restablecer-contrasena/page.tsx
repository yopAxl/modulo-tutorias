"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export default function RestablecerContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  // Password strength
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const strength = Object.values(checks).filter(Boolean).length;

  function validate() {
    const e: typeof errors = {};
    if (!password) e.password = "La contraseña es requerida";
    else if (password.length < 8) e.password = "Mínimo 8 caracteres";
    else if (strength < 3) e.password = "La contraseña es muy débil";
    if (!confirmPassword) e.confirm = "Confirma tu contraseña";
    else if (password !== confirmPassword) e.confirm = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);

    // ── Mock: Aquí iría supabase.auth.updateUser({ password }) ──
    // En producción con Supabase:
    // const { error } = await supabase.auth.updateUser({ password });
    // if (error) { setError(error.message); setLoading(false); return; }

    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      // Redirect to login after 3s
      setTimeout(() => router.push("/login"), 3000);
    }, 1000);
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
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {success ? "¡Contraseña actualizada!" : "Nueva Contraseña"}
            </h1>
            <p className="mt-1 text-sm text-white/45">
              {success ? "Ya puedes iniciar sesión con tu nueva contraseña" : "Crea una contraseña segura para tu cuenta"}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/8 bg-[#151c24]/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {!success ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/8 px-4 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
              )}

              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-password" className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Mínimo 8 caracteres"
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

                {/* Strength indicator */}
                {password.length > 0 && (
                  <div className="mt-1 flex flex-col gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= strength
                              ? strength <= 2 ? "bg-red-500" : strength <= 3 ? "bg-amber-500" : "bg-emerald-500"
                              : "bg-white/8"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[10px] font-semibold ${
                      strength <= 2 ? "text-red-400" : strength <= 3 ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {strength <= 2 ? "Débil" : strength <= 3 ? "Media" : strength <= 4 ? "Fuerte" : "Muy fuerte"}
                    </p>
                    <div className="flex flex-col gap-1">
                      {([
                        [checks.length, "Mínimo 8 caracteres"],
                        [checks.upper, "Una letra mayúscula"],
                        [checks.lower, "Una letra minúscula"],
                        [checks.number, "Un número"],
                        [checks.special, "Un carácter especial (!@#$...)"],
                      ] as [boolean, string][]).map(([ok, text]) => (
                        <div key={text} className="flex items-center gap-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-white/15"}`} />
                          <span className={`text-[10px] ${ok ? "text-emerald-400/80" : "text-white/25"}`}>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    placeholder="Repite tu contraseña"
                    className={`w-full rounded-xl border bg-white/4 py-2.5 pl-10 pr-11 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 ${
                      errors.confirm ? "border-red-500/40" : "border-white/8"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirm && <p className="text-xs text-red-400">{errors.confirm}</p>}
                {confirmPassword && password === confirmPassword && (
                  <p className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Las contraseñas coinciden
                  </p>
                )}
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
                    <ShieldCheck className="h-4 w-4" /> Actualizar contraseña
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Success */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600/15">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">¡Listo!</p>
                <p className="mt-1 text-sm text-white/50">
                  Tu contraseña ha sido actualizada correctamente.
                </p>
              </div>
              <div className="w-full rounded-lg border border-emerald-500/15 bg-emerald-600/5 px-4 py-3">
                <p className="text-xs text-emerald-300/70">
                  Serás redirigido al inicio de sesión en unos segundos...
                </p>
              </div>
              <Link
                href="/login"
                className="text-sm font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
              >
                Ir al inicio de sesión ahora
              </Link>
            </div>
          )}
        </div>

        {/* Back to login */}
        {!success && (
          <Link
            href="/login"
            className="group flex items-center justify-center gap-2 text-sm text-white/30 transition-colors hover:text-white/60"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Volver al inicio de sesión
          </Link>
        )}
      </div>
    </div>
  );
}
