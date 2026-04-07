import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: No usar condicionales antes de esta llamada.
  const { data: { session } } = await supabase.auth.getSession();
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── Rutas protegidas: /dashboard/* ──────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      // No hay sesión → redirigir al login
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // ── Si ya tiene sesión y visita la landing page (/) o /login → redirigir al dashboard
  if ((pathname === "/login" || pathname === "/") && user) {
    let role = user.app_metadata?.app_role as string | undefined;

    // Intentamos extraerlo del Payload crudo del token si es que el Hook lo guarda ahí
    console.log("PROXY: Interceptando raíz o login con usuario existente. Rol Inicial:", role);
    if (session?.access_token) {
      try {
        const base64Url = session.access_token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const decoded = JSON.parse(jsonPayload);
        role = decoded?.app_role || decoded?.app_metadata?.app_role || role;
        console.log("PROXY: Decoding exitoso:", role);
      } catch (e: any) {
        console.log("PROXY: Error decodificando token en edge:", e.message);
      }
    } else {
      console.log("PROXY: session.access_token no está definido.");
    }
    const roleRoutes: Record<string, string> = {
      administrador: "/dashboard/admin",
      tutor: "/dashboard/tutor",
      docente: "/dashboard/docente",
      alumno: "/dashboard/alumno",
    };

    if (role && role in roleRoutes) {
      const url = request.nextUrl.clone();
      url.pathname = roleRoutes[role];
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, sitemap.xml, robots.txt (archivos de metadatos)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
