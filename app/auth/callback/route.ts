import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, getDashboardPath } from "@/app/_lib/auth-utils";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Obtener el usuario y sesión para leer su rol del JWT decodificado
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      const role = getUserRole(user, session);

      if (role) {
        // Redirigir al dashboard correspondiente al rol
        return NextResponse.redirect(`${origin}${getDashboardPath(role)}`);
      }

      // Usuario sin rol asignado
      return NextResponse.redirect(`${origin}/login?error=no_role`);
    }
  }

  // Si hay error o no hay código, mandar al login
  return NextResponse.redirect(`${origin}/login`);
}
