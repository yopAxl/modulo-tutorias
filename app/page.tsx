import Link from "next/link";

const ROLES = [
  {
    href: "/dashboard/tutor",
    icon: "🎓",
    title: "Tutor",
    desc: "Gestiona tus alumnos asignados, registra sesiones y da seguimiento al riesgo académico.",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.12)",
  },
  {
    href: "/dashboard/admin",
    icon: "⚙️",
    title: "Administrador",
    desc: "Visión completa del sistema: padrón de alumnos, carga de tutores y estadísticas globales.",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
  },
  {
    href: "/dashboard/docente",
    icon: "📚",
    title: "Docente",
    desc: "Consulta el avance de tu grupo, registra calificaciones e identifica alumnos en riesgo.",
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.12)",
  },
  {
    href: "/dashboard/alumno",
    icon: "🎒",
    title: "Alumno",
    desc: "Revisa tu promedio, historial de tutorías, expediente y documentos académicos.",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.12)",
  },
];

export default function HomePage() {
  return (
    <div className="role-landing">
      {/* Hero */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "#6366f1",
            fontSize: 32,
            marginBottom: 20,
            boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
          }}
        >
          🎓
        </div>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}
        >
          Sistema de Tutorías
        </h1>
        <p
          style={{
            marginTop: 12,
            fontSize: 16,
            color: "var(--text-secondary)",
            maxWidth: 480,
            margin: "12px auto 0",
            lineHeight: 1.6,
          }}
        >
          Plataforma integral para el seguimiento académico y gestión de
          tutorías. Selecciona tu rol para continuar.
        </p>
        <div
          style={{
            display: "inline-block",
            marginTop: 16,
            padding: "4px 14px",
            borderRadius: 99,
            background: "rgba(99,102,241,0.12)",
            color: "#818cf8",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          MODO DEMO · DATOS FICTICIOS
        </div>
      </div>

      {/* RoleCards */}
      <div className="role-cards">
        {ROLES.map((role) => (
          <Link key={role.href} href={role.href} className="role-card">
            <div
              className="role-card-icon"
              style={{ background: role.bg, fontSize: 26 }}
            >
              {role.icon}
            </div>
            <div className="role-card-title">{role.title}</div>
            <div className="role-card-desc">{role.desc}</div>
            <div className="role-card-arrow" style={{ color: role.color }}>
              → Acceder
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        Instituto Tecnológico · Sistema de Seguimiento Académico · MVP v0.1
      </div>
    </div>
  );
}
