"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const sizeChart = [
  { size: "XS", chest: "86-91", length: "66", shoulder: "42" },
  { size: "S", chest: "91-96", length: "68", shoulder: "44" },
  { size: "M", chest: "96-101", length: "70", shoulder: "46" },
  { size: "L", chest: "101-106", length: "72", shoulder: "48" },
  { size: "XL", chest: "106-111", length: "74", shoulder: "50" },
];

interface SizeGuideDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SizeGuideDialog({ trigger, open, onOpenChange }: SizeGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md border-accent-cyan/30 shadow-[0_0_24px_rgba(0,240,255,0.15)]">
        <DialogHeader>
          <DialogTitle className="text-accent-cyan">Size Guide</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-noire-muted">
          Oversized streetwear fit — size up if you want extra baggy. All measurements in cm, bhai.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-noire-border text-left text-xs uppercase tracking-widest text-accent-lime">
                <th className="pb-3 pr-4">Size</th>
                <th className="pb-3 pr-4">Chest</th>
                <th className="pb-3 pr-4">Length</th>
                <th className="pb-3">Shoulder</th>
              </tr>
            </thead>
            <tbody>
              {sizeChart.map((row) => (
                <tr key={row.size} className="border-b border-noire-border/50">
                  <td className="py-2.5 font-medium text-accent-cyan">{row.size}</td>
                  <td className="py-2.5 text-noire-muted">{row.chest}</td>
                  <td className="py-2.5 text-noire-muted">{row.length}</td>
                  <td className="py-2.5 text-noire-muted">{row.shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-noire-muted">
          Still unsure? DM us on IG @myroach.fit — the rotation got you.
        </p>
      </DialogContent>
    </Dialog>
  );
}
