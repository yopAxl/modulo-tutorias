"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default" | "amber";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "destructive",
  loading = false
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && !loading && onClose()}>
      <DialogContent className="border border-white/5 bg-[#0f151c] text-white sm:max-w-md p-0 overflow-hidden shadow-2xl sm:rounded-2xl outline-none ring-0">
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            variant === 'destructive' ? 'bg-red-500/10 text-red-500' : 
            variant === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
          }`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-white/50 leading-relaxed px-2">
              {description}
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 flex gap-3 sm:justify-center">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 h-11 text-white/40 hover:text-white hover:bg-white/5 rounded-xl text-xs font-bold transition-all"
          >
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 h-11 font-bold rounded-xl transition-all text-xs border shadow-lg ${
              variant === 'destructive' 
                ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white shadow-red-500/10' 
                : variant === 'amber'
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-[#1a1a1a] shadow-amber-500/10'
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-[#1a1a1a] shadow-emerald-500/10'
            }`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
