"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUsersAction, assignTutorAction } from "../actions";

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Users, Loader2, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface AssignTutorModalProps {
  onSuccess?: () => void;
}

export function AssignTutorModal({ onSuccess }: AssignTutorModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  
  const [tutorId, setTutorId] = useState<string>("");
  const [selectedAlumnoIds, setSelectedAlumnoIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [allTutores, setAllTutores] = useState<any[]>([]);
  const [allAlumnos, setAllAlumnos] = useState<any[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  async function loadData() {
    setFetchingData(true);
    try {
      const res = await getUsersAction();
      if (res.data) {
        const { users, assignments } = res.data as any;
        setAllTutores(users.filter((u: any) => u.rol === "Tutor"));
        setAllAlumnos(users.filter((u: any) => u.rol === "Alumno"));
        setActiveAssignments(assignments || []);
      }
    } catch (err) {
      toast.error("Error al cargar la lista de usuarios.");
    } finally {
      setFetchingData(false);
    }
  }

  const filteredAlumnos = useMemo(() => {
    return allAlumnos.filter(a => 
      a.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.correo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allAlumnos, searchQuery]);

  async function handleAssign() {
    if (!tutorId) {
      toast.error("Por favor selecciona un tutor.");
      return;
    }
    if (selectedAlumnoIds.length === 0) {
      toast.error("Selecciona al menos un alumno.");
      return;
    }

    setLoading(true);
    const result = await assignTutorAction(tutorId, selectedAlumnoIds);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      const res = result as any;
      if (res.count > 0 && res.skipped > 0) {
        toast.success(`Éxito: ${res.count} asignados. ${res.skipped} ya estaban vinculados.`);
      } else if (res.count > 0) {
        toast.success(`Asignación completada: ${res.count} alumnos asignados.`);
      } else {
        toast.info("Los alumnos seleccionados ya estaban asignados a este tutor.");
      }
      setOpen(false);
      setSelectedAlumnoIds([]);
      setTutorId("");
      if (onSuccess) onSuccess();
      router.refresh();
    }
  }

  function toggleAlumno(id: string) {
    setSelectedAlumnoIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function selectAll() {
    // Solo seleccionar alumnos que NO tengan tutor asignado actualmente
    const availableIds = filteredAlumnos
      .filter(a => !activeAssignments.some(asig => asig.alumno_id === a.id))
      .map(a => a.id);
    setSelectedAlumnoIds(availableIds);
  }

  function deselectAll() {
    setSelectedAlumnoIds([]);
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        size="sm" 
        className="gap-2 bg-amber-500 text-[#1a1a1a] font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors"
      >
        <UserPlus className="h-4 w-4" /> Asignar tutor
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border border-white/5 bg-[#0f151c] text-white sm:max-w-2xl p-0 overflow-hidden shadow-2xl sm:rounded-2xl outline-none ring-0">
          <div className="flex flex-col max-h-[90vh]">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-2xl font-bold text-amber-500 flex items-center gap-2">
                <Users className="h-6 w-6" /> Asignación de Tutoría
              </DialogTitle>
              <DialogDescription className="text-white/50 text-sm">
                Selecciona un tutor y los alumnos que deseas asignarle. Este proceso actualizará las asignaciones activas.
              </DialogDescription>
            </DialogHeader>

            {fetchingData ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
                <p className="text-sm text-white/40 italic">Cargando datos institucionales...</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-white/40">1. Seleccionar Tutor</Label>
                  <Select 
                    value={tutorId} 
                    onValueChange={(val) => {
                      if (val) {
                        setTutorId(val);
                        // Limpiar selección de alumnos que ya están asignados a este nuevo tutor
                        setSelectedAlumnoIds(prev => prev.filter(id => 
                          !activeAssignments.some(as => as.tutor_id === val && as.alumno_id === id)
                        ));
                      }
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl border border-white/8 bg-white/4 text-sm text-white focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500/40">
                      <SelectValue placeholder="Elegir tutor responsable">
                        {tutorId ? allTutores.find(t => t.id === tutorId)?.nombre : "Elegir tutor responsable"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#151c24] border-white/10 text-white">
                      {allTutores.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ALUMNOS SELECT */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-white/40">2. Seleccionar Alumnos ({selectedAlumnoIds.length})</Label>
                    <div className="flex gap-3">
                      <button onClick={selectAll} className="text-[10px] uppercase font-bold text-amber-500/60 hover:text-amber-500">Seleccionar todos</button>
                      <button onClick={deselectAll} className="text-[10px] uppercase font-bold text-white/20 hover:text-white/40">Limpiar</button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar alumno por nombre o correo..."
                      className="h-10 rounded-xl border border-white/8 bg-white/4 text-sm text-white pl-10 focus-visible:ring-1 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/40"
                    />
                  </div>

                  <div className="rounded-xl border border-white/5 bg-[#151c24] overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto divide-y divide-white/4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {filteredAlumnos.length > 0 ? filteredAlumnos.map((a) => {
                        const isSelected = selectedAlumnoIds.includes(a.id);
                        const assignment = activeAssignments.find(as => as.alumno_id === a.id);
                        const isAlreadyAssigned = !!assignment;
                        const currentTutorName = assignment?.tutores?.nombre_completo;

                        return (
                          <div 
                            key={a.id} 
                            onClick={() => !isAlreadyAssigned && toggleAlumno(a.id)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 transition-colors group",
                              isAlreadyAssigned ? "opacity-40 cursor-not-allowed bg-white/[0.02]" : "cursor-pointer hover:bg-white/2",
                              isSelected ? "bg-amber-500/5" : ""
                            )}
                          >
                            <div className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                              isSelected ? "bg-amber-500 border-amber-500" : "border-white/20",
                              isAlreadyAssigned ? "bg-white/5 border-white/10" : "group-hover:border-white/40"
                            )}>
                              {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-[#1a1a1a]" />}
                              {isAlreadyAssigned && <Users className="h-3 w-3 text-white/20" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-xs font-semibold transition-colors", isSelected ? "text-white" : "text-white/80")}>
                                {a.nombre}
                                {isAlreadyAssigned && (
                                  <span className="ml-2 text-[9px] font-bold text-amber-500/60 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">
                                    Asignado a: {currentTutorName || "Desconocido"}
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-white/30 truncate">{a.correo}</p>
                            </div>
                            {isSelected && <span className="text-[10px] font-bold text-amber-500/40">Seleccionado</span>}
                          </div>
                        );
                      }) : (
                        <p className="py-10 text-center text-xs text-white/20 italic">No se encontraron alumnos.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 border-t border-white/10 flex items-center justify-between bg-white/[0.01]">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-tight text-white/20">Resumen de operación</span>
                <span className="text-sm font-medium text-white/60">
                  {selectedAlumnoIds.length === 0 ? "Sin alumnos seleccionados" : 
                   `${selectedAlumnoIds.length} ${selectedAlumnoIds.length === 1 ? 'alumno seleccionado' : 'alumnos seleccionados'}`}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setOpen(false)} className="h-10 px-5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl text-xs font-bold">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAssign} 
                  disabled={loading || !tutorId || selectedAlumnoIds.length === 0} 
                  className="h-10 px-6 font-bold bg-amber-500 text-[#1a1a1a] shadow-lg shadow-amber-500/25 rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:grayscale transition-all text-xs"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {loading ? "Procesando..." : "Confirmar Asignación"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
