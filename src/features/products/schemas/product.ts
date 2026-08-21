import type { Result } from "@/types/result";
import { isRecord, readString } from "@/lib/utils/guards";

import type { Product } from "../types";

function parseProduct(value: unknown): Product | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  const name = readString(value.name);
  const sku = readString(value.sku);
  const status = readString(value.status);

  if (!id || !name || !sku) {
    return null;
  }

  if (status !== "active" && status !== "archived") {
    return null;
  }

  return { id, name, sku, status };
}

export function parseProductList(value: unknown): Result<Product[]> {
  if (!Array.isArray(value)) {
    return { ok: false, error: "Product list was not an array." };
  }

  const products: Product[] = [];
  for (const item of value) {
    const product = parseProduct(item);
    if (!product) {
      return { ok: false, error: "Product list contained an invalid record." };
    }
    products.push(product);
  }

  return { ok: true, data: products };
}
