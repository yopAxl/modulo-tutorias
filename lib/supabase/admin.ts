import { createClient } from "@supabase/supabase-js";

// Este cliente usa el SERVICE_ROLE_KEY para realizar operaciones
// administrativas sin respetar las reglas RLS normales, por lo que
// NUNCA debe ser expuesto al lado del cliente (Navegador).
export const createAdminClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Las variables de entorno de Supabase no están configuradas correctamente.");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
