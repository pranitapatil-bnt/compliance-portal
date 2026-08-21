import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ProductList } from "@/features/products";

export const metadata: Metadata = {
  title: "Products",
};

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Products"
        description="Feature modules own data fetching, validation, and UI. Routes only compose them."
      />
      <ProductList />
    </>
  );
}
