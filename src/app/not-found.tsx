import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
      <span className="text-6xl" aria-hidden="true">
        🪳
      </span>
      <p className="sticker sticker-pink mt-6">error 404</p>
      <h1 className="font-display mt-6 text-4xl tracking-wide text-noire-white md:text-6xl">
        WRONG TUNNEL, BHAI
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-noire-muted">
        This page got lost in the underground. The roach you&apos;re looking for scurried
        somewhere else — probably back to the shop plotting the next drop.
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-accent-cyan/70">
        {SITE_NAME} · Youth Certified Streetwear
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button asChild variant="drip">
          <Link href="/">Back Home</Link>
        </Button>
        <Button asChild variant="cyber">
          <Link href="/shop">Shop Drip</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact Crew</Link>
        </Button>
      </div>

      <p className="mt-12 text-xs text-noire-muted">
        Lost? Try{" "}
        <Link href="/shop" className="text-accent-cyan hover:underline">
          /shop
        </Link>
        ,{" "}
        <Link href="/about" className="text-accent-cyan hover:underline">
          /about
        </Link>
        , or{" "}
        <Link href="/account" className="text-accent-cyan hover:underline">
          /account
        </Link>
        .
      </p>
    </div>
  );
}
