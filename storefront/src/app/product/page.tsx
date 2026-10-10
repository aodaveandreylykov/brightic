import { ProductBehavior } from "@/modules/product/product-behavior"
import { ProductPage } from "@/modules/product/product-page"

export const metadata = {
  title: "Flux Line — Brightic",
  description: "Flux Line table lamp by Brightic.",
}

export default function Page() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap"
      />
      <ProductPage />
      <ProductBehavior />
    </>
  )
}
