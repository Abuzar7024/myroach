"use client";

import { FadeIn } from "@/components/ui/motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="border-t border-border py-24 lg:py-32">
      <div className="mx-auto max-w-2xl px-6 text-center lg:px-10">
        <FadeIn>
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Stay Connected
          </p>
          <h2 className="font-display text-4xl font-light tracking-tight lg:text-5xl">
            Join the Inner Circle
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted">
            Early access to collections, exclusive events, and curated style
            insights — delivered with discretion.
          </p>

          {submitted ? (
            <p className="mt-10 text-sm text-accent">
              Thank you for subscribing. Welcome to NOIRÉ.
            </p>
          ) : (
            <form
              className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <Input
                type="email"
                placeholder="Your email address"
                required
                className="flex-1"
              />
              <Button type="submit" variant="default">
                Subscribe
              </Button>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
