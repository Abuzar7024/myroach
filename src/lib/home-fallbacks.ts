/** Editorial placeholders when admin Firestore data is empty — not product catalog data. */

export const FALLBACK_HERO = {
  image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=75",
  title: "New collection",
  headline: "NEW DROP\nCOMING SOON",
  subtitle: "Fresh styles are on the way. Browse the shop or check back soon.",
  link: "/shop",
} as const;

export const FALLBACK_HERO_SLIDES = [
  {
    image: FALLBACK_HERO.image,
    tagline: "new season",
    headline: "NEW DROP\nCOMING SOON",
    subline: FALLBACK_HERO.subtitle,
  },
  {
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1600&q=75",
    tagline: "streetwear",
    headline: "BOLD FITS\nFOR EVERY DAY",
    subline: "Hoodies, tees, and accessories with a neon edge.",
  },
  {
    image: "https://images.unsplash.com/photo-1618354691373-d8512795e3fb?w=1600&q=75",
    tagline: "my roach",
    headline: "BUILT TO\nSTAND OUT",
    subline: "Shop the latest MY ROACH collection online.",
  },
] as const;

export const FALLBACK_CATEGORY_TILES = [
  {
    name: "Hoodies",
    tagline: "cozy layers",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=75",
  },
  {
    name: "Tees",
    tagline: "everyday fits",
    image: "https://images.unsplash.com/photo-1576566580240-369036f3d3a5?w=800&q=75",
  },
  {
    name: "Cargos",
    tagline: "utility style",
    image: "https://images.unsplash.com/photo-1622445265476-086dbcf69797?w=800&q=75",
  },
  {
    name: "Accessories",
    tagline: "finish the look",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=75",
  },
] as const;

export const PROMO_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=75";

export const SHOP_TEASER_IMAGE =
  "https://images.unsplash.com/photo-1618354691373-d8512795e3fb?w=1600&q=75";
