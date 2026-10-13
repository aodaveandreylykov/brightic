import { notFound } from "next/navigation"
import { ADMIN_LAMPS } from "@/lib/admin-catalog"
import { getProductView } from "@/lib/products"
import { ProductBehavior } from "@/modules/product/product-behavior"
import { ProductPage } from "@/modules/product/product-page"

export function generateStaticParams() {
  return ADMIN_LAMPS.map((lamp) => ({ handle: lamp.handle }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProductView(handle)
  if (!product) return { title: "Lamp — Brightic" }
  return {
    title: `${product.title} — Brightic`,
    description: product.description,
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProductView(handle)
  if (!product) notFound()

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap"
      />
      <ProductPage product={product} />
      <ProductBehavior />
    </>
  )
}
