import type { Product } from "@/types";

export interface ProductFilterOptions {
  search?: string;
  category?: string;
  categoryId?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export function filterProductsList(
  products: Product[],
  options: ProductFilterOptions
) {
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
    result = result.filter(
      (p) =>
        p.categorySlug === options.category ||
        (options.categoryId != null && p.categoryId === options.categoryId)
    );
  }

  if (options.gender && options.gender !== "all") {
    result = result.filter(
      (p) => !p.gender || p.gender === options.gender || p.gender === "unisex"
    );
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
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  const page = options.page || 1;
  const limit = options.limit || 12;
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);

  return {
    products: paginated,
    total: result.length,
    page,
    totalPages: Math.ceil(result.length / limit) || 1,
  };
}
