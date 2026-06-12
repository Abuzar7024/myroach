"use client";

import { testimonials } from "@/data/mock-data";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { Star } from "lucide-react";

export function Testimonials() {
  return (
    <section className="bg-foreground py-24 text-background lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <FadeIn className="mb-16 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-background/40">
            Testimonials
          </p>
          <h2 className="font-display text-4xl font-light tracking-tight lg:text-5xl">
            Voices of NOIRÉ
          </h2>
        </FadeIn>

        <StaggerContainer className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.id}>
              <blockquote className="flex h-full flex-col border border-background/10 p-8 lg:p-10">
                <div className="mb-6 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-accent text-accent"
                    />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-background/70 lg:text-base">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-8 border-t border-background/10 pt-6">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-background/40">{t.role}</p>
                </footer>
              </blockquote>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
