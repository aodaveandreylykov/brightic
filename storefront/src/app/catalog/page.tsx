import { CatalogPage } from "@/modules/catalog/catalog-page"
import { HomeBehavior } from "@/modules/home/home-behavior"
import { listStoreProducts } from "@/lib/products"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Catalog — Brightic",
  description: "Brightic lamp catalog.",
}

export default async function Page() {
  const products = await listStoreProducts()
  const live = products.map((product) => ({
    handle: product.handle || "",
    title: product.title || "",
    price: product.variants?.[0]?.calculated_price?.calculated_amount ?? null,
  }))

  return (
    <>
      <CatalogPage home="/" catalog="/catalog" shop="/assets/shop" photos="/catalog" products={live} />
      <HomeBehavior />
    </>
  )
}
