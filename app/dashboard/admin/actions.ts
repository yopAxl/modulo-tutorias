"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
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

    // 3. Registrar en el Log de Auditoría
    const supabaseUser = await createClient();
    await supabaseUser.rpc('registrar_audit', {
      p_evento: 'CREATE_USER',
      p_tabla: role === 'alumno' ? 'alumnos' : (role === 'docente' ? 'docentes' : (role === 'tutor' ? 'tutores' : 'administradores')),
      p_registro_id: userId,
      p_metadata: { 
        email, 
        role, 
        nombre: nombre_completo,
        creado_por_admin: true 
      }
    });

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

/**
 * Obtiene todos los usuarios de las 4 tablas de perfiles y los asocia con su email de auth.
 */
export async function getUsersAction() {
  try {
    const supabaseAdmin = createAdminClient();

    // 1. Obtener perfiles y asignaciones en paralelo
    const [adminsRes, tutoresRes, docentesRes, alumnosRes, assignmentsRes] = await Promise.all([
      supabaseAdmin.schema('tutorias').from("administradores").select("*"),
      supabaseAdmin.schema('tutorias').from("tutores").select("*"),
      supabaseAdmin.schema('tutorias').from("docentes").select("*"),
      supabaseAdmin.schema('tutorias').from("alumnos").select("*"),
      supabaseAdmin.schema('tutorias').from("asignaciones_tutor").select("tutor_id, alumno_id, tutores(nombre_completo)").eq("activa", true),
    ]);

    // 2. Obtener usuarios de Auth para tener los correos (Necesario si no se guardan en perfiles)
    // Nota: listUsers() tiene un limite por defecto de 50, ajustamos si es necesario.
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    const emailMap = new Map();
    if (!authError && authUsers) {
      authUsers.forEach(u => emailMap.set(u.id, u.email));
    }

    // 3. Normalizar y combinar
    const allUsers = [
      ...(adminsRes.data || []).map(u => ({
        id: u.id,
        nombre: u.nombre_completo,
        correo: emailMap.get(u.user_id) || "—",
        rol: "Administrador",
        activo: u.activo,
        departamento: "Administración"
      })),
      ...(tutoresRes.data || []).map(u => ({
        id: u.id,
        nombre: u.nombre_completo,
        correo: emailMap.get(u.user_id) || "—",
        rol: "Tutor",
        activo: u.activo,
        departamento: u.departamento
      })),
      ...(docentesRes.data || []).map(u => ({
        id: u.id,
        nombre: u.nombre_completo,
        correo: emailMap.get(u.user_id) || "—",
        rol: "Docente",
        activo: u.activo,
        departamento: u.departamento
      })),
      ...(alumnosRes.data || []).map(u => ({
        id: u.id,
        nombre: u.nombre_completo,
        correo: emailMap.get(u.user_id) || u.correo_institucional || "—",
        rol: "Alumno",
        activo: u.activo,
        departamento: u.carrera || "Estudiante"
      }))
    ];

    // Ordenar alfabéticamente por nombre
    allUsers.sort((a, b) => a.nombre.localeCompare(b.nombre));

    return { 
      data: {
        users: allUsers,
        assignments: assignmentsRes.data || []
      }
    };
  } catch (error: any) {
    console.error("Get Users Error:", error);
    return { error: "Error al recopilar la lista de usuarios." };
  }
}

/**
 * Obtiene las métricas reales para el Dashboard del Administrador.
 */
export async function getAdminDashboardStats() {
  try {
    const supabaseAdmin = createAdminClient();

    // 1. Obtener datos base en paralelo
    const [alumnosRes, tutoresRes, sesionesRes, asignacionesRes] = await Promise.all([
      supabaseAdmin.schema('tutorias').from("alumnos").select("*"),
      supabaseAdmin.schema('tutorias').from("tutores").select("*"),
      supabaseAdmin.schema('tutorias').from("sesiones_tutoria").select("*"),
      supabaseAdmin.schema('tutorias').from("asignaciones_tutor").select("*").eq('activa', true),
    ]);

    if (alumnosRes.error) throw alumnosRes.error;
    if (tutoresRes.error) throw tutoresRes.error;

    const alumnos = alumnosRes.data || [];
    const tutores = tutoresRes.data || [];
    const sesiones = sesionesRes.data || [];
    const asignaciones = asignacionesRes.data || [];

    // 2. Cálculos de KPIs
    const totalAlumnos = alumnos.length;
    const totalTutores = tutores.length;
    const totalSesiones = sesiones.length;
    const promedioGeneral = totalAlumnos > 0 
      ? (alumnos.reduce((sum, a) => sum + (parseFloat(a.promedio_general) || 0), 0) / totalAlumnos).toFixed(1)
      : "0.0";

    // 3. Distribución de Riesgo
    const riesgoAlto = alumnos.filter(a => a.riesgo_academico === 'alto').length;
    const riesgoMedio = alumnos.filter(a => a.riesgo_academico === 'medio').length;
    const riesgoBajo = alumnos.filter(a => a.riesgo_academico === 'bajo' || !a.riesgo_academico).length;

    // 4. Carga por Tutor (Mapeo)
    const tutorWorkload = tutores.map(t => {
      const assignedCount = asignaciones.filter(a => a.tutor_id === t.id).length;
      const sessionsCount = sesiones.filter(s => s.tutor_id === t.id).length;
      return {
        id: t.id,
        nombre: t.nombre_completo,
        departamento: t.departamento,
        alumnosAsignados: assignedCount,
        sesionesTotales: sessionsCount
      };
    });

    // 5. Últimos Alumnos (Top 5)
    const recentAlumnos = [...alumnos]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5)
      .map(a => {
        const asig = asignaciones.find(as => as.alumno_id === a.id);
        const tutor = tutores.find(t => t.id === asig?.tutor_id);
        return {
          id: a.id,
          nombre: a.nombre_completo,
          matricula: a.matricula,
          carrera: a.carrera,
          cuatrimestre: a.cuatrimestre,
          promedio: parseFloat(a.promedio_general) || 0,
          riesgo: a.riesgo_academico === 'alto' ? 'Alto' : (a.riesgo_academico === 'medio' ? 'Medio' : 'Bajo'),
          tutorNombre: tutor?.nombre_completo || "S/A",
          correo: a.correo_institucional
        };
      });

    return {
      data: {
        kpis: {
          totalAlumnos,
          totalTutores,
          totalSesiones,
          promedioGeneral
        },
        riesgo: {
          alto: riesgoAlto,
          medio: riesgoMedio,
          bajo: riesgoBajo
        },
        tutorWorkload,
        recentAlumnos
      }
    };
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return { error: "No se pudieron cargar las estadísticas del dashboard." };
  }
}

/**
 * Obtiene los datos detallados para la página de Gestión de Tutores.
 */
export async function getTutoresManagementData() {
  try {
    const supabaseAdmin = createAdminClient();

    // 1. Obtener datos base
    const [tutoresRes, alumnosRes, asignacionesRes, sesionesRes] = await Promise.all([
      supabaseAdmin.schema('tutorias').from("tutores").select("*"),
      supabaseAdmin.schema('tutorias').from("alumnos").select("*"),
      supabaseAdmin.schema('tutorias').from("asignaciones_tutor").select("*").eq('activa', true),
      supabaseAdmin.schema('tutorias').from("sesiones_tutoria").select("*"),
    ]);

    if (tutoresRes.error) throw tutoresRes.error;
    if (alumnosRes.error) throw alumnosRes.error;

    const tutoresRaw = tutoresRes.data || [];
    const alumnosRaw = alumnosRes.data || [];
    const asignacionesRaw = asignacionesRes.data || [];
    const sesionesRaw = sesionesRes.data || [];

    // 2. KPIs
    const totalTutores = tutoresRaw.length;
    const totalAlumnos = alumnosRaw.length;
    const totalSesiones = sesionesRaw.length;
    const promedio = totalTutores > 0 ? (totalAlumnos / totalTutores).toFixed(1) : "0.0";

    // 3. Procesar lista de tutores (Tarjetas)
    const tutoresList = tutoresRaw.map(t => {
      const assignedIds = asignacionesRaw.filter(a => a.tutor_id === t.id).map(a => a.alumno_id);
      const assignedAlumnos = alumnosRaw.filter(a => assignedIds.includes(a.id));
      const tutorSessions = sesionesRaw.filter(s => s.tutor_id === t.id).length;
      const riskCount = assignedAlumnos.filter(a => a.riesgo_academico && a.riesgo_academico !== 'bajo').length;

      return {
        id: t.id,
        nombre: t.nombre_completo,
        departamento: t.departamento,
        especialidad: t.especialidad,
        correo: "consultando...", // Se podría cruzar con auth si fuera necesario
        alumnosAsignados: assignedAlumnos.length,
        sesionesTotales: tutorSessions,
        enRiesgo: riskCount
      };
    });

    // 4. Procesar lista de asignaciones (Tabla)
    const assignmentsDetail = asignacionesRaw.map(asig => {
      const tutor = tutoresRaw.find(t => t.id === asig.tutor_id);
      const alumno = alumnosRaw.find(a => a.id === asig.alumno_id);
      
      return {
        id: asig.id,
        tutorNombre: tutor?.nombre_completo || "S/T",
        alumnoNombre: alumno?.nombre_completo || "S/A",
        matricula: alumno?.matricula || "—",
        carrera: alumno?.carrera || "—",
        cuatrimestre: alumno?.cuatrimestre || 0,
        riesgo: alumno?.riesgo_academico === 'alto' ? 'Alto' : (alumno?.riesgo_academico === 'medio' ? 'Medio' : 'Bajo')
      };
    });

    // Ordenar asignaciones por tutor
    assignmentsDetail.sort((a, b) => a.tutorNombre.localeCompare(b.tutorNombre));

    return {
      data: {
        kpis: {
          totalTutores,
          totalAlumnos,
          totalSesiones,
          promedio
        },
        tutores: tutoresList,
        asignaciones: assignmentsDetail
      }
    };

  } catch (error: any) {
    console.error("Tutores Data Error:", error);
    return { error: "No se pudieron obtener los datos de tutores." };
  }
}

/**
 * Asigna un tutor a múltiples alumnos.
 * Desactiva las asignaciones previas de los alumnos seleccionados.
 */
export async function assignTutorAction(tutorId: string, alumnoIds: string[]) {
  try {
    const supabaseAdmin = createAdminClient();
    const supabaseUser = await createClient();

    if (!tutorId || !alumnoIds || alumnoIds.length === 0) {
      return { error: "Datos de asignación incompletos." };
    }

    // 1. Obtener información de los alumnos y el tutor para el log (opcional pero recomendado)
    const { data: tutorData } = await supabaseAdmin
      .schema('tutorias')
      .from('tutores')
      .select('nombre_completo')
      .eq('id', tutorId)
      .single();

    // 2. Ejecutar cambios
    let assignedCount = 0;
    let skippedCount = 0;
    for (const alumnoId of alumnoIds) {
      // 2.1 Verificar si ya existe exactamente esta misma asignación activa
      const { data: existing } = await supabaseAdmin
        .schema('tutorias')
        .from('asignaciones_tutor')
        .select('id')
        .eq('alumno_id', alumnoId)
        .eq('tutor_id', tutorId)
        .eq('activa', true)
        .maybeSingle();

      if (existing) {
        skippedCount++;
        continue;
      }

      // 2.2 Eliminar asignación(es) actual(es) (con otros tutores) permanentemente
      await supabaseAdmin
        .schema('tutorias')
        .from('asignaciones_tutor')
        .delete()
        .eq('alumno_id', alumnoId)
        .eq('activa', true);

      // 2.3 Crear nueva asignación
      const now = new Date().toISOString();
      const { error: insError } = await supabaseAdmin
        .schema('tutorias')
        .from('asignaciones_tutor')
        .insert([{
          tutor_id: tutorId,
          alumno_id: alumnoId,
          fecha_inicio: now,
          activa: true
        }]);
      
      if (insError) throw insError;
      assignedCount++;
    }

    // 3. Registrar en Auditoría
    await supabaseUser.rpc('registrar_audit', {
      p_evento: 'ASSIGN_TUTOR_MASSIVE',
      p_tabla: 'asignaciones_tutor',
      p_registro_id: tutorId,
      p_metadata: {
        tutor_id: tutorId,
        tutor_nombre: tutorData?.nombre_completo || "Desconocido",
        cantidad_alumnos: alumnoIds.length,
        alumnos_ids: alumnoIds
      }
    });

    return { success: true, count: assignedCount, skipped: skippedCount };
  } catch (error: any) {
    console.error("Assign Tutor Error:", error);
    return { error: `Error en la asignación: ${error.message || "Desconocido"}` };
  }
}

/**
 * Elimina una o más asignaciones (soft-delete).
 */
export async function deleteAssignmentsAction(asigIds: string[]) {
  try {
    const supabaseAdmin = createAdminClient();
    const supabaseUser = await createClient();

    if (!asigIds || asigIds.length === 0) return { error: "No hay asignaciones para eliminar." };

    const { data: currentRows, error: fetchError } = await supabaseAdmin
      .schema('tutorias')
      .from('asignaciones_tutor')
      .select('id, fecha_inicio')
      .in('id', asigIds);

    if (fetchError) throw fetchError;

    // Eliminación permanente de los registros seleccionados
    const { error } = await supabaseAdmin
      .schema('tutorias')
      .from('asignaciones_tutor')
      .delete()
      .in('id', asigIds);
    
    if (error) throw error;

    // Auditoría
    await supabaseUser.rpc('registrar_audit', {
      p_evento: 'DELETE_ASSIGNMENT_MASSIVE',
      p_tabla: 'asignaciones_tutor',
      p_registro_id: asigIds[0],
      p_metadata: { ids_eliminados: asigIds, cantidad: asigIds.length }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete Assignment Error:", error);
    return { error: `Error al eliminar: ${error.message || "Desconocido"}` };
  }
}

/**
 * Actualiza la asignación de un alumno a un nuevo tutor.
 */
export async function updateAssignmentAction(asigId: string, newTutorId: string) {
  try {
    const supabaseAdmin = createAdminClient();
    const supabaseUser = await createClient();

    // 1. Obtener datos de la asignación actual
    const { data: current, error: fetchError } = await supabaseAdmin
      .schema('tutorias')
      .from('asignaciones_tutor')
      .select('alumno_id, fecha_inicio')
      .eq('id', asigId)
      .single();

    if (fetchError || !current) return { error: "Asignación no encontrada." };

    // 2. Eliminar la asignación actual permanentemente
    const { error: deleteError } = await supabaseAdmin
      .schema('tutorias')
      .from('asignaciones_tutor')
      .delete()
      .eq('id', asigId);

    if (deleteError) throw deleteError;

    // 3. Crear la nueva asignación
    const now = new Date().toISOString();
    const { error: insError } = await supabaseAdmin
      .schema('tutorias')
      .from('asignaciones_tutor')
      .insert([{
        tutor_id: newTutorId,
        alumno_id: current.alumno_id,
        fecha_inicio: now,
        activa: true
      }]);

    if (insError) throw insError;

    // Auditoría
    await supabaseUser.rpc('registrar_audit', {
      p_evento: 'UPDATE_ASSIGNMENT',
      p_tabla: 'asignaciones_tutor',
      p_registro_id: asigId,
      p_metadata: { asig_original: asigId, nuevo_tutor: newTutorId }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update Assignment Error:", error);
    return { error: `Error al actualizar: ${error.message || "Desconocido"}` };
  }
}



