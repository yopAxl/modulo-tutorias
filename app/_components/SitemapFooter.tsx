"use client";

import Link from "next/link";
import { GraduationCap, Mail, Globe, Book, Shield, ExternalLink, Link2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const SITEMAP_DATA = [
  {
    title: "Plataforma",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Sesiones", href: "#" },
      { label: "Expedientes", href: "#" },
      { label: "Reportes", href: "#" },
    ],
  },
  {
    title: "Universidad",
    links: [
      { label: "Portal UTN", href: "https://www.utnay.edu.mx", external: true },
      { label: "Correo Institucional", href: "https://outlook.office.com", external: true },
      { label: "Biblioteca Digital", href: "#", external: true },
      { label: "Calendario Escolar", href: "#", external: true },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Manual de Tutor", href: "#" },
      { label: "Guía de Usuario", href: "#" },
      { label: "Preguntas Frecuentes", href: "#" },
      { label: "Soporte Técnico", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Aviso de Privacidad", href: "#" },
      { label: "Términos de Uso", href: "#" },
      { label: "Reglamento", href: "#" },
    ],
  },
];

export default function SitemapFooter() {
  return (
    <footer className="mt-auto w-full border-t border-white/6 bg-[#0f151c]/50 py-12 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 shadow-lg shadow-emerald-600/20">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">TutorTrack</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              Sistema integral de seguimiento académico y gestión de tutorías para la UTN.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-white/30 hover:text-emerald-400 transition-colors">
                <Link2 className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white/30 hover:text-emerald-400 transition-colors">
                <MessageSquare className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white/30 hover:text-emerald-400 transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Sitemap Columns */}
          {SITEMAP_DATA.map((section) => (
            <div key={section.title} className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/20">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      className="group flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                      {link.external && (
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Universidad Tecnológica de Nayarit. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-[11px] font-medium text-white/30 hover:text-white/70 transition-colors">
              Poliíticas de cookies
            </Link>
            <Link href="#" className="text-[11px] font-medium text-white/30 hover:text-white/70 transition-colors">
              Mapa del sitio
            </Link>
            <Link href="#" className="text-[11px] font-medium text-white/30 hover:text-white/70 transition-colors">
              Accesibilidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
