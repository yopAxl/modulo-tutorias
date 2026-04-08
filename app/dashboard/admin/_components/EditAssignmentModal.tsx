"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUsersAction, updateAssignmentAction } from "../actions";

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Edit3, GraduationCap, ArrowRight } from "lucide-react";

interface EditAssignmentModalProps {
  assignmentIds: string[];
  studentNames: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditAssignmentModal({ assignmentIds, studentNames, isOpen, onClose, onSuccess }: EditAssignmentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingTutores, setFetchingTutores] = useState(false);
  const [newTutorId, setNewTutorId] = useState<string>("");
  const [allTutores, setAllTutores] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadTutores();
    }
  }, [isOpen]);

  async function loadTutores() {
    setFetchingTutores(true);
    try {
      const res = await getUsersAction();
      if (res.data) {
        // En el nuevo formato, res.data es { users, assignments }
        const users = (res.data as any).users || [];
        setAllTutores(users.filter((u: any) => u.rol === "Tutor"));
      }
    } catch (err) {
      toast.error("Error al cargar la lista de tutores.");
    } finally {
      setFetchingTutores(false);
    }
  }

  async function handleUpdate() {
    if (!newTutorId) {
      toast.error("Selecciona un nuevo tutor.");
      return;
    }

    setLoading(true);
    let successCount = 0;
    try {
      // Procesamos secuencialmente para simplicidad y evitar saturar el servidor
      for (const id of assignmentIds) {
        const res = await updateAssignmentAction(id, newTutorId);
        if (!res.error) successCount++;
      }

      if (successCount > 0) {
        toast.success(`Se actualizaron ${successCount} asignaciones.`);
        if (onSuccess) onSuccess();
        onClose();
        router.refresh();
      } else {
        toast.error("No se pudo actualizar ninguna asignación.");
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="border border-white/5 bg-[#0f151c] text-white sm:max-w-md p-0 overflow-hidden shadow-2xl sm:rounded-2xl outline-none ring-0">
        <div className="flex flex-col">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold text-emerald-500 flex items-center gap-2">
              <Edit3 className="h-5 w-5" /> Re-asignar Tutoría
            </DialogTitle>
            <DialogDescription className="text-white/50 text-xs">
              Mueve a los alumnos seleccionados a un nuevo tutor responsable.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Resumen de alumnos */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Alumnos a re-asignar</Label>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10">
                <ul className="space-y-1">
                  {studentNames.map((name, i) => (
                    <li key={i} className="text-xs text-white/70 flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-emerald-500/50" />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-center py-2 animate-pulse">
              <ArrowRight className="h-4 w-4 text-white/20 rotate-90 sm:rotate-0" />
            </div>

            {/* Nuevo Tutor */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Nuevo Tutor Responsable</Label>
              <Select value={newTutorId} onValueChange={(val) => setNewTutorId(val || "")}>
                <SelectTrigger className="h-11 rounded-xl border border-white/8 bg-white/4 text-sm text-white focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/40">
                  <SelectValue placeholder={fetchingTutores ? "Cargando..." : "Elegir tutor"}>
                    {newTutorId ? allTutores.find(t => t.id === newTutorId)?.nombre : "Elegir tutor"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#151c24] border-white/10 text-white">
                  {allTutores.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-6 border-t border-white/10 bg-white/[0.01] flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1 h-11 text-white/60 hover:text-white hover:bg-white/5 rounded-xl text-xs font-bold">
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={loading || !newTutorId || fetchingTutores} 
              className="flex-1 h-11 font-bold bg-emerald-500 text-[#1a1a1a] shadow-lg shadow-emerald-500/25 rounded-xl hover:bg-emerald-400 transition-all text-xs"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Actualizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
