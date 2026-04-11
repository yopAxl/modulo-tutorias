"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Función centralizada para obtener el perfil del docente usando RLS estándar.
 */
async function getDocenteProfile(authId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .schema('tutorias')
    .from('docentes')
    .select('id, nombre_completo, departamento')
    .eq('user_id', authId)
    .maybeSingle();

  return { profile, client: supabase };
}

export async function getDocenteDashboardStats(authId: string) {
  try {
    const { profile: docente, client: supabase } = await getDocenteProfile(authId);
    if (!docente) return { data: null, error: "PERFIL_NO_ENCONTRADO" };

    const docenteId = docente.id;

    // Obtener alumnos vía calificaciones
    const { data: calificaciones, error: errorCal } = await supabase
      .schema('tutorias')
      .from('calificaciones')
      .select(`
        id,
        alumno_id,
        asignatura,
        calificacion,
        created_at,
        alumnos (
          id,
          nombre_completo,
          matricula,
          carrera,
          grupo,
          cuatrimestre,
          promedio_general,
          riesgo_academico
        )
      `)
      .eq('docente_id', docenteId);

    if (errorCal) throw errorCal;

    // Extraer alumnos únicos
    const alumnosMap = new Map();
    calificaciones?.forEach(c => {
      // Normalizar: Supabase puede devolver un objeto o un array de un solo elemento
      const alumno = Array.isArray(c.alumnos) ? c.alumnos[0] : c.alumnos;
      
      if (alumno && !alumnosMap.has(alumno.id)) {
        alumnosMap.set(alumno.id, {
          ...alumno,
          promedio: parseFloat(alumno.promedio_general as any) || 0,
          riesgo: alumno.riesgo_academico === 'alto' ? 'Alto' : (alumno.riesgo_academico === 'medio' ? 'Medio' : 'Bajo')
        });
      }
    });

    const alumnos = Array.from(alumnosMap.values());

    return {
      data: {
        docente,
        alumnos,
        calificacionesRecientes: calificaciones?.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5).map(c => {
          const alumno = Array.isArray(c.alumnos) ? c.alumnos[0] : c.alumnos;
          return {
            id: c.id,
            nombre: alumno?.nombre_completo,
            materia: c.asignatura,
            cal: parseFloat(c.calificacion as any),
            fecha: new Date(c.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
          };
        }) || [],
        isFallback: false
      },
      error: null
    };
  } catch (error: any) {
    console.error("Error en getDocenteDashboardStats:", error);
    return { data: null, error: error.message || "Error desconocido" };
  }
}

export async function getAlumnosGrupoDocente(authId: string) {
  try {
    const { profile: docente, client: supabase } = await getDocenteProfile(authId);
    if (!docente) return { data: null, error: "PERFIL_NO_ENCONTRADO" };

    const { data, error } = await supabase
      .schema('tutorias')
      .from('calificaciones')
      .select(`
        alumnos (*)
      `)
      .eq('docente_id', docente.id);

    if (error) throw error;

    const alumnosSet = new Set();
    const result: any[] = [];

    data?.forEach((item: any) => {
      if (item.alumnos && !alumnosSet.has(item.alumnos.id)) {
        alumnosSet.add(item.alumnos.id);
        result.push({
          ...item.alumnos,
          nombre: item.alumnos.nombre_completo,
          riesgo: item.alumnos.riesgo_academico === 'alto' ? 'alto' : (item.alumnos.riesgo_academico === 'medio' ? 'medio' : ' bajo')
        });
      }
    });

    return { data: result, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}
