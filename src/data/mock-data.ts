import type { Product, Category, Banner, Review } from "@/types";

/** Verified Gen Z streetwear Unsplash images — w=800/1200/1600&q=75 */
const IMG = {
  hoodie1: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=75",
  hoodie2: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=75",
  tee1: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=75",
  tee2: "https://images.unsplash.com/photo-1576566580240-369036f3d3a5?w=1200&q=75",
  tee3: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=75",
  street1: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=1200&q=75",
  street2: "https://images.unsplash.com/photo-1618354691373-d8512795e3fb?w=1200&q=75",
  urban1: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1600&q=75",
  urban2: "https://images.unsplash.com/photo-1559827260-dc66d52bef79?w=1600&q=75",
  cargo1: "https://images.unsplash.com/photo-1622445265476-086dbcf69797?w=1200&q=75",
  cargo2: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1200&q=75",
  wide1: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=75",
  wide2: "https://images.unsplash.com/photo-1539109136882-3cdee19191e2?w=1200&q=75",
  puffer1: "https://images.unsplash.com/photo-1551028719-00167b10929e?w=1200&q=75",
  bag1: "https://images.unsplash.com/photo-1594608664022-8f64f0c17a73?w=1200&q=75",
  bag2: "https://images.unsplash.com/photo-1564422179262-789e2373e040?w=1200&q=75",
  chain1: "https://images.unsplash.com/photo-1621761191317-de8b44ce0c9b?w=1200&q=75",
  y2k1: "https://images.unsplash.com/photo-1521223890938-3830c6d1d146?w=1200&q=75",
  fit1: "https://images.unsplash.com/photo-15033423975-d11742d09c6a?w=1200&q=75",
} as const;

export const categories: Category[] = [
  {
    id: "cat-womens",
    name: "Hoodies",
    slug: "hoodies",
    description: "Oversized, heavy, drip check passed",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=75",
    order: 1,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cat-mens",
    name: "Tees",
    slug: "tees",
    description: "Graphic tees that go stupid hard — certified heat",
    image: "https://images.unsplash.com/photo-1576566580240-369036f3d3a5?w=800&q=75",
    order: 2,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Chains, caps, bags — finish the roach fit",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=75",
    order: 3,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const defaultVariants = [
  {
    color: "Black",
    colorHex: "#1a1a1a",
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: { XS: 5, S: 12, M: 18, L: 10, XL: 4 },
  },
  {
    color: "Ivory",
    colorHex: "#f5f0e8",
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: { XS: 3, S: 8, M: 14, L: 7, XL: 2 },
  },
];

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Underground Oversized Hoodie",
    slug: "silk-draped-blazer",
    description:
      "Heavy oversized hoodie with MY ROACH graphic on back. Relaxed fit, kangaroo pocket, ribbed cuffs. Built to survive anything — certified heat, no cap.",
    shortDescription: "Oversized hoodie — squad up energy",
    price: 890,
    compareAtPrice: 1050,
    categoryId: "cat-womens",
    categorySlug: "womens",
    images: [IMG.hoodie1, IMG.hoodie2],
    variants: defaultVariants,
    tags: ["hoodie", "roach-gang", "streetwear"],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 47,
    sku: "NR-WB-001",
    material: "100% Cotton Fleece",
    careInstructions: "Machine wash cold, hang dry",
    isActive: true,
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "prod-2",
    name: "Plot-Proof Puffer",
    slug: "merino-wool-coat",
    description:
      "Chunky puffer jacket that laughs at cold weather and bad vibes. Water-resistant shell, oversized hood, neon zip pulls. They can't spray us out the scene.",
    shortDescription: "Chunky puffer — unbothered in any weather",
    price: 1450,
    categoryId: "cat-womens",
    categorySlug: "womens",
    images: [IMG.puffer1, IMG.street2],
    variants: [
      {
        color: "Camel",
        colorHex: "#c4a574",
        sizes: ["XS", "S", "M", "L"],
        stock: { XS: 2, S: 6, M: 9, L: 4 },
      },
    ],
    tags: ["puffer", "outerwear", "roach"],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.8,
    reviewCount: 32,
    sku: "NR-WC-002",
    material: "Nylon shell, synthetic fill",
    isActive: true,
    createdAt: "2024-05-15T00:00:00Z",
    updatedAt: "2024-05-15T00:00:00Z",
  },
  {
    id: "prod-3",
    name: "Unbothered Graphic Tee",
    slug: "cashmere-crew-sweater",
    description:
      "Premium heavyweight tee with absurdist roach graphic front and back. Boxy fit, dropped shoulders. The kind of tee your group chat asks about immediately.",
    shortDescription: "Heavyweight graphic tee — drip check passed",
    price: 520,
    categoryId: "cat-mens",
    categorySlug: "mens",
    images: [IMG.tee1, IMG.tee3],
    variants: defaultVariants,
    tags: ["tee", "graphic", "streetwear"],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.7,
    reviewCount: 28,
    sku: "NR-MK-003",
    material: "240gsm Cotton",
    isActive: true,
    createdAt: "2024-06-10T00:00:00Z",
    updatedAt: "2024-06-10T00:00:00Z",
  },
  {
    id: "prod-4",
    name: "Roach Cargo Pants",
    slug: "tailored-wool-trousers",
    description:
      "Baggy cargos with extra pockets for your chaos. Adjustable waist, wide leg, utility straps. Full send energy — dressed like a menace.",
    shortDescription: "Baggy cargo pants — rotation essential",
    price: 380,
    categoryId: "cat-mens",
    categorySlug: "mens",
    images: [IMG.cargo1, IMG.cargo2],
    variants: defaultVariants,
    tags: ["cargos", "pants", "streetwear"],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.6,
    reviewCount: 19,
    sku: "NR-MT-004",
    material: "Cotton twill",
    isActive: true,
    createdAt: "2024-06-05T00:00:00Z",
    updatedAt: "2024-06-05T00:00:00Z",
  },
  {
    id: "prod-5",
    name: "Certified Heat Crossbody",
    slug: "leather-crossbody-bag",
    description:
      "Compact crossbody with MY ROACH patch and neon strap. Fits phone, wallet, and main character energy. Youth certified.",
    shortDescription: "Crossbody bag — underground party essential",
    price: 650,
    categoryId: "cat-accessories",
    categorySlug: "accessories",
    images: [IMG.bag1, IMG.bag2],
    variants: [
      {
        color: "Black",
        colorHex: "#1a1a1a",
        sizes: ["One Size"],
        stock: { "One Size": 15 },
      },
      {
        color: "Tan",
        colorHex: "#8b6914",
        sizes: ["One Size"],
        stock: { "One Size": 8 },
      },
    ],
    tags: ["bag", "leather", "accessories"],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 56,
    sku: "NR-AB-005",
    material: "Vegan leather",
    isActive: true,
    createdAt: "2024-04-20T00:00:00Z",
    updatedAt: "2024-04-20T00:00:00Z",
  },
  {
    id: "prod-6",
    name: "Underground Wide Pants",
    slug: "linen-wide-leg-trousers",
    description:
      "Wide-leg pants for the underground scene. Elastic waist, bold stitch details, flows with every step. Survived everything, dressed fire.",
    shortDescription: "Wide-leg pants — chaotic good energy",
    price: 295,
    categoryId: "cat-womens",
    categorySlug: "womens",
    images: [IMG.wide1, IMG.wide2],
    variants: defaultVariants,
    tags: ["trousers", "linen", "summer"],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.5,
    reviewCount: 14,
    sku: "NR-WT-006",
    material: "Cotton blend",
    isActive: true,
    createdAt: "2024-06-12T00:00:00Z",
    updatedAt: "2024-06-12T00:00:00Z",
  },
  {
    id: "prod-7",
    name: "Survivor Chain Belt",
    slug: "structured-leather-belt",
    description: "Chunky chain belt with roach emblem buckle. Adjustable, loud, unkillable — finishes any fit.",
    shortDescription: "Chain belt with roach emblem buckle",
    price: 185,
    categoryId: "cat-accessories",
    categorySlug: "accessories",
    images: [IMG.chain1],
    variants: [
      {
        color: "Black",
        colorHex: "#1a1a1a",
        sizes: ["S", "M", "L"],
        stock: { S: 10, M: 15, L: 8 },
      },
    ],
    tags: ["belt", "leather"],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.4,
    reviewCount: 22,
    sku: "NR-AB-007",
    isActive: true,
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
  {
    id: "prod-8",
    name: "Full Send Oversized Tee",
    slug: "oversized-cotton-shirt",
    description:
      "Oversized tee with Hindi-English mix graphic — &ldquo;scene full send&rdquo; on front. Drop shoulder, elongated hem. Bhai approved.",
    shortDescription: "Oversized tee — full send energy",
    price: 245,
    categoryId: "cat-mens",
    categorySlug: "mens",
    images: [IMG.tee2, IMG.fit1],
    variants: defaultVariants,
    tags: ["shirt", "cotton"],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.6,
    reviewCount: 11,
    sku: "NR-MS-008",
    isActive: true,
    createdAt: "2024-06-08T00:00:00Z",
    updatedAt: "2024-06-08T00:00:00Z",
  },
];

export const coupons = [
  {
    id: "coupon-1",
    code: "ROACH20",
    type: "percentage" as const,
    value: 20,
    minOrderAmount: 999,
    maxUses: 1000,
    usedCount: 142,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "coupon-1b",
    code: "VOID20",
    type: "percentage" as const,
    value: 20,
    minOrderAmount: 999,
    maxUses: 1000,
    usedCount: 0,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "coupon-2",
    code: "WELCOME10",
    type: "fixed" as const,
    value: 799,
    minOrderAmount: 999,
    maxUses: 500,
    usedCount: 89,
    isActive: true,
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "coupon-3",
    code: "SUMMER15",
    type: "percentage" as const,
    value: 15,
    minOrderAmount: 1499,
    maxUses: 200,
    usedCount: 45,
    expiresAt: "2024-09-30T00:00:00Z",
    isActive: true,
    createdAt: "2024-06-01T00:00:00Z",
  },
];

export const banners: Banner[] = [
  {
    id: "banner-1",
    title: "Neon Drop",
    subtitle: "Glitch gang only",
    image: IMG.urban1,
    link: "/shop?filter=new",
    position: "hero",
    order: 1,
    isActive: true,
    createdAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "banner-2",
    title: "Cyber Rotation",
    subtitle: "Neon certified heat",
    image: IMG.urban2,
    link: "/shop?category=mens",
    position: "promo",
    order: 2,
    isActive: true,
    createdAt: "2024-06-01T00:00:00Z",
  },
];

export const reviews: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    userId: "user-1",
    userName: "Arjun K.",
    rating: 5,
    title: "Full send hoodie",
    comment:
      "The hoodie hits different. Oversized, heavy, and the graphic goes stupid hard. Drip check passed, bhai.",
    isVerified: true,
    createdAt: "2024-05-20T00:00:00Z",
  },
  {
    id: "rev-2",
    productId: "prod-2",
    userId: "user-2",
    userName: "Rohan T.",
    rating: 5,
    title: "Unbothered puffer",
    comment:
      "Wore this to a night scene and got three fit check DMs. They can't spray us out the scene — facts.",
    isVerified: true,
    createdAt: "2024-04-15T00:00:00Z",
  },
  {
    id: "rev-3",
    productId: "prod-5",
    userId: "user-3",
    userName: "Vikram R.",
    rating: 5,
    title: "Main character bag",
    comment:
      "Neon strap, roach patch, fits everything. The underground essential — certified heat.",
    isVerified: true,
    createdAt: "2024-03-10T00:00:00Z",
  },
];

export const testimonials = [
  {
    id: "test-1",
    name: "Arjun K.",
    role: "Rotation Captain",
    quote:
      "Bhai the hoodie is insane. Wore it once and three people asked where I copped. MY ROACH don't miss — main character verified.",
    rating: 5,
  },
  {
    id: "test-2",
    name: "Rohan T.",
    role: "Meme Lord",
    quote:
      "Built like a roach, dressed like a menace. Quality actually hits for the price — no cheap print vibes, full send only.",
    rating: 5,
  },
  {
    id: "test-3",
    name: "Vikram R.",
    role: "Scene Regular",
    quote:
      "Finally a brand that gets the underground energy. Loud enough to stand out, unbothered enough to wear every day.",
    rating: 5,
  },
];

export const instagramPosts = [
  "https://images.unsplash.com/photo-1618354691373-d8512795e3fb?w=600&q=75",
  "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=75",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=75",
  "https://images.unsplash.com/photo-1521223890938-3830c6d1d146?w=600&q=75",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=75",
  "https://images.unsplash.com/photo-1576566580240-369036f3d3a5?w=600&q=75",
];

export const teamMembers = [
  {
    name: "Ravi V.",
    role: "Founder",
    image: "https://images.unsplash.com/photo-1529626455594-480ff14e819e?w=400&q=75",
    bio: "Started MY ROACH when the youth trend went viral. Built different or nothing.",
  },
  {
    name: "Karan M.",
    role: "Head of Design",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=75",
    bio: "If the graphic doesn't slap, it doesn't ship. Neon certified or bust.",
  },
  {
    name: "Priya L.",
    role: "Brand Lead",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=75",
    bio: "Runs the IG, sets the scene, keeps the rotation honest. Full send energy only.",
  },
];

export const timeline = [
  { year: "2023", title: "Underground Era", description: "The youth trend goes viral. First hoodies printed in a Mumbai flat. Sold out in 48 hours." },
  { year: "2024", title: "MY ROACH Born", description: "Official launch. The name stuck — built like a roach, dressed like a menace." },
  { year: "2024", title: "First Pop-Up", description: "Lines around the block in Bandra. Fit checks only. Squad up." },
  { year: "2025", title: "Global Rotation", description: "Shipping worldwide. Youth certified, no borders, still standing." },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string) {
  return products.filter((p) => p.categorySlug === categorySlug && p.isActive);
}

export function getFeaturedProducts() {
  return products.filter((p) => p.isFeatured && p.isActive);
}

export function getNewArrivals() {
  return products.filter((p) => p.isNewArrival && p.isActive);
}

export function getBestSellers() {
  return products.filter((p) => p.isBestSeller && p.isActive);
}

export function getRelatedProducts(productId: string, categorySlug: string, limit = 4) {
  return products
    .filter((p) => p.id !== productId && p.categorySlug === categorySlug && p.isActive)
    .slice(0, limit);
}

export function getProductReviews(productId: string) {
  return reviews.filter((r) => r.productId === productId);
}

export function filterProducts(options: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  let result = [...products.filter((p) => p.isActive)];

  if (options.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }

  if (options.category) {
    result = result.filter((p) => p.categorySlug === options.category);
  }

  if (options.minPrice !== undefined) {
    result = result.filter((p) => p.price >= options.minPrice!);
  }

  if (options.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= options.maxPrice!);
  }

  switch (options.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "popular":
      result.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    default:
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const page = options.page || 1;
  const limit = options.limit || 12;
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);

  return { products: paginated, total: result.length, page, totalPages: Math.ceil(result.length / limit) };
}
