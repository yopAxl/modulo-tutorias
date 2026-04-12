"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, FileText, X, Plus, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import SitemapFooter from "@/app/_components/SitemapFooter";
import {
  getAlumnoPerfil,
  getDocumentosAlumno,
  getDocumentoUrl,
  subirDocumentoAlumno,
  type AlumnoPerfil,
  type DocumentoAlumno,
} from "../actions";
import { useI18n } from "@/app/_i18n/context";

export default function DocumentosAlumnoPage() {
  const { t } = useI18n();
  const [alumno, setAlumno] = useState<AlumnoPerfil | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoAlumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Formulario de subida
  const [tipoDoc, setTipoDoc] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const NAV_ITEMS = [
    { icon: "📊", label: t("nav.alumno.dashboard"), href: "/dashboard/alumno" },
    { icon: "📅", label: t("nav.alumno.sessions"), href: "/dashboard/alumno/sesiones" },
    { icon: "📁", label: t("nav.alumno.record"), href: "/dashboard/alumno/expediente" },
    { icon: "📄", label: t("nav.alumno.documents"), href: "/dashboard/alumno/documentos" },
  ];

  const TIPOS_DOCUMENTO = [
    { codigo: "kardex", descripcion: t("alumno.docsPage.docTypes.kardex") },
    { codigo: "constancia", descripcion: t("alumno.docsPage.docTypes.constancia") },
    { codigo: "plan_accion", descripcion: t("alumno.docsPage.docTypes.plan_accion") },
    { codigo: "justificante", descripcion: t("alumno.docsPage.docTypes.justificante") },
    { codigo: "otro", descripcion: t("alumno.docsPage.docTypes.otro") },
  ];

  useEffect(() => {
    async function cargar() {
      const [perfilRes, docsRes] = await Promise.all([
        getAlumnoPerfil(),
        getDocumentosAlumno(),
      ]);

      if ("data" in perfilRes) setAlumno(perfilRes.data);
      else toast.error("Error al cargar perfil: " + perfilRes.error);

      if ("data" in docsRes) setDocumentos(docsRes.data);
      else toast.error("Error al cargar documentos: " + (docsRes as any).error);

      // Check if URL has ?upload=true to open the form automatically
      const isUpload = new URLSearchParams(window.location.search).get("upload") === "true";
      if (isUpload) {
        setShowUpload(true);
        window.history.replaceState(null, "", window.location.pathname);
      }

      setLoading(false);
    }
    cargar();
  }, []);

  const handleSubir = async () => {
    if (!selectedFile || !tipoDoc) {
      toast.error(t("alumno.docsPage.requiredFields"));
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("archivo", selectedFile);
    formData.append("tipo_documento", tipoDoc);
    formData.append("nombre_archivo", descripcion || selectedFile.name);

    const result = await subirDocumentoAlumno(formData);
    if ("success" in result) {
      toast.success(t("alumno.docsPage.uploadSuccess"));
      setShowUpload(false);
      setSelectedFile(null);
      setTipoDoc("");
      setDescripcion("");
      // Refetch documentos
      const docsRes = await getDocumentosAlumno();
      if ("data" in docsRes) setDocumentos(docsRes.data);
    } else {
      toast.error("Error al subir: " + result.error);
    }
    setUploading(false);
  };

  const handleDescargar = async (doc: DocumentoAlumno) => {
    setDownloadingId(doc.id);
    const result = await getDocumentoUrl(doc.storage_path, doc.storage_bucket);
    if ("url" in result) {
      window.open(result.url, "_blank");
    } else {
      toast.error("Error al obtener enlace: " + result.error);
    }
    setDownloadingId(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f151c]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar
        role="Alumno"
        userName={alumno?.nombre_completo ?? "Alumno"}
        navItems={NAV_ITEMS}
      />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title={t("alumno.docsPage.title")}
          subtitle={t("alumno.docsPage.subtitle", { count: documentos.length })}
          actions={
            <Button
              size="sm"
              onClick={() => setShowUpload(!showUpload)}
              className="gap-2 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
            >
              <Upload className="h-4 w-4" /> {t("alumno.docsPage.uploadButton")}
            </Button>
          }
        />

        {/* Formulario de subida */}
        {showUpload && (
          <SectionCard>
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">{t("alumno.docsPage.uploadTitle")}</p>
              <button
                onClick={() => { setShowUpload(false); setSelectedFile(null); }}
                className="text-white/30 hover:text-white/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              {/* Tipo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {t("alumno.docsPage.docType")}
                </label>
                <select
                  value={tipoDoc}
                  onChange={(e) => setTipoDoc(e.target.value)}
                  className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40 appearance-none"
                >
                  <option value="">{t("alumno.docsPage.docTypePlaceholder")}</option>
                  {TIPOS_DOCUMENTO.map((td) => (
                    <option key={td.codigo} value={td.codigo}>{td.descripcion}</option>
                  ))}
                </select>
              </div>
              {/* Descripción */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {t("alumno.docsPage.docName")}
                </label>
                <input
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40"
                  placeholder={t("alumno.docsPage.docNamePlaceholder")}
                />
              </div>
              {/* Zona de archivos */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {t("alumno.docsPage.fileLabel")}
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/2 px-6 py-8 transition-colors hover:border-emerald-500/30 cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Upload className="h-8 w-8 text-white/20" />
                    {selectedFile ? (
                      <p className="text-sm text-emerald-400 font-medium">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-white/40">{t("alumno.docsPage.fileDrag")}</p>
                        <p className="text-xs text-white/20">{t("alumno.docsPage.fileFormats")}</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      if (file && file.size > 10 * 1024 * 1024) {
                        toast.error(t("alumno.docsPage.fileTooLarge"));
                        return;
                      }
                      setSelectedFile(file);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-end gap-2 sm:col-span-2">
                <Button
                  size="sm"
                  onClick={handleSubir}
                  disabled={uploading}
                  className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {uploading ? t("alumno.docsPage.uploading") : t("alumno.docsPage.uploadButton")}
                </Button>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Tabla de Documentos */}
        <SectionCard>
          <div className="border-b border-white/6 px-5 py-4">
            <p className="text-sm font-semibold text-white">{t("alumno.docsPage.available")}</p>
            <p className="text-xs text-white/40">{t("alumno.docsPage.visibleOnly")}</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{t("alumno.docs.headers.document")}</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30 text-center">{t("alumno.docs.headers.type")}</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{t("alumno.docs.headers.date")}</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30 text-right">{t("common.download")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.map((d) => (
                <TableRow key={d.id} className="border-white/4 hover:bg-white/3">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-white/30" />
                      <span className="text-sm font-medium text-white/80">{d.nombre_archivo}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/40 border border-white/10 uppercase">
                      {d.tipo_documento}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-white/50">
                    {new Date(d.created_at).toLocaleDateString("es-MX", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleDescargar(d)}
                      disabled={downloadingId === d.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/10 px-3 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-600/20 transition-all disabled:opacity-40"
                    >
                      {downloadingId === d.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ExternalLink className="h-3 w-3" />
                      )}
                      {downloadingId === d.id ? t("alumno.docsPage.opening") : t("alumno.docsPage.viewDownload")}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {documentos.length === 0 && (
            <p className="py-10 text-center text-sm text-white/30 italic">
              {t("alumno.docsPage.noDocsUpload")}
            </p>
          )}
        </SectionCard>

        <div className="-mx-4 -mb-4 md:-mx-8 md:-mb-8 mt-12">
          <SitemapFooter />
        </div>
      </main>
    </div>
  );
}