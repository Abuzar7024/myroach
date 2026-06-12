import Image from "next/image";
import Link from "next/link";
import { banners } from "@/data/mock-data";
import { FadeIn } from "@/components/ui/motion";

export function PromoBanners() {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {banners.map((banner, i) => (
            <FadeIn key={banner.id} delay={i * 0.1}>
              <Link
                href={banner.link}
                className="group relative block aspect-[16/9] overflow-hidden lg:aspect-[16/10]"
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-black/30 transition-colors duration-500 group-hover:bg-black/40" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white lg:p-12">
                  {banner.subtitle && (
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/60">
                      {banner.subtitle}
                    </p>
                  )}
                  <h3 className="font-display text-3xl font-light lg:text-4xl">
                    {banner.title}
                  </h3>
                  <span className="mt-4 inline-block text-xs uppercase tracking-[0.2em] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Discover →
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
