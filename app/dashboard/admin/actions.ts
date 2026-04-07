"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeText, sanitizeEmail, sanitizePhone, sanitizeAlphanumeric } from "@/lib/sanitize";

export async function createUserAction(formData: FormData) {
  try {
    const email = sanitizeEmail(formData.get("email") as string);
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const nombre_completo = sanitizeText(formData.get("nombre_completo") as string);

    if (!email || !password || !role || !nombre_completo) {
      return { error: "Faltan campos obligatorios base." };
    }

    const supabaseAdmin = createAdminClient();

    // 1. Crear el usuario en auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        app_role: role,
        nombre_completo,
      },
    });

    if (authError || !authData.user) {
      console.error("Auth Error:", authError);
      return { error: `Error creando el usuario: ${authError?.message || "Desconocido"}` };
    }

    const userId = authData.user.id;

    // 2. Insertar en la tabla correspondiente según el rol
    if (role === "administrador") {
      const { error } = await supabaseAdmin.schema('tutorias').from("administradores").insert([
        {
          user_id: userId,
          nombre_completo,
          activo: true,
        },
      ]);
      if (error) throw error;
    } else if (role === "docente") {
      const departamento = sanitizeText(formData.get("departamento") as string);
      const { error } = await supabaseAdmin.schema('tutorias').from("docentes").insert([
        {
          user_id: userId,
          nombre_completo,
          departamento: departamento || "No asignado",
          activo: true,
        },
      ]);
      if (error) throw error;
    } else if (role === "tutor") {
      const departamento = sanitizeText(formData.get("departamento") as string);
      const especialidad = sanitizeText(formData.get("especialidad") as string);
      const { error } = await supabaseAdmin.schema('tutorias').from("tutores").insert([
        {
          user_id: userId,
          nombre_completo,
          departamento: departamento || "No asignado",
          especialidad: especialidad || "General",
          activo: true,
        },
      ]);
      if (error) throw error;
    } else if (role === "alumno") {
      const matricula = sanitizeAlphanumeric(formData.get("matricula") as string);
      const genero = formData.get("genero") as string;
      const telefono = sanitizePhone(formData.get("telefono") as string);
      const correo_institucional = sanitizeEmail(formData.get("correo_institucional") as string);
      const carrera = sanitizeText(formData.get("carrera") as string);
      const grupo = sanitizeText(formData.get("grupo") as string);
      const cuatrimestre = parseInt(formData.get("cuatrimestre") as string, 10);
      const promedio_general = parseFloat(formData.get("promedio_general") as string) || 0;
      const riesgo_academico = formData.get("riesgo_academico") as string;

      const { error } = await supabaseAdmin.schema('tutorias').from("alumnos").insert([
        {
          user_id: userId,
          matricula,
          nombre_completo,
          genero,
          telefono,
          correo_institucional,
          carrera,
          grupo,
          cuatrimestre,
          promedio_general,
          riesgo_academico,
          activo: true,
        },
      ]);

      if (error) {
         // Fallback: Delete auth user if profile creation fails?
         await supabaseAdmin.auth.admin.deleteUser(userId);
         throw error;
      }
    } else {
      return { error: "Rol no válido." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Action Error:", error);
    const msg = error.message || "Desconocido";
    // Si el error viene de nuestra propia sanitización o validación, lo mostramos limpio.
    if (msg.includes("Se han detectado") || msg.includes("formato") || msg.includes("teléfono") || msg.includes("inválido")) {
      return { error: msg };
    }
    return { error: `Ocurrió un error inesperado: ${msg}` };
  }
}
