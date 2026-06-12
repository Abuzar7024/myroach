import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { SITE_NAME, FOOTER_LINKS, SOCIAL } from "@/lib/constants";
import { FooterSizeGuide } from "@/components/layout/footer-size-guide";

export function Footer() {
  return (
    <footer className="relative border-t border-accent-cyan/30 bg-noire-black text-noire-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-3xl tracking-[0.1em]">
              <span aria-hidden="true">🪳</span>
              {SITE_NAME}
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-noire-white/60">
              Gen Z streetwear for the underground. Built like a roach, dressed like a menace.
              Cyberpunk drip for the rotation — certified heat, bhai.
            </p>
            <div className="mt-6 flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-noire-white/60 transition-colors hover:text-accent-cyan hover:drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-accent-cyan">
                {title}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-noire-white/60 transition-colors hover:text-accent-cyan"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-accent-cyan">
              Help
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <FooterSizeGuide />
              </li>
              <li>
                <Link href="/contact#faq" className="text-sm text-noire-white/60 transition-colors hover:text-accent-cyan">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="text-sm text-noire-white/60 transition-colors hover:text-accent-cyan">
                  Shipping & Returns
                </Link>
              </li>
            </ul>
            <h3 className="mt-8 text-xs font-bold uppercase tracking-[0.15em] text-accent-cyan">
              Contact
            </h3>
            <address className="mt-4 space-y-2 text-sm not-italic text-noire-white/60">
              <p>420 Roach Lane, Bandra</p>
              <p>Mumbai, MH 400050</p>
              <p>
                <a href={`mailto:${SOCIAL.email}`} className="hover:text-accent-cyan">
                  {SOCIAL.email}
                </a>
              </p>
              <p>{SOCIAL.phone}</p>
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-accent-cyan/20 pt-8 sm:flex-row">
          <p className="text-xs text-noire-white/40">
            © {new Date().getFullYear()} {SITE_NAME}. Youth certified. Still standing. 🪳
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-noire-white/40 sm:gap-6">
            <Link href="/privacy" className="min-h-[44px] flex items-center hover:text-accent-cyan">Privacy</Link>
            <Link href="/terms" className="min-h-[44px] flex items-center hover:text-accent-cyan">Terms</Link>
            <Link href="/shipping-returns" className="min-h-[44px] flex items-center hover:text-accent-cyan">Shipping & Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
