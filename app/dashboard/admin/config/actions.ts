"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getCatalogsAction() {
  try {
    const supabase = createAdminClient();

    const [motivos, urgencias, canalizaciones] = await Promise.all([
      supabase.schema('tutorias').from("cat_motivo_tutoria").select("*").order("orden", { ascending: true }),
      supabase.schema('tutorias').from("cat_nivel_urgencia").select("*").order("orden", { ascending: true }),
      supabase.schema('tutorias').from("cat_tipo_canalización").select("*").order("descripcion", { ascending: true }),
    ]);

    if (motivos.error) throw motivos.error;
    if (urgencias.error) throw urgencias.error;
    if (canalizaciones.error) throw canalizaciones.error;

    return {
      motivos: motivos.data,
      urgencias: urgencias.data,
      canalizaciones: canalizaciones.data,
    };
  } catch (error: any) {
    console.error("Error fetching catalogs:", error);
    return { error: error.message };
  }
}

export async function createCatalogEntryAction(tableName: string, data: any) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .schema('tutorias')
      .from(tableName)
      .insert([data]);

    if (error) {
      if (error.code === "23505") {
        return { error: "El código ya existe en este catálogo." };
      }
      throw error;
    }

    revalidatePath("/dashboard/admin/config");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating catalog entry:", error);
    return { error: error.message };
  }
}
