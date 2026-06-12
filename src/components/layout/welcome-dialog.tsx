"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "myroach-welcome-seen";

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        const timer = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && dismiss()}>
      <DialogContent className="border-accent-lime/40 shadow-[0_0_32px_rgba(57,255,20,0.2)] max-sm:fixed max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none">
        <DialogHeader>
          <span className="sticker sticker-neon mx-auto mb-2 w-fit">🪳 MY ROACH</span>
          <DialogTitle className="text-center font-display text-2xl tracking-wide">
            WELCOME TO MY ROACH
          </DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed text-noire-muted">
            Gen Z streetwear for the underground. Built like a roach, dressed like a menace.
            Neon certified drip — they can&apos;t spray us out the scene. Full send only, bhai.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild size="lg" className="w-full" onClick={dismiss}>
            <Link href="/shop">Shop the Drop</Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={dismiss}>
            I&apos;m Already in the Rotation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
