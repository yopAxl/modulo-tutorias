"use client";

// ─── PDF generation utilities ───────────────────────────────────────────────
// Uses jsPDF + jspdf-autotable for professional PDF generation

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Sesion, Alumno } from "./mock-data";
import { MOTIVOS_TUTORIA } from "./mock-data";

/** Helper to convert image URL to base64 */
const getImageBase64 = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
};

/** Generate R07-M01-01 tutoring session format as PDF */
export async function generateSesionPDF(sesion: Sesion, alumno: Alumno) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Try to load logo
  try {
    const logoBase64 = await getImageBase64("/Logo_ut.png");
    doc.addImage(logoBase64, "PNG", 14, 10, 25, 12);
  } catch (e) {
    console.warn("Logo not found for session PDF");
  }

  // Header Text
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Universidad Tecnológica de Nayarit", 42, 15);
  doc.text("Dirección de Vinculación y Extensión Universitaria", 42, 19);

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");

  // Info row
  const y1 = 35;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("CARRERA:", 14, y1);
  doc.setFont("helvetica", "normal");
  doc.text(alumno.carrera, 38, y1);

  doc.setFont("helvetica", "bold");
  doc.text("GRUPO:", pageW / 2 + 10, y1);
  doc.setFont("helvetica", "normal");
  doc.text(alumno.grupo, pageW / 2 + 30, y1);

  // Student name
  const y2 = y1 + 7;
  doc.setFont("helvetica", "bold");
  doc.text("NOMBRE DEL ALUMNO:", 14, y2);
  doc.setFont("helvetica", "normal");
  doc.text(alumno.nombre, 62, y2);

  // Date/time
  const y3 = y2 + 7;
  doc.setFont("helvetica", "bold");
  doc.text("FECHA:", 14, y3);
  doc.setFont("helvetica", "normal");
  doc.text(sesion.fecha, 32, y3);
  doc.setFont("helvetica", "bold");
  doc.text("HR. INICIO:", pageW / 3, y3);
  doc.setFont("helvetica", "normal");
  doc.text(sesion.horaInicio, pageW / 3 + 25, y3);
  doc.setFont("helvetica", "bold");
  doc.text("HR. SALIDA:", (pageW / 3) * 2, y3);
  doc.setFont("helvetica", "normal");
  doc.text(sesion.horaFin, (pageW / 3) * 2 + 25, y3);

  // Motivos
  const y4 = y3 + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("MOTIVO DE LA TUTORÍA:", 14, y4);

  let my = y4 + 6;
  doc.setFontSize(8);
  const cols = 5;
  const colW = (pageW - 28) / cols;
  MOTIVOS_TUTORIA.forEach((m, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 14 + col * colW;
    const yp = my + row * 6;
    const checked = sesion.motivos.includes(m.codigo);
    doc.setFont("helvetica", "normal");
    doc.text(`(${checked ? "X" : " "}) ${m.descripcion}`, x, yp);
  });

  // Lines
  const yPuntos = my + Math.ceil(MOTIVOS_TUTORIA.length / cols) * 6 + 4;
  doc.setDrawColor(200);
  doc.line(14, yPuntos, pageW - 14, yPuntos);

  // Puntos relevantes
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Puntos relevantes de la sesión", 14, yPuntos + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const temasText = Array.isArray(sesion.temas) ? sesion.temas.join(". ") : sesion.temas;
  const puntosLines = doc.splitTextToSize(temasText || "", pageW - 28);
  doc.text(puntosLines, 14, yPuntos + 12);

  // Compromisos
  const yComp = yPuntos + 12 + puntosLines.length * 5 + 10;
  doc.line(14, yComp, pageW - 14, yComp);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Compromisos y acuerdos", 14, yComp + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const acuLines = doc.splitTextToSize(sesion.acuerdos || "Sin acuerdos registrados.", pageW - 28);
  doc.text(acuLines, 14, yComp + 12);

  // Signatures
  const yFirma = doc.internal.pageSize.getHeight() - 40;
  doc.setDrawColor(0);
  doc.line(14, yFirma, 80, yFirma);
  doc.line(pageW - 80, yFirma, pageW - 14, yFirma);
  doc.setFontSize(8);
  doc.text("Firma del tutor", 14, yFirma + 5);
  doc.text("Firma del alumno", pageW - 80, yFirma + 5);

  // Footer info
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text("Formato R07-M01-01 | Sistema de Gestión de Tutorías - UTNay", 14, doc.internal.pageSize.getHeight() - 10);

  doc.save(`sesion_${alumno.matricula}_${sesion.fecha}.pdf`);
}

/** Generate a table-based report PDF */
export async function generateReportPDF(
  title: string,
  subtitle: string,
  headers: string[],
  rows: string[][],
  fileName: string
) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Try to load logo
  let logoBase64 = "";
  try {
    logoBase64 = await getImageBase64("/Logo_ut.png");
  } catch (e) {
    console.warn("Logo not found for report PDF");
  }

  // Styling
  const colorPrimary: [number, number, number] = [16, 185, 129]; // Emerald 500
  const colorSecondary: [number, number, number] = [31, 41, 55]; // Gray 800

  // Header function for each page
  const addHeader = (data: any) => {
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 14, 10, 25, 12);
    }
    
    doc.setFontSize(14);
    doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), 42, 17);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(subtitle, 42, 22);
    
    doc.setDrawColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.setLineWidth(0.5);
    doc.line(14, 28, pageW - 14, 28);
  };

  // Footer function for each page
  const addFooter = (data: any) => {
    const str = "Página " + doc.getNumberOfPages();
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    
    const dateStr = new Date().toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    doc.text(
      `Generado por Sistema de Tutorías - Universidad Tecnológica de Nayarit | ${dateStr}`,
      14,
      pageH - 10
    );
    
    doc.text(str, pageW - 25, pageH - 10);
  };

  // Table
  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: rows,
    margin: { top: 35, bottom: 20 },
    styles: {
      fontSize: 8,
      cellPadding: 4,
      font: "helvetica",
    },
    headStyles: {
      fillColor: colorPrimary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
    didDrawPage: (data) => {
      addHeader(data);
      addFooter(data);
    },
  });

  doc.save(fileName);
}

/** Generate the full student expediente as PDF */
export async function generateExpedientePDF(alumno: {
  matricula: string;
  nombre_completo: string;
  carrera: string;
  grupo: string;
  cuatrimestre: number;
  promedio_general: number;
  riesgo_academico: string;
  correo_institucional: string;
  telefono: string;
  genero: string;
}, calificaciones: {
  asignatura: string;
  periodo: string;
  calificacion: number;
  tipo_evaluacion: string;
}[], sesiones: {
  fecha: string;
  estatus: string;
  nivel_urgencia: string;
  puntos_relevantes: string | null;
}[]) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const colorPrimary: [number, number, number] = [16, 185, 129];
  const colorDark: [number, number, number] = [31, 41, 55];

  // Try to load logo
  try {
    const logoBase64 = await getImageBase64("/Logo_ut.png");
    doc.addImage(logoBase64, "PNG", 14, 10, 25, 12);
  } catch (e) {
    console.warn("Logo not available");
  }

  // ---------- Encabezado ----------
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Universidad Tecnológica de Nayarit", 42, 14);
  doc.text("Sistema de Gestión de Tutorías", 42, 18);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text("EXPEDIENTE ACADÉMICO DEL ALUMNO", pageW / 2, 26, { align: "center" });

  doc.setDrawColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.setLineWidth(0.6);
  doc.line(14, 30, pageW - 14, 30);

  // ---------- Datos del alumno ----------
  let y = 38;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text("DATOS PERSONALES", 14, y);
  y += 5;

  const fields: [string, string][] = [
    ["Matrícula", alumno.matricula],
    ["Nombre completo", alumno.nombre_completo],
    ["Carrera", alumno.carrera],
    ["Grupo", alumno.grupo],
    ["Cuatrimestre", `${alumno.cuatrimestre}°`],
    ["Correo institucional", alumno.correo_institucional],
    ["Teléfono", alumno.telefono],
    ["Género", alumno.genero === "M" ? "Masculino" : alumno.genero === "F" ? "Femenino" : "Otro"],
    ["Promedio general", Number(alumno.promedio_general).toFixed(2)],
    ["Nivel de riesgo académico", alumno.riesgo_academico.toUpperCase()],
  ];

  doc.setFontSize(8);
  fields.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.text(value, 70, y);
    y += 6;
  });

  y += 4;

  // ---------- Calificaciones ----------
  if (calificaciones.length > 0) {
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(14, y, pageW - 14, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.text(`CALIFICACIONES (${calificaciones.length} registros)`, 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Asignatura", "Período", "Calificación", "Tipo"]],
      body: calificaciones.map((c) => [
        c.asignatura,
        c.periodo,
        Number(c.calificacion).toFixed(1),
        c.tipo_evaluacion.toUpperCase(),
      ]),
      styles: { fontSize: 7, cellPadding: 3 },
      headStyles: { fillColor: colorPrimary, textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ---------- Historial de sesiones ----------
  if (sesiones.length > 0) {
    if (y > pageH - 60) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.text(`HISTORIAL DE SESIONES DE TUTORÍA (${sesiones.length})`, 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Fecha", "Estatus", "Urgencia", "Observaciones"]],
      body: sesiones.map((s) => [
        s.fecha,
        s.estatus.toUpperCase(),
        s.nivel_urgencia.toUpperCase(),
        s.puntos_relevantes?.slice(0, 60) ?? "—",
      ]),
      styles: { fontSize: 7, cellPadding: 3 },
      headStyles: { fillColor: colorPrimary, textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });
  }

  // ---------- Pie de página ----------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    const fecha = new Date().toLocaleString("es-MX", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    doc.text(
      `Expediente generado el ${fecha} | Sistema de Tutorías UTNay | Documento confidencial`,
      14,
      pageH - 8
    );
    doc.text(`${i} / ${totalPages}`, pageW - 20, pageH - 8);
  }

  doc.save(`expediente_${alumno.matricula}.pdf`);
}
