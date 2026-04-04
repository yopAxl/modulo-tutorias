"use client";

import { AuthGuard } from "@/app/_components/AuthGuard";

export default function AlumnoLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["rol_alumno"]}>
      {children}
    </AuthGuard>
  );
}
