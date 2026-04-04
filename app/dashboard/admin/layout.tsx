"use client";

import { AuthGuard } from "@/app/_components/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["rol_administrador"]}>
      {children}
    </AuthGuard>
  );
}
