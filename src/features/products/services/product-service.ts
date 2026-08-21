import "server-only";

import { env } from "@/config/env";
import { apiGet } from "@/lib/api/client";
import { logger } from "@/lib/logger";

import { parseProductList } from "../schemas/product";
import type { Product } from "../types";

const localProducts: Product[] = [
  {
    id: "prod_1",
    name: "Atlas Notebook",
    sku: "ATL-NB-001",
    status: "active",
  },
  {
    id: "prod_2",
    name: "Atlas Field Kit",
    sku: "ATL-FK-014",
    status: "archived",
  },
];

export async function listProducts(): Promise<Product[]> {
  if (!env.apiBaseUrl) {
    return localProducts;
  }

  const body = await apiGet("/products");
  const parsed = parseProductList(body);

  if (!parsed.ok) {
    logger.error("Failed to parse products payload", parsed.error);
    throw new Error(parsed.error);
  }

  return parsed.data;
}
