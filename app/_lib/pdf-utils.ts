"use client";

// ─── PDF generation utilities ───────────────────────────────────────────────
// Uses jsPDF + jspdf-autotable for professional PDF generation

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Sesion, Alumno } from "./mock-data";
import { MOTIVOS_TUTORIA } from "./mock-data";

/** Generate R07-M01-01 tutoring session format as PDF */
export function generateSesionPDF(sesion: Sesion, alumno: Alumno) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Gobierno del Estado de Nayarit", 14, 15);
  doc.text("Organismo Público Descentralizado", 14, 19);

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");

  // Info row
  const y1 = 28;
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
  doc.setDrawColor(0);
  doc.line(14, yPuntos, pageW - 14, yPuntos);

  // Puntos relevantes
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Puntos relevantes de la sesión", 14, yPuntos + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const puntosLines = doc.splitTextToSize(sesion.temas.join(". "), pageW - 28);
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
  const yFirma = yComp + 12 + acuLines.length * 5 + 20;
  doc.line(14, yFirma, 80, yFirma);
  doc.line(pageW - 80, yFirma, pageW - 14, yFirma);
  doc.setFontSize(8);
  doc.text("Firma del tutor", 14, yFirma + 5);
  doc.text("Firma del alumno", pageW - 80, yFirma + 5);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text("R07-M01-01", pageW - 28, doc.internal.pageSize.getHeight() - 10);

  doc.save(`sesion_${alumno.matricula}_${sesion.fecha}.pdf`);
}

/** Generate a table-based report PDF */
export function generateReportPDF(
  title: string,
  subtitle: string,
  headers: string[],
  rows: string[][],
  fileName: string
) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 20);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(subtitle, 14, 27);

  doc.setTextColor(0);

  // Table
  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: rows,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text(
    `Sistema de Tutorías — UTNay · Generado: ${new Date().toLocaleDateString("es-MX")}`,
    14,
    pageH - 10
  );

  doc.save(fileName);
}
