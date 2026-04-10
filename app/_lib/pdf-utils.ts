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
