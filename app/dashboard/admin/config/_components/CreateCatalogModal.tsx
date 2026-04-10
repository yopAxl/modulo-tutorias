"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCatalogEntryAction } from "../actions";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Bookmark, FileText, ListOrdered } from "lucide-react";

interface CreateCatalogModalProps {
  tableName: string;
  title: string;
  onSuccess?: () => void;
  hasOrder?: boolean;
}

export function CreateCatalogModal({ tableName, title, onSuccess, hasOrder = false }: CreateCatalogModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(formData: FormData) {
    const e: Record<string, string> = {};
    const codigo = formData.get("codigo") as string;
    const descripcion = formData.get("descripcion") as string;
    
    if (!codigo) e.codigo = "El código es requerido";
    if (!descripcion) e.descripcion = "La descripción es requerida";
    
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    const data: any = {
      codigo,
      descripcion,
      activo: true
    };

    if (hasOrder) {
      data.orden = parseInt(formData.get("orden") as string) || 0;
    }

    const result = await createCatalogEntryAction(tableName, data);

    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Registro añadido exitosamente.");
      setOpen(false);
      setErrors({});
      if (onSuccess) onSuccess();
    }
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        size="sm" 
        variant="outline" 
        className="gap-1.5 border-white/10 bg-white/4 text-xs text-white/50 hover:bg-white/8 hover:text-white transition-all shadow-sm"
      >
        <Plus className="h-3 w-3 text-emerald-400" /> Agregar
      </Button>

      <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setErrors({}); }}>
        <DialogContent className="border border-white/5 bg-[#0f151c] text-white sm:max-w-md p-0 overflow-hidden shadow-2xl shadow-emerald-900/10 sm:rounded-2xl outline-none ring-0">
          <div className="p-6 md:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                Nuevo {title}
              </DialogTitle>
              <DialogDescription className="text-white/50 text-xs mt-1">
                Añade una nueva opción al catálogo del sistema. Asegúrate de que el código sea único.
              </DialogDescription>
            </DialogHeader>

            <form action={onSubmit} className="space-y-5">
              <div className="space-y-1.5 flex flex-col">
                <Label htmlFor="codigo" className="text-[10px] font-bold uppercase tracking-widest text-white/30">Código Identificador</Label>
                <div className="relative">
                  <Bookmark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                  <Input 
                    id="codigo" 
                    name="codigo" 
                    className={`h-11 rounded-xl border bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-all focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40 ${errors.codigo ? "border-red-500/40" : "border-white/8"}`} 
                    placeholder="Ej. bajo_rendimiento" 
                  />
                </div>
                {errors.codigo && <span className="text-[10px] font-medium text-red-400 ml-1 mt-1">{errors.codigo}</span>}
              </div>

              <div className="space-y-1.5 flex flex-col">
                <Label htmlFor="descripcion" className="text-[10px] font-bold uppercase tracking-widest text-white/30">Descripción Visible</Label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                  <Input 
                    id="descripcion" 
                    name="descripcion" 
                    className={`h-11 rounded-xl border bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-all focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40 ${errors.descripcion ? "border-red-500/40" : "border-white/8"}`} 
                    placeholder="Ej. Bajo Rendimiento Académico" 
                  />
                </div>
                {errors.descripcion && <span className="text-[10px] font-medium text-red-400 ml-1 mt-1">{errors.descripcion}</span>}
              </div>

              {hasOrder && (
                <div className="space-y-1.5 flex flex-col">
                  <Label htmlFor="orden" className="text-[10px] font-bold uppercase tracking-widest text-white/30">Orden de Visualización</Label>
                  <div className="relative">
                    <ListOrdered className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                    <Input 
                      id="orden" 
                      name="orden" 
                      type="number"
                      className="h-11 rounded-xl border border-white/8 bg-white/4 text-sm text-white pl-10 placeholder:text-white/20 transition-all focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/40" 
                      placeholder="Ej. 1" 
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setOpen(false)} 
                  className="h-10 px-4 text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="h-10 px-6 text-xs font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 rounded-xl hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  {loading ? "Añadiendo..." : `Añadir a Catálogo`}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
