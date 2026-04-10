"use server";

import { createClient } from "@/lib/supabase/server";

export async function getTutorDashboardStats(tutorId: string) {
  const supabase = await createClient();

  try {
    // 1. Obtener alumnos asignados a este tutor
    const { data: alumnos, error: errorAlumnos } = await supabase
      .schema('tutorias')
      .from('alumnos')
      .select('*')
      .eq('tutor_id', tutorId);

    if (errorAlumnos) throw errorAlumnos;

    // 2. Obtener sesiones vinculadas a este tutor
    const { data: sesiones, error: errorSesiones } = await supabase
      .schema('tutorias')
      .from('sesiones_tutoria')
      .select('*')
      .eq('tutor_id', tutorId);

    if (errorSesiones) throw errorSesiones;

    // 3. Formatear datos para el Dashboard
    return {
      stats: {
        totalAlumnos: alumnos?.length || 0,
        sesionesPendientes: sesiones?.filter(s => s.estatus === 'pendiente').length || 0,
        alertasRiesgo: alumnos?.filter(a => a.nivel_riesgo === 'Alto').length || 0,
        sesionesCompletadas: sesiones?.filter(s => s.estatus === 'realizada').length || 0
      },
      alumnosRecientes: alumnos?.sort((a, b) => b.promedio - a.promedio).slice(0, 5) || [],
      proximasSesiones: sesiones
        ?.filter(s => s.estatus === 'pendiente')
        .slice(0, 3)
        .map(s => ({
          id: s.id,
          // Aquí idealmente un join para el nombre, pero uso el ID por ahora
          alumnoId: s.alumno_id, 
          hora: new Date(s.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })) || []
    };
  } catch (error: any) {
    console.error("Error en getTutorDashboardStats:", error);
    return null;
  }
}