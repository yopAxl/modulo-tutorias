"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getRiskReportData() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .schema('tutorias')
      .from("alumnos")
      .select("nombre_completo, matricula, carrera, cuatrimestre, promedio_general, riesgo_academico")
      .neq("riesgo_academico", "bajo")
      .order("promedio_general", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error in getRiskReportData:", error);
    return { error: error.message };
  }
}

export async function getSessionsByTutorReportData() {
  try {
    const supabase = createAdminClient();
    
    // Obtenemos todos los tutores
    const { data: tutores, error: tError } = await supabase
      .schema('tutorias')
      .from("tutores")
      .select("id, nombre_completo, departamento");

    if (tError) throw tError;

    // Obtenemos conteos de sesiones por tutor
    // Nota: PostgREST no soporta agregaciones complejas fácilmente, 
    // así que consultaremos las sesiones y procesaremos
    const { data: sesiones, error: sError } = await supabase
      .schema('tutorias')
      .from("sesiones_tutoria")
      .select("tutor_id");

    if (sError) throw sError;

    // Obtenemos conteos de alumnos asignados
    const { data: asignaciones, error: aError } = await supabase
      .schema('tutorias')
      .from("asignaciones_tutor")
      .select("tutor_id")
      .eq("activa", true);

    if (aError) throw aError;

    return tutores.map(t => ({
      nombre: t.nombre_completo,
      departamento: t.departamento,
      alumnos: asignaciones.filter(a => a.tutor_id === t.id).length,
      sesiones: sesiones.filter(s => s.tutor_id === t.id).length
    }));

  } catch (error: any) {
    console.error("Error in getSessionsByTutorReportData:", error);
    return { error: error.message };
  }
}

export async function getQualificationsReportData() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .schema('tutorias')
      .from("calificaciones")
      .select(`
        asignatura,
        calificacion,
        tipo_evaluacion,
        created_at,
        alumnos ( nombre_completo )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((c: any) => ({
      alumnoNombre: c.alumnos?.nombre_completo || "N/A",
      asignatura: c.asignatura,
      calificacion: c.calificacion,
      tipo: c.tipo_evaluacion,
      fecha: c.created_at
    }));

  } catch (error: any) {
    console.error("Error in getQualificationsReportData:", error);
    return { error: error.message };
  }
}

export async function getStudentRosterReportData() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .schema('tutorias')
      .from("alumnos")
      .select(`
        nombre_completo,
        matricula,
        carrera,
        grupo,
        cuatrimestre,
        promedio_general,
        asignaciones_tutor (
          activa,
          tutores ( nombre_completo )
        )
      `)
      .order("nombre_completo", { ascending: true });

    if (error) throw error;

    return data.map((a: any) => {
      const tutorActivo = a.asignaciones_tutor?.find((asig: any) => asig.activa);
      return {
        nombre: a.nombre_completo,
        matricula: a.matricula,
        carrera: a.carrera,
        grupo: a.grupo,
        cuatrimestre: a.cuatrimestre,
        promedio: a.promedio_general,
        tutor: tutorActivo?.tutores?.nombre_completo || "Sin asignar"
      };
    });

  } catch (error: any) {
    console.error("Error in getStudentRosterReportData:", error);
    return { error: error.message };
  }
}
