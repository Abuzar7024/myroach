import Link from "next/link";
import { products } from "@/data/mock-data";
import { ProductCard } from "@/components/shop/product-card";
import { FadeIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";

interface ProductSectionProps {
  title: string;
  subtitle: string;
  filter: "new" | "bestseller";
}

export function ProductSection({ title, subtitle, filter }: ProductSectionProps) {
  const filtered =
    filter === "new"
      ? products.filter((p) => p.isNewArrival)
      : products.filter((p) => p.isBestSeller);

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <FadeIn className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {subtitle}
            </p>
            <h2 className="font-display text-4xl font-light tracking-tight lg:text-5xl">
              {title}
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href={`/shop?filter=${filter === "new" ? "new" : "bestseller"}`}>
              View All
            </Link>
          </Button>
        </FadeIn>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {filtered.slice(0, 4).map((product, i) => (
            <FadeIn key={product.id} delay={i * 0.08}>
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
