import { EmptyState } from "@/components/shared/empty-state";

import { listProducts } from "../services/product-service";

export async function ProductList() {
  const products = await listProducts();

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products yet"
        description="Catalog items will appear here once a product source is connected."
      />
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
      {products.map((product) => (
        <li
          key={product.id}
          className="flex items-center justify-between px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-zinc-900">{product.name}</p>
            <p className="text-sm text-zinc-500">{product.sku}</p>
          </div>
          <span className="text-xs uppercase tracking-wide text-zinc-500">
            {product.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
