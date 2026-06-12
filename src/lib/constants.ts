export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "MY ROACH";
export const SITE_NAME_DISPLAY = "MY ROACH";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const SITE_TAGLINE = "Built different — certified heat only";
export const SITE_DESCRIPTION =
  "MY ROACH — Gen Z streetwear for the underground. Squad up, survived the plot, still standing. They tried to cancel us — we just got fresher. Full send drip, no cap.";

export const SOCIAL = {
  instagram: "@myroach.fit",
  email: "crew@myroach.in",
  phone: "+91 420-ROACH-69",
} as const;

export const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?filter=new", label: "Fresh Drops" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { href: "/shop", label: "All Fits" },
    { href: "/shop?category=hoodies", label: "Hoodies" },
    { href: "/shop?category=tees", label: "Tees" },
    { href: "/shop?category=accessories", label: "Accessories" },
    { href: "/size-guide", label: "Size Guide" },
  ],
  company: [
    { href: "/about", label: "The Lore" },
    { href: "/contact", label: "Hit Us Up" },
    { href: "/contact#faq", label: "FAQ" },
    { href: "/shipping-returns", label: "Shipping & Returns" },
  ],
  account: [
    { href: "/account", label: "My Account" },
    { href: "/account/orders", label: "Order History" },
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

export const FREE_SHIPPING_THRESHOLD = 2499;

export const SHIPPING_RATES = [
  { id: "standard", label: "Standard Shipping", price: 99, days: "5-7 business days" },
  { id: "express", label: "Express Shipping", price: 199, days: "2-3 business days" },
  { id: "overnight", label: "Overnight", price: 399, days: "Next business day" },
] as const;

export const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
