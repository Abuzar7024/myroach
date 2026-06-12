import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";

export function BrandStory() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <FadeIn direction="left">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1521223890938-3830c6d1d146?w=1200&q=75"
                alt="MY ROACH crew"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.15}>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Our Philosophy
            </p>
            <h2 className="font-display text-4xl font-light leading-tight tracking-tight lg:text-5xl">
              Where Craft Meets
              <br />
              Conscious Design
            </h2>
            <div className="my-8 h-px w-16 bg-accent reveal-line" />
            <p className="text-muted leading-relaxed lg:text-lg">
              Founded in Paris, NOIRÉ reimagines luxury through the lens of
              restraint. Each piece is a dialogue between artisanal technique
              and contemporary form — designed to be worn, lived in, and
              cherished across seasons.
            </p>
            <p className="mt-4 text-muted leading-relaxed">
              We believe true elegance requires no announcement. Our collections
              speak through material, proportion, and the quiet confidence of
              impeccable construction.
            </p>
            <Button asChild variant="outline" className="mt-10">
              <Link href="/about">Discover Our Story</Link>
            </Button>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
