"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-accent-cyan/30 shadow-[0_0_24px_rgba(0,240,255,0.15)]">
        <DialogHeader>
          <DialogTitle className="text-accent-cyan">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-noire-muted">{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "drip" : "default"}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
