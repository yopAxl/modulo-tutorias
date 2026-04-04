"use client";

import { AuthGuard } from "@/app/_components/AuthGuard";

export default function DocenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["rol_docente"]}>
      {children}
    </AuthGuard>
  );
}
