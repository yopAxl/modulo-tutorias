"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Función centralizada para obtener el perfil del tutor usando RLS estándar.
 * Eliminado el modo de fallback administrativo para cumplir con el SCHEMA.md.
 */
async function getTutorProfile(authId: string) {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .schema('tutorias')
    .from('tutores')
    .select('*')
    .eq('user_id', authId)
    .maybeSingle();

  if (error) {
    console.error("Error de RLS en getTutorProfile:", error);
    return { profile: null, client: supabase };
  }

  return { profile, client: supabase };
}

export async function getTutorDashboardStats(authId: string) {
  try {
    const { profile: tutor, client: supabase } = await getTutorProfile(authId);
    if (!tutor) return { data: null, error: "PERFIL_NO_ENCONTRADO" };

    // 1. Obtener alumnos asignados (Sujeto a RLS)
    const { data: asignaciones, error: errorAsig } = await supabase
      .schema('tutorias')
      .from('asignaciones_tutor')
      .select(`
        alumnos (
          id, nombre_completo, matricula, promedio_general, riesgo_academico, grupo
        )
      `)
      .eq('tutor_id', tutor.id)
      .eq('activa', true);

    if (errorAsig) throw errorAsig;

    const alumnos = asignaciones?.map(a => {
      const alumno = Array.isArray(a.alumnos) ? a.alumnos[0] : a.alumnos;
      return {
        ...alumno,
        promedio: parseFloat(alumno?.promedio_general as any) || 0,
        riesgo: alumno?.riesgo_academico === 'alto' ? 'Alto' : (alumno?.riesgo_academico === 'medio' ? 'Medio' : 'Bajo')
      };
    }) || [];

    // 2. Obtener sesiones (Sujeto a RLS)
    const { data: sesiones, error: errorSes } = await supabase
      .schema('tutorias')
      .from('sesiones_tutoria')
      .select('*')
      .eq('tutor_id', tutor.id);

    if (errorSes) throw errorSes;

    return {
      data: {
        tutor,
        alumnosRecientes: alumnos,
        proximasSesiones: sesiones.filter(s => s.estatus === 'pendiente').slice(0, 5),
        stats: {
          totalAlumnos: alumnos.length,
          sesionesPendientes: sesiones.filter(s => s.estatus === 'pendiente').length,
          alertasRiesgo: alumnos.filter(a => a.riesgo === 'Alto').length,
          sesionesCompletadas: sesiones.filter(s => s.estatus === 'realizada').length
        },
        isFallback: false
      },
      error: null
    };
  } catch (error: any) {
    console.error("Error en getTutorDashboardStats:", error);
    return { data: null, error: error.message };
  }
}

export async function getTutorAlumnos(authId: string) {
  try {
    const { profile: tutor, client: supabase } = await getTutorProfile(authId);
    if (!tutor) return { data: null, error: "PERFIL_NO_ENCONTRADO" };

    const { data: asignaciones, error } = await supabase
      .schema('tutorias')
      .from('asignaciones_tutor')
      .select(`
        alumnos (*)
      `)
      .eq('tutor_id', tutor.id)
      .eq('activa', true);

    if (error) throw error;
    
    return { 
      data: { 
        tutor, 
        alumnos: asignaciones?.map(a => {
          const alumno = Array.isArray(a.alumnos) ? a.alumnos[0] : a.alumnos;
          return {
            ...alumno,
            nivel_riesgo: alumno?.riesgo_academico === 'alto' ? 'Alto' : (alumno?.riesgo_academico === 'medio' ? 'Medio' : 'Bajo'),
            promedio: parseFloat(alumno?.promedio_general as any) || 0
          };
        }) || [] 
      }, 
      error: null 
    };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function getTutorSesiones(authId: string) {
  // Usamos admin client para asegurar la lectura de relaciones N:N (motivos) 
  // independientemente de las políticas RLS en la tabla de unión.
  const supabase = createAdminClient();
  try {
    // 1. Obtener el perfil para filtrar por tutor_id
    const { data: tutor } = await supabase
      .schema('tutorias')
      .from('tutores')
      .select('id, nombre_completo')
      .eq('user_id', authId)
      .single();

    if (!tutor) return { data: null, error: "PERFIL_NO_ENCONTRADO" };

    // 2. Obtener sesiones con sus motivos y alumnos
    const { data: rawSesiones, error: errorSes } = await supabase
      .schema('tutorias')
      .from('sesiones_tutoria')
      .select(`
        *,
        alumnos (id, nombre_completo, matricula, carrera, grupo),
        sesion_motivos (motivo_codigo),
        canalizaciones:canalizaciones!sesion_id (*)
      `)
      .eq('tutor_id', tutor.id)
      .order('fecha', { ascending: false });

    if (errorSes) throw errorSes;

    // 2.5 Obtener incidencias y planes de los alumnos de estas sesiones para asociar por fecha
    const alumnoIds = Array.from(new Set((rawSesiones || []).map(s => s.alumno_id)));
    
    if (alumnoIds.length > 0) {
      const [incidenciasRes, planesRes] = await Promise.all([
        supabase.schema('tutorias').from('incidencias').select('*').in('alumno_id', alumnoIds),
        supabase.schema('tutorias').from('planes_accion').select('*').in('alumno_id', alumnoIds)
      ]);

      const allIncidencias = incidenciasRes.data || [];
      const allPlanes = planesRes.data || [];

      // Asociar por fecha (heurística para tablas sin sesion_id)
      (rawSesiones || []).forEach((s: any) => {
        const sDate = s.fecha;
        s.incidencias = allIncidencias.filter(i => i.alumno_id === s.alumno_id && i.fecha === sDate);
        s.planes_accion = allPlanes.filter(p => p.alumno_id === s.alumno_id && (p.fecha_inicio === sDate || p.created_at?.split('T')[0] === sDate));
      });
    }

    const sesiones = rawSesiones;

    // 3. Obtener alumnos asignados
    const { data: asignaciones } = await supabase
      .schema('tutorias')
      .from('asignaciones_tutor')
      .select('alumnos(id, nombre_completo, matricula, carrera, grupo)')
      .eq('tutor_id', tutor.id)
      .eq('activa', true);

    return { 
      data: { 
        tutor, 
        sesiones: sesiones || [], 
        alumnosAsignados: asignaciones?.map((a: any) => {
          const alumno = Array.isArray(a.alumnos) ? a.alumnos[0] : a.alumnos;
          return { 
            id: alumno?.id, 
            nombre: alumno?.nombre_completo,
            matricula: alumno?.matricula,
            carrera: alumno?.carrera,
            grupo: alumno?.grupo
          };
        }) || []
      }, 
      error: null 
    };
  } catch (error: any) {
    console.error("Error en getTutorSesiones (Admin):", error);
    return { data: null, error: error.message };
  }
}

export async function getCatalogosTutoria() {
  const supabase = await createClient();
  try {
    const [resMotivos, resUrgencia] = await Promise.all([
      supabase.schema('tutorias').from('cat_motivo_tutoria').select('*').eq('activo', true).order('orden', { ascending: true }),
      supabase.schema('tutorias').from('cat_nivel_urgencia').select('*').order('orden', { ascending: true })
    ]);

    if (resMotivos.error) throw resMotivos.error;
    
    return { 
      data: { 
        motivos: resMotivos.data || [],
        urgencias: resUrgencia.data || []
      }, 
      error: null 
    };
  } catch (error: any) {
    return { data: { motivos: [], urgencias: [] }, error: error.message };
  }
}

export async function getTutorReportData(authId: string) {
  try {
    const { profile: tutor, client: supabase } = await getTutorProfile(authId);
    if (!tutor) return { data: null, error: "PERFIL_NO_ENCONTRADO" };

    const [resAlumnos, resSesiones] = await Promise.all([
      supabase.schema('tutorias').from('asignaciones_tutor').select('alumnos(*)').eq('tutor_id', tutor.id).eq('activa', true),
      supabase.schema('tutorias').from('sesiones_tutoria').select('*, alumnos(nombre_completo)').eq('tutor_id', tutor.id)
    ]);

    return {
      data: {
        tutor,
        alumnos: resAlumnos.data?.map(a => {
          const alumno = Array.isArray(a.alumnos) ? a.alumnos[0] : a.alumnos;
          return {
            ...alumno,
            riesgo: alumno?.riesgo_academico === 'alto' ? 'Alto' : (alumno?.riesgo_academico === 'medio' ? 'Medio' : 'Bajo'),
            promedio: parseFloat(alumno?.promedio_general as any) || 0
          };
        }) || [],
        sesiones: resSesiones.data || []
      },
      error: null
    };
  } catch (error: any) {
    console.error("Error en getTutorReportData:", error);
    return { data: null, error: error.message };
  }
}

export async function getExpedienteAlumno(authId: string, alumnoId: string) {
  try {
    const { profile: tutor } = await getTutorProfile(authId);
    if (!tutor) return { data: null, error: "PERFIL_NO_ENCONTRADO" };

    const adminSupabase = createAdminClient();

    const [resAlumno, resCal, resSes, resCan, resInc, resDoc, resPlanes] = await Promise.all([
      adminSupabase.schema('tutorias').from('alumnos').select('*, tutores:tutores(nombre_completo)').eq('id', alumnoId).single(),
      adminSupabase.schema('tutorias').from('calificaciones').select('*').eq('alumno_id', alumnoId).order('created_at', { ascending: false }),
      adminSupabase.schema('tutorias').from('sesiones_tutoria').select('*').eq('alumno_id', alumnoId).order('fecha', { ascending: false }),
      adminSupabase.schema('tutorias').from('canalizaciones').select('*').eq('alumno_id', alumnoId).order('created_at', { ascending: false }),
      adminSupabase.schema('tutorias').from('incidencias').select('*').eq('alumno_id', alumnoId).order('fecha', { ascending: false }),
      adminSupabase.schema('tutorias').from('documentos').select('*').eq('alumno_id', alumnoId).order('created_at', { ascending: false }),
      adminSupabase.schema('tutorias').from('planes_accion').select('*').eq('alumno_id', alumnoId).order('fecha_inicio', { ascending: false })
    ]);

    return {
      data: {
        alumno: resAlumno.data,
        calificaciones: resCal.data || [],
        sesiones: resSes.data || [],
        canalizaciones: resCan.data || [],
        incidencias: resInc.data || [],
        documentos: resDoc.data || [],
        planes: resPlanes.data || []
      },
      error: null
    };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function createSessionAction(formData: any) {
  const supabase = createAdminClient();
  try {
    const { 
      alumno_id, tutor_id, fecha, hora_inicio, hora_fin, 
      puntos_relevantes, compromisos_acuerdos, nivel_urgencia, 
      estatus, motivos 
    } = formData;

    // Sanitización para PostgreSQL
    const sessionData = {
      alumno_id,
      tutor_id,
      fecha: fecha || null,
      hora_inicio: hora_inicio || null,
      hora_fin: hora_fin || null,
      puntos_relevantes: puntos_relevantes || null,
      compromisos_acuerdos: compromisos_acuerdos || null,
      nivel_urgencia: nivel_urgencia?.toLowerCase() || 'normal',
      estatus,
      confirmado_tutor: true,
      fecha_confirmacion_tutor: new Date().toISOString()
    };

    const { data: sesion, error: errorSes } = await supabase
      .schema('tutorias')
      .from('sesiones_tutoria')
      .insert(sessionData)
      .select()
      .single();

    if (errorSes) throw errorSes;

    if (motivos && motivos.length > 0) {
      const motivosInsert = motivos.map((m: string) => ({
        sesion_id: sesion.id,
        motivo_codigo: m
      }));

      const { error: errorMotivos } = await supabase
        .schema('tutorias')
        .from('sesion_motivos')
        .insert(motivosInsert);

      if (errorMotivos) throw errorMotivos;
    }

    return { data: sesion, error: null };
  } catch (error: any) {
    console.error("Error creating session (Admin Context):", error);
    return { data: null, error: error.message };
  }
}

export async function updateSessionAction(sessionId: string, formData: any) {
  const supabase = createAdminClient();
  try {
    const { 
      alumno_id, tutor_id, fecha, hora_inicio, hora_fin, 
      puntos_relevantes, compromisos_acuerdos, nivel_urgencia, 
      estatus, motivos 
    } = formData;

    // 1. Limpieza de datos (Convertir "" a null para PG)
    const sessionData = {
      alumno_id,
      tutor_id,
      fecha: fecha || null,
      hora_inicio: hora_inicio || null,
      hora_fin: hora_fin || null,
      puntos_relevantes: puntos_relevantes || null,
      compromisos_acuerdos: compromisos_acuerdos || null,
      nivel_urgencia: nivel_urgencia?.toLowerCase() || 'normal',
      estatus,
      updated_at: new Date().toISOString()
    };

    // 2. Actualizar la sesión principal
    const { error: errorSes } = await supabase
      .schema('tutorias')
      .from('sesiones_tutoria')
      .update(sessionData)
      .eq('id', sessionId);

    if (errorSes) throw errorSes;

    // 3. Actualizar motivos (Borrado y re-inserción atómica)
    await supabase
      .schema('tutorias')
      .from('sesion_motivos')
      .delete()
      .eq('sesion_id', sessionId);

    if (motivos && motivos.length > 0) {
      const motivosInsert = motivos.map((m: string) => ({
        sesion_id: sessionId,
        motivo_codigo: m
      }));

      const { error: errorMotivos } = await supabase
        .schema('tutorias')
        .from('sesion_motivos')
        .insert(motivosInsert);

      if (errorMotivos) throw errorMotivos;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error updating session (Admin Context):", error);
    return { success: false, error: error.message || "Error desconocido al actualizar" };
  }
}

export async function getCatalogosCanalizacion() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .schema('tutorias')
      .from('cat_tipo_canalizacion')
      .select('*')
      .eq('activo', true);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
}

export async function createCanalizacionAction(formData: {
  alumno_id: string;
  tutor_id: string;
  sesion_id?: string;
  tipo_servicio: string;
  motivo: string;
  seguimiento?: string;
}) {
  const supabase = createAdminClient();
  try {
    const { error } = await supabase
      .schema('tutorias')
      .from('canalizaciones')
      .insert({
        alumno_id: formData.alumno_id,
        tutor_id: formData.tutor_id,
        sesion_id: formData.sesion_id || null,
        tipo_servicio: formData.tipo_servicio,
        fecha_canalizacion: new Date().toISOString().split('T')[0],
        motivo: formData.motivo,
        seguimiento: formData.seguimiento || null,
        estatus: 'pendiente',
      });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error creating canalización:", error);
    return { success: false, error: error.message };
  }
}

export async function createIncidenciaAction(formData: {
  alumno_id: string;
  registrado_por: string; // tutor_id from tutores table
  tipo_incidencia: string;
  descripcion: string;
  resolucion?: string;
}) {
  const supabase = createAdminClient();
  try {
    // registrado_por necesita auth.users(id), no tutores(id)
    // Buscar el user_id del tutor
    const { data: tutor } = await supabase
      .schema('tutorias')
      .from('tutores')
      .select('user_id')
      .eq('id', formData.registrado_por)
      .single();

    const { error } = await supabase
      .schema('tutorias')
      .from('incidencias')
      .insert({
        alumno_id: formData.alumno_id,
        registrado_por: tutor?.user_id || formData.registrado_por,
        fecha: new Date().toISOString().split('T')[0],
        tipo_incidencia: formData.tipo_incidencia,
        descripcion: formData.descripcion,
        resolucion: formData.resolucion || null,
        estatus: 'abierta',
      });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error creating incidencia:", error);
    return { success: false, error: error.message };
  }
}

export async function createPlanAccionAction(formData: {
  alumno_id: string;
  tutor_id: string;
  objetivo_general: string;
  metas: { descripcion: string; fecha_limite: string; lograda: boolean }[];
}) {
  const supabase = createAdminClient();
  try {
    const { error } = await supabase
      .schema('tutorias')
      .from('planes_accion')
      .insert({
        alumno_id: formData.alumno_id,
        tutor_id: formData.tutor_id,
        periodo: new Date().getFullYear() + '-' + (Math.ceil((new Date().getMonth() + 1) / 4)),
        objetivo_general: formData.objetivo_general,
        metas: formData.metas,
        estatus: 'activo',
        fecha_inicio: new Date().toISOString().split('T')[0],
      });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error creating plan de acción:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCanalizacionAction(id: string, updates: {
  estatus?: string;
  seguimiento?: string;
}) {
  const supabase = createAdminClient();
  try {
    const { error } = await supabase
      .schema('tutorias')
      .from('canalizaciones')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateIncidenciaAction(id: string, updates: {
  estatus?: string;
  resolucion?: string;
}) {
  const supabase = createAdminClient();
  try {
    const { error } = await supabase
      .schema('tutorias')
      .from('incidencias')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePlanMetasAction(id: string, metas: any[]) {
  const supabase = createAdminClient();
  try {
    const { error } = await supabase
      .schema('tutorias')
      .from('planes_accion')
      .update({ metas })
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}