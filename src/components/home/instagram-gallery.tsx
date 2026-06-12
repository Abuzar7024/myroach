import Image from "next/image";
import Link from "next/link";
import { instagramPosts } from "@/data/mock-data";
import { FadeIn } from "@/components/ui/motion";
import { Instagram } from "lucide-react";

export function InstagramGallery() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <FadeIn className="mb-14 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            @noire.fashion
          </p>
          <h2 className="font-display text-4xl font-light tracking-tight lg:text-5xl">
            Follow Our World
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:gap-3">
          {instagramPosts.map((src, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <Link
                href="#"
                className="group relative block aspect-square overflow-hidden"
              >
                <Image
                  src={src}
                  alt={`Instagram post ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                  <Instagram className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
