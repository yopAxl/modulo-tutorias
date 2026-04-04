"use client";

import { AuthGuard } from "@/app/_components/AuthGuard";

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["rol_tutor"]}>
      {children}
    </AuthGuard>
  );
}
