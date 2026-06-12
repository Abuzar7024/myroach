"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";

const WelcomeDialog = dynamic(
  () => import("@/components/layout/welcome-dialog").then((m) => m.WelcomeDialog),
  { ssr: false }
);

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-14 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0 lg:pt-20">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <WelcomeDialog />
    </>
  );
}
