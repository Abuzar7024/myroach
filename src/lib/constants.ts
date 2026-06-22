export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "MY ROACH";
export const SITE_NAME_DISPLAY = "MY ROACH";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const SITE_TAGLINE = "Streetwear that stands out";
export const SITE_DESCRIPTION =
  "MY ROACH — bold streetwear with neon accents. Shop hoodies, tees, and accessories online.";

export const SOCIAL = {
  instagram: "@myroach.fit",
  email: "crew@myroach.in",
  phone: "+91 420-ROACH-69",
} as const;

export const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?filter=new", label: "New In" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { href: "/shop", label: "All Products" },
    { href: "/shop?category=hoodies", label: "Hoodies" },
    { href: "/shop?category=tees", label: "Tees" },
    { href: "/shop?category=accessories", label: "Accessories" },
    { href: "/size-guide", label: "Size Guide" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/contact#faq", label: "FAQ" },
    { href: "/shipping-returns", label: "Shipping & Returns" },
  ],
  account: [
    { href: "/account", label: "My Account" },
    { href: "/account/orders", label: "Orders" },
    { href: "/account/wishlist", label: "Wishlist" },
    { href: "/account/addresses", label: "Addresses" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/shipping-returns", label: "Shipping & Returns" },
    { href: "/size-guide", label: "Size Guide" },
  ],
} as const;

export const LEGAL_LINKS = FOOTER_LINKS.legal;

export const DEFAULT_MIN_ORDER_QTY = 1;
export const DEFAULT_MAX_ORDER_QTY = 10;

export const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
