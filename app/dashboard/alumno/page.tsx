import Sidebar from "@/app/_components/Sidebar";
import { ALUMNOS, SESIONES, formatFecha, gpaClass } from "@/app/_lib/mock-data";

const ALUMNO_ID = "a1";
const alumno = ALUMNOS.find((a) => a.id === ALUMNO_ID)!;
const mySesiones = SESIONES.filter((s) => s.alumnoId === ALUMNO_ID);

const NAV_ITEMS = [
  { icon: "📊", label: "Mi panel", href: "/dashboard/alumno" },
  { icon: "📅", label: "Mis sesiones", href: "/dashboard/alumno/sesiones" },
  { icon: "📁", label: "Mi expediente", href: "/dashboard/alumno/expediente" },
  { icon: "📄", label: "Documentos", href: "/dashboard/alumno/documentos" },
];

const DOCUMENTOS_MOCK = [
  { id: "doc1", nombre: "Comprobante de inscripción", tipo: "PDF", fecha: "2026-01-10", estado: "Aprobado" },
  { id: "doc2", nombre: "Historial académico", tipo: "PDF", fecha: "2026-01-15", estado: "Aprobado" },
  { id: "doc3", nombre: "Justificante médico – Feb 2026", tipo: "PDF", fecha: "2026-02-20", estado: "Pendiente" },
];

export default function AlumnoDashboard() {
  const sesionesCount = mySesiones.length;

  const riesgoColor =
    alumno.riesgo === "Alto"
      ? "var(--danger)"
      : alumno.riesgo === "Medio"
      ? "var(--warning)"
      : "var(--success)";

  const riesgoIcon = alumno.riesgo === "Alto" ? "🔴" : alumno.riesgo === "Medio" ? "🟡" : "🟢";

  return (
    <div className="dashboard-shell">
      <Sidebar role="Alumno" userName={alumno.nombre} navItems={NAV_ITEMS} />

      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Mi Panel Académico</h1>
            <p className="page-subtitle">
              Hola, {alumno.nombre.split(" ")[0]}. Aquí puedes ver tu seguimiento académico.
            </p>
          </div>
          <a href="#" className="btn btn-ghost">📥 Descargar expediente</a>
        </div>

        {/* KPIs */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Mi promedio</span>
              <div className="stat-card-icon" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>📊</div>
            </div>
            <div className="stat-card-value" style={{ color: gpaClass(alumno.promedio) === "gpa-high" ? "var(--success)" : gpaClass(alumno.promedio) === "gpa-mid" ? "var(--warning)" : "var(--danger)" }}>
              {alumno.promedio.toFixed(1)}
            </div>
            <div className="stat-card-trend" style={{ color: "var(--text-muted)" }}>Promedio general acumulado</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Sesiones con tutor</span>
              <div className="stat-card-icon" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}>📅</div>
            </div>
            <div className="stat-card-value">{sesionesCount}</div>
            <div className="stat-card-trend" style={{ color: "var(--text-muted)" }}>Este cuatrimestre</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Estado académico</span>
              <div className="stat-card-icon" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>⚠️</div>
            </div>
            <div className="stat-card-value" style={{ fontSize: "22px", color: riesgoColor }}>
              {riesgoIcon} {alumno.riesgo}
            </div>
            <div className="stat-card-trend" style={{ color: "var(--text-muted)" }}>Nivel de riesgo académico</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Documentos</span>
              <div className="stat-card-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>📁</div>
            </div>
            <div className="stat-card-value">{DOCUMENTOS_MOCK.length}</div>
            <div className="stat-card-trend" style={{ color: "var(--text-muted)" }}>
              {DOCUMENTOS_MOCK.filter((d) => d.estado === "Pendiente").length} pendientes de revisión
            </div>
          </div>
        </div>

        {/* Info + sesiones */}
        <div className="grid-2">
          {/* Datos personales / académicos */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🎓 Mi información académica</span>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                ["Matrícula", alumno.matricula],
                ["Nombre completo", alumno.nombre],
                ["Carrera", alumno.carrera],
                ["Cuatrimestre", `${alumno.cuatrimestre}°`],
                ["Correo institucional", alumno.correo],
                ["Teléfono", alumno.telefono],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 600, fontFamily: label === "Matrícula" ? "monospace" : "inherit" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mis sesiones */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📋 Mis sesiones de tutoría</span>
            </div>
            <div className="card-body" style={{ padding: "4px 24px" }}>
              {mySesiones.length > 0 ? mySesiones.map((s) => (
                <div key={s.id} className="session-item">
                  <div className="session-dot">📝</div>
                  <div className="session-info">
                    <div className="session-name">{s.temas[0]}</div>
                    <div className="session-topics">{s.temas.slice(1).join(" · ")}</div>
                    <div className="session-meta">
                      <span className="session-tag">📅 {formatFecha(s.fecha)}</span>
                      <span className="session-tag">⏱ {s.duracionMin} min</span>
                    </div>
                    {s.acuerdos && (
                      <div style={{ marginTop: "6px", fontSize: "12px", color: "var(--accent-light)", background: "var(--accent-dim)", borderRadius: "6px", padding: "6px 8px" }}>
                        💡 {s.acuerdos}
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="empty-state">Sin sesiones registradas aún.</div>
              )}
            </div>
          </div>
        </div>

        {/* Documentos */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📁 Mis documentos</span>
            <a href="#" className="card-action">Subir documento →</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Tipo</th>
                <th>Fecha de carga</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {DOCUMENTOS_MOCK.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="name">{d.nombre}</div>
                  </td>
                  <td><span className="chip">{d.tipo}</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{d.fecha}</td>
                  <td>
                    <span
                      className="risk-badge"
                      style={
                        d.estado === "Aprobado"
                          ? { background: "var(--success-dim)", color: "var(--success)" }
                          : { background: "var(--warning-dim)", color: "var(--warning)" }
                      }
                    >
                      {d.estado === "Aprobado" ? "✅" : "⏳"} {d.estado}
                    </span>
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
