"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { loginRedirectPath, storeReturnUrl } from "@/lib/auth-utils";

interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: string;
}

export function LoginRequiredDialog({
  open,
  onOpenChange,
  action = "add items to cart or checkout",
}: LoginRequiredDialogProps) {
  const pathname = usePathname();

  const goToLogin = () => {
    storeReturnUrl(pathname);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-accent-pink/40 shadow-[0_0_24px_rgba(255,0,170,0.2)]">
        <DialogHeader>
          <DialogTitle className="text-accent-pink">Login Required</DialogTitle>
          <DialogDescription className="text-noire-muted">
            Sign in with your phone to {action}. Browse the shop freely — login only when you&apos;re ready to buy.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild size="lg" className="w-full">
            <Link href={loginRedirectPath(pathname)} onClick={goToLogin}>
              Sign In with Phone
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href={`/register?redirect=${encodeURIComponent(pathname)}`} onClick={goToLogin}>
              Create Account
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
