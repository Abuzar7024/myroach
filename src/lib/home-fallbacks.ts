/** Editorial placeholders when admin Firestore data is empty — not product catalog data. */

export const FALLBACK_HERO = {
  image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=75",
  title: "DROP LOADING…",
  headline: "THE ROTATION\nIS COOKING",
  subtitle: "First heat hits soon, bhai. Underground drip under neon — they tried to cancel us, we just got fresher. No cap. 🪳",
  link: "/shop",
} as const;

export const FALLBACK_CATEGORY_TILES = [
  {
    name: "Hoodies",
    tagline: "oversized energy",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=75",
  },
  {
    name: "Tees",
    tagline: "graphic heat",
    image: "https://images.unsplash.com/photo-1576566580240-369036f3d3a5?w=800&q=75",
  },
  {
    name: "Cargos",
    tagline: "baggy certified",
    image: "https://images.unsplash.com/photo-1622445265476-086dbcf69797?w=800&q=75",
  },
  {
    name: "Accessories",
    tagline: "finish the fit",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=75",
  },
] as const;

export const PROMO_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=75";

export const SHOP_TEASER_IMAGE =
  "https://images.unsplash.com/photo-1618354691373-d8512795e3fb?w=1600&q=75";
