import { CatalogPage } from "@/modules/catalog/catalog-page"
import { HomeBehavior } from "@/modules/home/home-behavior"

export const metadata = {
  title: "Catalog — Brightic",
  description: "Brightic lamp catalog.",
}

export default function Page() {
  return (
    <>
      <CatalogPage home="/" catalog="/catalog" shop="/assets/shop" photos="/catalog" />
      <HomeBehavior />
    </>
  )
}
