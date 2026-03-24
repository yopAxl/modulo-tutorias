import Sidebar from "@/app/_components/Sidebar";
import { getAlumnosByDocente, gpaClass, type RiesgoNivel } from "@/app/_lib/mock-data";

const DOCENTE_ID = "d1";
const DOCENTE_NOMBRE = "Mtro. José Antonio Pérez Ruiz";

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/docente" },
  { icon: "👥", label: "Mi grupo", href: "/dashboard/docente/grupo" },
  { icon: "📝", label: "Calificaciones", href: "/dashboard/docente/calificaciones" },
  { icon: "📋", label: "Asistencias", href: "/dashboard/docente/asistencias" },
  { icon: "📁", label: "Reportes", href: "/dashboard/docente/reportes" },
];

function riskBadge(riesgo: RiesgoNivel) {
  const dot = riesgo === "Alto" ? "🔴" : riesgo === "Medio" ? "🟡" : "🟢";
  return <span className={`risk-badge ${riesgo.toLowerCase()}`}>{dot} {riesgo}</span>;
}

const CALIFICACIONES_MOCK = [
  { id: "c1", alumnoNombre: "Axel Eduardo García Torres", materia: "Cálculo Diferencial", calificacion: 6.5, fecha: "2026-03-15" },
  { id: "c2", alumnoNombre: "Fernanda Ramírez Félix", materia: "Cálculo Diferencial", calificacion: 9.2, fecha: "2026-03-15" },
  { id: "c3", alumnoNombre: "Sofía Beltrán Chávez", materia: "Ing. de Software", calificacion: 9.5, fecha: "2026-03-14" },
  { id: "c4", alumnoNombre: "Luis Ángel Ponce Villa", materia: "Cálculo Diferencial", calificacion: 6.0, fecha: "2026-03-12" },
  { id: "c5", alumnoNombre: "Karen Ibarra Llanes", materia: "Ing. de Software", calificacion: 9.8, fecha: "2026-03-10" },
];

export default function DocenteDashboard() {
  const alumnos = getAlumnosByDocente(DOCENTE_ID);
  const totalAlumnos = alumnos.length;
  const promedioGrupal = (alumnos.reduce((s, a) => s + a.promedio, 0) / totalAlumnos).toFixed(1);
  const alumnosEnRiesgo = alumnos.filter((a) => a.riesgo !== "Bajo").length;

  return (
    <div className="dashboard-shell">
      <Sidebar role="Docente" userName={DOCENTE_NOMBRE} navItems={NAV_ITEMS} />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Panel de Docente</h1>
            <p className="page-subtitle">
              Bienvenido, {DOCENTE_NOMBRE.split(" ")[1]}. Seguimiento académico de tu grupo.
            </p>
          </div>
          <a href="#" className="btn btn-primary">📝 Registrar calificación</a>
        </div>

        {/* KPIs */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Alumnos en grupo</span>
              <div className="stat-card-icon" style={{ background: "rgba(236,72,153,0.12)", color: "#f472b6" }}>👥</div>
            </div>
            <div className="stat-card-value">{totalAlumnos}</div>
            <div className="stat-card-trend" style={{ color: "#94a3b8" }}>Grupo ISC-7A</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Promedio grupal</span>
              <div className="stat-card-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>📊</div>
            </div>
            <div className="stat-card-value" style={{ color: Number(promedioGrupal) >= 8 ? "var(--success)" : Number(promedioGrupal) >= 7 ? "var(--warning)" : "var(--danger)" }}>
              {promedioGrupal}
            </div>
            <div className="stat-card-trend trend-up">↑ +0.4 vs parcial anterior</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Alumnos en riesgo</span>
              <div className="stat-card-icon" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>⚠️</div>
            </div>
            <div className="stat-card-value" style={{ color: alumnosEnRiesgo > 0 ? "var(--warning)" : "var(--success)" }}>
              {alumnosEnRiesgo}
            </div>
            <div className="stat-card-trend" style={{ color: "var(--text-muted)" }}>
              {((alumnosEnRiesgo / totalAlumnos) * 100).toFixed(0)}% del grupo
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Aprobación</span>
              <div className="stat-card-icon" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>✅</div>
            </div>
            <div className="stat-card-value" style={{ color: "var(--success)" }}>
              {((alumnos.filter((a) => a.promedio >= 7).length / totalAlumnos) * 100).toFixed(0)}%
            </div>
            <div className="stat-card-trend trend-up">Índice de aprobación</div>
          </div>
        </div>

        <div className="grid-2">
          {/* Tabla de grupo */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📋 Lista del grupo</span>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{totalAlumnos} alumnos</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Matrícula</th>
                  <th>Promedio</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="name">{a.nombre}</div>
                      <div className="sub">{a.carrera} · {a.cuatrimestre}°</div>
                    </td>
                    <td style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>{a.matricula}</td>
                    <td>
                      <span className={`gpa-pill ${gpaClass(a.promedio)}`}>{a.promedio.toFixed(1)}</span>
                    </td>
                    <td>{riskBadge(a.riesgo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calificaciones recientes */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📝 Calificaciones recientes</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Materia</th>
                  <th>Cal.</th>
                </tr>
              </thead>
              <tbody>
                {CALIFICACIONES_MOCK.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="name" style={{ fontSize: "13px" }}>
                        {c.alumnoNombre.split(" ").slice(0, 2).join(" ")}
                      </div>
                      <div className="sub">{c.fecha}</div>
                    </td>
                    <td>
                      <span className="chip">{c.materia}</span>
                    </td>
                    <td>
                      <span className={`gpa-pill ${gpaClass(c.calificacion)}`}>{c.calificacion.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
