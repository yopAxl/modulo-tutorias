"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X, ArrowRightLeft, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateCanalizacionAction, updateIncidenciaAction } from "../actions";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "canalizacion" | "incidencia";
  item: any;
  onSuccess?: () => void;
}

export function EditFollowUpModal({ isOpen, onClose, type, item, onSuccess }: EditFollowUpModalProps) {
  const [loading, setLoading] = useState(false);
  const [estatus, setEstatus] = useState("");
  const [extraValue, setExtraValue] = useState(""); // seguimiento o resolucion
  const router = useRouter();

  useEffect(() => {
    if (item) {
      setEstatus(item.estatus || "");
      setExtraValue(type === "canalizacion" ? (item.seguimiento || "") : (item.resolucion || ""));
    }
  }, [item, type, isOpen]);

  async function handleSave() {
    if (!item) return;
    setLoading(true);
    try {
      let res;
      if (type === "canalizacion") {
        res = await updateCanalizacionAction(item.id, {
          estatus,
          seguimiento: extraValue
        });
      } else {
        res = await updateIncidenciaAction(item.id, {
          estatus,
          resolucion: extraValue
        });
      }

      if (res.success) {
        toast.success("Información actualizada correctamente");
        if (onSuccess) onSuccess();
        onClose();
        router.refresh();
      } else {
        toast.error(res.error || "Error al actualizar");
      }
    } catch (error) {
      toast.error("Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (!item) return null;

  const isCan = type === "canalizacion";
  const themeColor = isCan ? "cyan" : "amber";
  const Icon = isCan ? ArrowRightLeft : AlertTriangle;

  const estatusLabels: Record<string, string> = {
    // Canalización
    pendiente: "Pendiente",
    en_atencion: "En atención",
    concluida: "Concluida",
    cancelada: "Cancelada",
    // Incidencia
    abierta: "Abierta",
    en_proceso: "En proceso",
    cerrada: "Cerrada",
    archivada: "Archivada",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className={cn(
        "ring-0 border border-white/5 bg-[#0f1721] text-white sm:max-w-[450px] overflow-hidden p-0 shadow-2xl backdrop-blur-xl",
        isCan ? "shadow-cyan-500/5" : "shadow-amber-500/5"
      )}>
        {/* Header Decorativo */}
        <div className={cn(
          "h-1 w-full bg-gradient-to-r",
          isCan ? "from-cyan-500 to-blue-600" : "from-amber-500 to-orange-600"
        )} />

        <div className="p-6">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner",
                isCan ? "bg-cyan-500/10 text-cyan-400" : "bg-amber-500/10 text-amber-400"
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-white/90">
                  Gestionar {isCan ? "Canalización" : "Incidencia"}
                </DialogTitle>
                <p className="text-[11px] text-white/30 uppercase tracking-widest font-semibold mt-0.5">Módulo de Seguimiento</p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Estado Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <CheckCircle2 className={cn("h-3.5 w-3.5", isCan ? "text-cyan-400/60" : "text-amber-400/60")} />
                <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Estado del Proceso
                </Label>
              </div>
              <Select key={`${type}-${item?.id}`} value={estatus} onValueChange={(val) => setEstatus(val ?? "")}>
                <SelectTrigger className="w-full h-11 rounded-lg border-white/8 bg-white/4 px-4 text-sm text-white outline-none transition-all">
                  <SelectValue placeholder="Seleccionar estado">
                    {estatusLabels[estatus] || estatus}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#0f1721] text-white">
                  {isCan ? (
                    <>
                      <SelectItem value="pendiente" >Pendiente</SelectItem>
                      <SelectItem value="en_atencion">En atención</SelectItem>
                      <SelectItem value="concluida">Concluida</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="abierta">Abierta</SelectItem>
                      <SelectItem value="en_proceso">En proceso</SelectItem>
                      <SelectItem value="cerrada">Cerrada</SelectItem>
                      <SelectItem value="archivada">Archivada</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Detalle Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <FileText className={cn("h-3.5 w-3.5", isCan ? "text-cyan-400/60" : "text-amber-400/60")} />
                <Label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  {isCan ? "Registro de Seguimiento" : "Detalle de Resolución"}
                </Label>
              </div>
              <textarea
                value={extraValue}
                onChange={(e) => setExtraValue(e.target.value)}
                rows={5}
                className={cn(
                  "w-full rounded-lg border border-white/8 bg-white/4 p-4 text-sm text-white placeholder:text-white/20 outline-none transition-all resize-none",
                  isCan ? "focus:border-cyan-500/40" : "focus:border-amber-500/40"
                )}
                placeholder={isCan ? "Describa el seguimiento realizado..." : "Describa la resolución de la incidencia..."}
              />
            </div>
          </div>

          <DialogFooter className="mt-10 flex items-center justify-end gap-3 pt-6 border-t border-white/5">
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-10 px-6 text-white/40 hover:bg-white/5 hover:text-white rounded-lg text-xs font-bold uppercase tracking-widest"
            >
              Cerrar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className={cn(
                "h-10 px-8 font-bold text-white rounded-lg shadow-lg text-xs uppercase tracking-widest transition-all active:scale-95",
                isCan ? "bg-cyan-600 hover:bg-cyan-500" : "bg-amber-600 hover:bg-amber-500"
              )}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
