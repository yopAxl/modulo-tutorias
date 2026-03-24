import Sidebar from "@/app/_components/Sidebar";
import {
  getAlumnosByTutor,
  getSesionesByTutor,
  PROXIMAS_SESIONES,
  formatFecha,
  gpaClass,
  type RiesgoNivel,
} from "@/app/_lib/mock-data";

const TUTOR_ID = "t1";
const TUTOR_NOMBRE = "Dra. María Rodríguez López";

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/tutor" },
  { icon: "👥", label: "Mis alumnos", href: "/dashboard/tutor/alumnos" },
  { icon: "📅", label: "Sesiones", href: "/dashboard/tutor/sesiones" },
  { icon: "📁", label: "Expedientes", href: "/dashboard/tutor/expedientes" },
  { icon: "📈", label: "Reportes", href: "/dashboard/tutor/reportes" },
];

function riskBadge(riesgo: RiesgoNivel) {
  const dot = riesgo === "Alto" ? "🔴" : riesgo === "Medio" ? "🟡" : "🟢";
  return (
    <span className={`risk-badge ${riesgo.toLowerCase()}`}>
      {dot} {riesgo}
    </span>
  );
}

export default function TutorDashboard() {
  const alumnos = getAlumnosByTutor(TUTOR_ID);
  const sesiones = getSesionesByTutor(TUTOR_ID);

  const totalAlumnos = alumnos.length;
  const alumnosAlto = alumnos.filter((a) => a.riesgo === "Alto").length;
  const alumnosMedio = alumnos.filter((a) => a.riesgo === "Medio").length;
  const sesionesEsteMes = sesiones.length;
  const alumnosEnRiesgo = alumnos.filter(
    (a) => a.riesgo === "Alto" || a.riesgo === "Medio"
  );

  return (
    <div className="dashboard-shell">
      <Sidebar role="Tutor" userName={TUTOR_NOMBRE} navItems={NAV_ITEMS} />

      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Panel de Tutor</h1>
            <p className="page-subtitle">
              Bienvenida, {TUTOR_NOMBRE.split(" ")[1]}. Aquí tienes tu resumen del cuatrimestre.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <a href="/dashboard/tutor/sesiones" className="btn btn-primary">
              ＋ Nueva sesión
            </a>
          </div>
        </div>

        {/* KPI Row */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Alumnos asignados</span>
              <div className="stat-card-icon" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
                👥
              </div>
            </div>
            <div className="stat-card-value">{totalAlumnos}</div>
            <div className="stat-card-trend trend-up">↑ Este cuatrimestre</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Sesiones este mes</span>
              <div className="stat-card-icon" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>
                📅
              </div>
            </div>
            <div className="stat-card-value">{sesionesEsteMes}</div>
            <div className="stat-card-trend trend-up">↑ 3 más que el mes pasado</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">En riesgo Alto</span>
              <div className="stat-card-icon" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
                ⚠️
              </div>
            </div>
            <div className="stat-card-value" style={{ color: "#ef4444" }}>
              {alumnosAlto}
            </div>
            <div className="stat-card-trend" style={{ color: "#f59e0b" }}>
              {alumnosMedio} en riesgo Medio
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Próximas sesiones</span>
              <div className="stat-card-icon" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                🗓️
              </div>
            </div>
            <div className="stat-card-value">{PROXIMAS_SESIONES.length}</div>
            <div className="stat-card-trend" style={{ color: "#94a3b8" }}>Esta semana</div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid-3">
          {/* Alumnos en riesgo - tabla */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">⚠️ Alumnos en riesgo</span>
              <a href="#" className="card-action">Ver todos →</a>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Cuatrimestre</th>
                  <th>Promedio</th>
                  <th>Riesgo</th>
                </tr>
              </thead>
              <tbody>
                {alumnosEnRiesgo.map((alumno) => (
                  <tr key={alumno.id}>
                    <td>
                      <div className="name">{alumno.nombre}</div>
                      <div className="sub">{alumno.matricula} · {alumno.carrera}</div>
                    </td>
                    <td style={{ color: "var(--text-primary)" }}>{alumno.cuatrimestre}°</td>
                    <td>
                      <span className={`gpa-pill ${gpaClass(alumno.promedio)}`}>
                        {alumno.promedio.toFixed(1)}
                      </span>
                    </td>
                    <td>{riskBadge(alumno.riesgo)}</td>
                  </tr>
                ))}
                {alumnosEnRiesgo.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">✅ Sin alumnos en riesgo</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Próximas sesiones */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🗓️ Próximas sesiones</span>
            </div>
            <div className="card-body">
              {PROXIMAS_SESIONES.map((p) => (
                <div key={p.id} className="upcoming-item">
                  <div className="upcoming-date">
                    <div className="upcoming-day">{p.dia}</div>
                    <div className="upcoming-month">{p.mes}</div>
                  </div>
                  <div className="upcoming-divider" />
                  <div className="upcoming-info">
                    <div className="upcoming-name">{p.alumnoNombre.split(" ")[0]} {p.alumnoNombre.split(" ")[1]}</div>
                    <div className="upcoming-time">🕙 {p.hora}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Últimas sesiones */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Últimas sesiones registradas</span>
            <a href="#" className="card-action">Ver historial →</a>
          </div>
          <div className="card-body" style={{ padding: "4px 24px" }}>
            {sesiones.map((s) => (
              <div key={s.id} className="session-item">
                <div className="session-dot">📝</div>
                <div className="session-info">
                  <div className="session-name">{s.alumnoNombre}</div>
                  <div className="session-topics">{s.temas.join(" · ")}</div>
                  <div className="session-meta">
                    <span className="session-tag">📅 {formatFecha(s.fecha)}</span>
                    <span className="session-tag">🕙 {s.horaInicio} – {s.horaFin}</span>
                    <span
                      className="chip"
                      style={
                        s.urgencia === "Alta"
                          ? { background: "rgba(239,68,68,0.12)", color: "#ef4444" }
                          : s.urgencia === "Media"
                          ? { background: "rgba(245,158,11,0.12)", color: "#f59e0b" }
                          : {}
                      }
                    >
                      {s.urgencia === "Alta" ? "🔴" : s.urgencia === "Media" ? "🟡" : "🟢"} {s.urgencia}
                    </span>
                  </div>
                </div>
                <div className="session-duration">{s.duracionMin} min</div>
              </div>
            ))}
          </div>
        </div>

        {/* Full alumnos table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">👥 Todos mis alumnos</span>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{totalAlumnos} alumnos</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Carrera</th>
                <th>Cuatrimestre</th>
                <th>Promedio</th>
                <th>Riesgo</th>
                <th>Contacto</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="name">{a.nombre}</div>
                    <div className="sub">{a.matricula}</div>
                  </td>
                  <td>{a.carrera}</td>
                  <td style={{ color: "var(--text-primary)" }}>{a.cuatrimestre}°</td>
                  <td>
                    <span className={`gpa-pill ${gpaClass(a.promedio)}`}>
                      {a.promedio.toFixed(1)}
                    </span>
                  </td>
                  <td>{riskBadge(a.riesgo)}</td>
                  <td>
                    <div className="sub">{a.correo}</div>
                    <div className="sub">{a.telefono}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
