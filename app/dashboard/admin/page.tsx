import Sidebar from "@/app/_components/Sidebar";
import { ALUMNOS, TUTORES, SESIONES, gpaClass, type RiesgoNivel } from "@/app/_lib/mock-data";

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/admin" },
  { icon: "👥", label: "Usuarios", href: "/dashboard/admin/usuarios" },
  { icon: "🎓", label: "Tutores", href: "/dashboard/admin/tutores" },
  { icon: "📋", label: "Sesiones", href: "/dashboard/admin/sesiones" },
  { icon: "📈", label: "Reportes", href: "/dashboard/admin/reportes" },
  { icon: "⚙️", label: "Configuración", href: "/dashboard/admin/config" },
];

function riskBadge(riesgo: RiesgoNivel) {
  const dot = riesgo === "Alto" ? "🔴" : riesgo === "Medio" ? "🟡" : "🟢";
  return (
    <span className={`risk-badge ${riesgo.toLowerCase()}`}>
      {dot} {riesgo}
    </span>
  );
}

export default function AdminDashboard() {
  const totalAlumnos = ALUMNOS.length;
  const totalTutores = TUTORES.length;
  const totalSesiones = SESIONES.length;
  const alumnosAlto = ALUMNOS.filter((a) => a.riesgo === "Alto").length;
  const alumnosMedio = ALUMNOS.filter((a) => a.riesgo === "Medio").length;
  const alumnosBajo = ALUMNOS.filter((a) => a.riesgo === "Bajo").length;

  const promedioGeneral = (
    ALUMNOS.reduce((sum, a) => sum + a.promedio, 0) / totalAlumnos
  ).toFixed(1);

  return (
    <div className="dashboard-shell">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Panel de Administración</h1>
            <p className="page-subtitle">
              Visión general del sistema de tutorías. Marzo 2026.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <a href="#" className="btn btn-ghost">⬇ Exportar reporte</a>
            <a href="#" className="btn btn-primary">＋ Nuevo usuario</a>
          </div>
        </div>

        {/* KPIs */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Total alumnos</span>
              <div className="stat-card-icon" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>👥</div>
            </div>
            <div className="stat-card-value">{totalAlumnos}</div>
            <div className="stat-card-trend trend-up">↑ Inscritos este cuatrimestre</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Tutores activos</span>
              <div className="stat-card-icon" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>🎓</div>
            </div>
            <div className="stat-card-value">{totalTutores}</div>
            <div className="stat-card-trend" style={{ color: "#94a3b8" }}>Asignados al período actual</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Sesiones registradas</span>
              <div className="stat-card-icon" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>📋</div>
            </div>
            <div className="stat-card-value">{totalSesiones}</div>
            <div className="stat-card-trend trend-up">↑ Este mes</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Promedio general</span>
              <div className="stat-card-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>📈</div>
            </div>
            <div className="stat-card-value">{promedioGeneral}</div>
            <div className="stat-card-trend trend-up">↑ +0.3 vs cuatrimestre anterior</div>
          </div>
        </div>

        {/* Grid 2 cols */}
        <div className="grid-2">
          {/* Distribución de riesgo */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📊 Distribución por nivel de riesgo</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div className="progress-bar-wrap">
                  <span className="progress-bar-label" style={{ color: "var(--danger)" }}>🔴 Alto</span>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${(alumnosAlto / totalAlumnos) * 100}%`,
                        background: "var(--danger)",
                      }}
                    />
                  </div>
                  <span className="progress-bar-count">{alumnosAlto}</span>
                </div>
                <div className="progress-bar-wrap">
                  <span className="progress-bar-label" style={{ color: "var(--warning)" }}>🟡 Medio</span>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${(alumnosMedio / totalAlumnos) * 100}%`,
                        background: "var(--warning)",
                      }}
                    />
                  </div>
                  <span className="progress-bar-count">{alumnosMedio}</span>
                </div>
                <div className="progress-bar-wrap">
                  <span className="progress-bar-label" style={{ color: "var(--success)" }}>🟢 Bajo</span>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${(alumnosBajo / totalAlumnos) * 100}%`,
                        background: "var(--success)",
                      }}
                    />
                  </div>
                  <span className="progress-bar-count">{alumnosBajo}</span>
                </div>
              </div>

              {/* Summary numbers */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <div style={{ flex: 1, textAlign: "center", padding: "14px", borderRadius: "var(--radius-sm)", background: "var(--danger-dim)" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--danger)" }}>{alumnosAlto}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Riesgo Alto</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: "14px", borderRadius: "var(--radius-sm)", background: "var(--warning-dim)" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--warning)" }}>{alumnosMedio}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Riesgo Medio</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: "14px", borderRadius: "var(--radius-sm)", background: "var(--success-dim)" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--success)" }}>{alumnosBajo}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Sin riesgo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Carga de tutores */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🎓 Carga por tutor</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tutor</th>
                  <th>Alumnos</th>
                  <th>Sesiones</th>
                </tr>
              </thead>
              <tbody>
                {TUTORES.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="name">{t.nombre.split(" ").slice(0, 3).join(" ")}</div>
                      <div className="sub">{t.departamento}</div>
                    </td>
                    <td>
                      <span className="gpa-pill gpa-mid" style={{ minWidth: "36px" }}>
                        {t.alumnosAsignados}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>{t.sesionesEsteCorte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alumnos table full */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">👥 Padrón de alumnos</span>
            <a href="#" className="card-action">Gestionar →</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Matrícula</th>
                <th>Carrera</th>
                <th>Cuatr.</th>
                <th>Promedio</th>
                <th>Riesgo</th>
                <th>Tutor asignado</th>
              </tr>
            </thead>
            <tbody>
              {ALUMNOS.map((a) => {
                const tutor = TUTORES.find((t) => t.id === a.tutorId);
                return (
                  <tr key={a.id}>
                    <td>
                      <div className="name">{a.nombre}</div>
                      <div className="sub">{a.correo}</div>
                    </td>
                    <td style={{ color: "var(--text-primary)", fontFamily: "monospace" }}>{a.matricula}</td>
                    <td>{a.carrera}</td>
                    <td style={{ color: "var(--text-primary)" }}>{a.cuatrimestre}°</td>
                    <td>
                      <span className={`gpa-pill ${gpaClass(a.promedio)}`}>{a.promedio.toFixed(1)}</span>
                    </td>
                    <td>{riskBadge(a.riesgo)}</td>
                    <td>
                      <div className="sub">
                        {tutor?.nombre.split(" ").slice(0, 3).join(" ") ?? "—"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
