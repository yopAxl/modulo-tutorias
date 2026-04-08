"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createUserAction } from "../actions";

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Eye, EyeOff, User, Mail, Lock, Hash, Phone, GraduationCap, Users, Calendar, TrendingUp, Building, Award } from "lucide-react";

interface CreateUserModalProps {
  onSuccess?: () => void;
}

export function CreateUserModal({ onSuccess }: CreateUserModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>("alumno");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [promedio, setPromedio] = useState<string>("0");

  const derivedRiesgo = useMemo(() => {
    const p = parseFloat(promedio) || 0;
    if (p < 8.7) return "alto";
    if (p >= 8.7 && p <= 9.3) return "medio";
    return "bajo";
  }, [promedio]);

  async function onSubmit(formData: FormData) {
    const e: Record<string, string> = {};
    const nombre_completo = formData.get("nombre_completo") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    if (!nombre_completo) e.nombre_completo = "El nombre es requerido";
    if (!email) e.email = "El correo es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Formato de correo inválido";
    if (!password) e.password = "La contraseña es requerida";
    else if (password.length < 6) e.password = "Mínimo 6 caracteres";
    
    if (role === "alumno") {
      if (!formData.get("matricula")) e.matricula = "La matrícula es requerida";
      if (!formData.get("correo_institucional")) e.correo_institucional = "El correo institucional es requerido";
      if (!formData.get("carrera")) e.carrera = "La carrera es requerida";
      if (!formData.get("grupo")) e.grupo = "El grupo es requerido";
      if (!formData.get("cuatrimestre")) e.cuatrimestre = "El cuatrimestre es requerido";
    } else {
      if (!formData.get("departamento")) e.departamento = "El departamento es requerido";
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    formData.append("role", role);
    if (role === "alumno") {
      formData.append("riesgo_academico", derivedRiesgo);
    }

    const result = await createUserAction(formData);

    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Usuario creado exitosamente.");
      setOpen(false);
      setErrors({});
      if (onSuccess) onSuccess();
      router.refresh();
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-2 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-colors">
        <Plus className="h-4 w-4" /> Nuevo usuario
      </Button>

      <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setErrors({}); }}>
        <DialogContent className="border border-white/5 bg-[#0f151c] text-white sm:max-w-3xl p-0 overflow-hidden shadow-2xl shadow-emerald-900/10 sm:rounded-2xl outline-none ring-0">
        <div className="overflow-y-auto max-h-[85vh] p-6 md:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">Crear Nuevo Usuario</DialogTitle>
          <DialogDescription className="text-white/50 text-sm mt-1">
            Sistema de registro administrativo. Ingresa los datos solicitados para generar un nuevo perfil operativo en el sistema de tutorías.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-8 mt-2">
          {/* SECCIÓN BASE */}
          <div className="rounded-xl border border-white/5 bg-[#151c24] p-5 md:p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-xs">1</span>
              Datos Básicos de Acceso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-1.5 flex flex-col">
                <Label htmlFor="nombre_completo" className="text-xs font-semibold uppercase tracking-wider text-white/40">Nombre Completo</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                  <Input id="nombre_completo" name="nombre_completo" className={`h-11 rounded-xl border bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40 ${errors.nombre_completo ? "border-red-500/40" : "border-white/8"}`} placeholder="Ej. Juan Pérez" />
                </div>
                {errors.nombre_completo && <span className="text-xs text-red-400">{errors.nombre_completo}</span>}
              </div>
              <div className="space-y-1.5 flex flex-col">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-white/40">Correo Electrónico (Login)</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                  <Input id="email" name="email" type="email" className={`h-11 rounded-xl border bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40 ${errors.email ? "border-red-500/40" : "border-white/8"}`} placeholder="juan@ejemplo.com" />
                </div>
                {errors.email && <span className="text-xs text-red-400">{errors.email}</span>}
              </div>
              <div className="space-y-1.5 flex flex-col">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-white/40">Contraseña Temporal</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} className={`w-full h-11 rounded-xl border bg-white/4 pl-10 pr-11 text-sm text-white placeholder:text-white/20 transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40 ${errors.password ? "border-red-500/40" : "border-white/8"}`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <span className="text-xs text-red-400">{errors.password}</span>}
              </div>
              <div className="space-y-1.5 flex flex-col">
                <Label className="text-xs font-semibold uppercase tracking-wider text-white/40">Rol del Usuario</Label>
                <Select value={role} onValueChange={(val) => val && setRole(val)}>
                  <SelectTrigger className="h-11 rounded-xl border border-white/8 bg-white/4 text-sm text-white focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/40">
                    <SelectValue placeholder="Seleccione rol" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151c24] border-white/10 text-white">
                    <SelectItem value="alumno">Alumno</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="docente">Docente</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* CAMPOS ESPECÍFICOS: ALUMNO */}
          {role === "alumno" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-xl border border-emerald-500/10 bg-emerald-950/10 p-5 md:p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-xs">2</span>
                Expediente del Alumno
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                <div className="space-y-1.5 flex flex-col">
                  <Label htmlFor="matricula" className="text-xs font-semibold uppercase tracking-wider text-white/40">Matrícula</Label>
                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <Input id="matricula" name="matricula" className={`h-11 rounded-xl border bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40 ${errors.matricula ? "border-red-500/40" : "border-white/8"}`} placeholder="Ej. 19001234" />
                  </div>
                  {errors.matricula && <span className="text-xs text-red-400">{errors.matricula}</span>}
                </div>
                <div className="space-y-1.5 md:col-span-2 flex flex-col">
                  <Label htmlFor="correo_institucional" className="text-xs font-semibold uppercase tracking-wider text-white/40">Correo Institucional</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <Input id="correo_institucional" name="correo_institucional" type="email" className={`h-11 rounded-xl border bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40 ${errors.correo_institucional ? "border-red-500/40" : "border-white/8"}`} placeholder="al19001234@utc.edu.mx" />
                  </div>
                  {errors.correo_institucional && <span className="text-xs text-red-400">{errors.correo_institucional}</span>}
                </div>
                
                <div className="space-y-1.5 flex flex-col">
                  <Label htmlFor="telefono" className="text-xs font-semibold uppercase tracking-wider text-white/40">Teléfono</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <Input id="telefono" name="telefono" className="h-11 rounded-xl border border-white/8 bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40" placeholder="10 dígitos" />
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <Label htmlFor="genero" className="text-xs font-semibold uppercase tracking-wider text-white/40">Género</Label>
                  <Select name="genero" defaultValue="M">
                    <SelectTrigger className="h-11 rounded-xl border border-white/8 bg-white/4 text-sm text-white focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/40">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151c24] border-white/10 text-white">
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="X">Otro/Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <Label htmlFor="carrera" className="text-xs font-semibold uppercase tracking-wider text-white/40">Carrera</Label>
                  <div className="relative">
                    <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <Input id="carrera" name="carrera" className={`h-11 rounded-xl border bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40 ${errors.carrera ? "border-red-500/40" : "border-white/8"}`} placeholder="Ej. IDGS" />
                  </div>
                  {errors.carrera && <span className="text-xs text-red-400">{errors.carrera}</span>}
                </div>
                
                <div className="space-y-1.5 flex flex-col">
                  <Label htmlFor="grupo" className="text-xs font-semibold uppercase tracking-wider text-white/40">Grupo</Label>
                  <div className="relative">
                    <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <Input id="grupo" name="grupo" className={`h-11 rounded-xl border bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40 ${errors.grupo ? "border-red-500/40" : "border-white/8"}`} placeholder="Ej. A" />
                  </div>
                  {errors.grupo && <span className="text-xs text-red-400">{errors.grupo}</span>}
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <Label htmlFor="cuatrimestre" className="text-xs font-semibold uppercase tracking-wider text-white/40">Cuatrimestre</Label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <Input id="cuatrimestre" name="cuatrimestre" type="number" min={1} max={12} className={`h-11 rounded-xl border bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40 ${errors.cuatrimestre ? "border-red-500/40" : "border-white/8"}`} placeholder="1" />
                  </div>
                  {errors.cuatrimestre && <span className="text-xs text-red-400">{errors.cuatrimestre}</span>}
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <Label htmlFor="promedio_general" className="text-xs font-semibold uppercase tracking-wider text-white/40">Promedio General</Label>
                  <div className="relative">
                    <TrendingUp className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <Input 
                      id="promedio_general" 
                      name="promedio_general" 
                      type="number" 
                      step="0.1" 
                      min={0} 
                      max={10} 
                      value={promedio}
                      onChange={(e) => setPromedio(e.target.value)}
                      className="h-11 rounded-xl border border-white/8 bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40" 
                      placeholder="0.0 - 10.0" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-3 flex flex-col">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">Nivel de Riesgo Académico (Asignado Automáticamente)</Label>
                  <div className="flex items-center gap-4">
                    {derivedRiesgo === "bajo" && (
                       <span className="inline-flex items-center rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 border border-emerald-500/20">
                         Riesgo Bajo (9.4 - 10.0)
                       </span>
                    )}
                    {derivedRiesgo === "medio" && (
                       <span className="inline-flex items-center rounded-xl bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 border border-amber-500/20">
                         Riesgo Medio (8.7 - 9.3)
                       </span>
                    )}
                    {derivedRiesgo === "alto" && (
                       <span className="inline-flex items-center rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 border border-red-500/20">
                         Alto Riesgo / Crítico {`<`} 8.7
                       </span>
                    )}
                    <span className="text-xs text-white/30 italic max-w-sm">Calculado en base a la métrica escolar oficial de aprobación mínima (8.0).</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CAMPOS ESPECÍFICOS: DOCENTE / TUTOR */}
          {(role === "docente" || role === "tutor") && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-xl border border-emerald-500/10 bg-emerald-950/10 p-5 md:p-6 shadow-sm">
               <h3 className="text-sm font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                 <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-xs">2</span>
                 Perfil {role === 'tutor' ? 'Tutor' : 'Docente'} Académico
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                 <div className="space-y-1.5 flex flex-col">
                  <Label htmlFor="departamento" className="text-xs font-semibold uppercase tracking-wider text-white/40">Departamento / Área</Label>
                  <div className="relative">
                    <Building className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <Input id="departamento" name="departamento" className={`h-11 rounded-xl border bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40 ${errors.departamento ? "border-red-500/40" : "border-white/8"}`} placeholder="Ej. Sistemas y Computación" />
                  </div>
                  {errors.departamento && <span className="text-xs text-red-400">{errors.departamento}</span>}
                 </div>
                 {role === "tutor" && (
                   <div className="space-y-1.5 flex flex-col">
                    <Label htmlFor="especialidad" className="text-xs font-semibold uppercase tracking-wider text-white/40">Especialidad Académica</Label>
                    <div className="relative">
                      <Award className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                      <Input id="especialidad" name="especialidad" className="h-11 rounded-xl border border-white/8 bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40" placeholder="Ej. Desarrollo Web" />
                    </div>
                   </div>
                 )}
               </div>
            </div>
          )}

          <div className="pt-6 mt-8 border-t border-white/10 flex items-center justify-end gap-3 pb-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-10 px-5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="h-10 px-6 font-semibold bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 rounded-xl hover:bg-emerald-500 transition-all">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />
              ) : null}
              {loading ? "Registrando usuario..." : "Confirmar y Crear Usuario"}
            </Button>
          </div>
        </form>
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
