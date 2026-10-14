import {
  ADMIN_LAMPS,
  CARE_BULLETS,
  DEFAULT_CARE,
  findAdminLamp,
  slugifyLamp,
  type AdminLamp,
} from "@/lib/admin-catalog"
import { formatMoney } from "@/lib/money"
import { sdk } from "@/lib/medusa"
import { pickRubRegion } from "@/lib/ru"

export const PRODUCT_FIELDS =
  "id,title,handle,description,subtitle,thumbnail,*images,+metadata,*variants,*variants.calculated_price"

export type StoreProduct = {
  id: string
  title?: string | null
  handle?: string | null
  description?: string | null
  subtitle?: string | null
  thumbnail?: string | null
  images?: { url?: string | null }[] | null
  metadata?: Record<string, unknown> | null
  variants?: {
    id?: string | null
    calculated_price?: { calculated_amount?: number | null } | null
  }[] | null
}

export type RelatedLamp = {
  handle: string
  title: string
  blurb: string
  priceLabel: string
  image: string
}

export type ProductView = {
  id: string
  handle: string
  title: string
  description: string
  priceLabel: string
  variantId: string
  images: string[]
  material: string
  category: string
  color: string
  care: string
  bullets: string[]
  related: RelatedLamp[]
}

function asText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback
}

function productPrice(product: StoreProduct, fallback: number) {
  const amount = product.variants?.[0]?.calculated_price?.calculated_amount
  return formatMoney(amount ?? fallback) || formatMoney(fallback)
}

function productImages(product: Pick<StoreProduct, "images" | "thumbnail">, lamp: AdminLamp | null) {
  const remote = (product.images ?? [])
    .map((image) => image.url)
    .filter((url): url is string => Boolean(url))
  if (product.thumbnail) remote.unshift(product.thumbnail)
  const unique = [...new Set(remote)]
  const local = lamp?.catalogImage ? [lamp.catalogImage] : []
  const flux = [
    "/assets/product/shot-1.png",
    "/assets/product/shot-2.png",
    "/assets/product/shot-3.png",
    "/assets/product/shot-4.png",
    "/assets/product/shot-5.png",
  ]
  const pool = unique.length
    ? unique
    : lamp?.handle === "flux-line"
      ? flux
      : local
  return Array.from({ length: 5 }, (_, index) => pool[index] || pool[0] || flux[index] || flux[0])
}

export async function getRegionIdSafe() {
  try {
    const { regions } = await sdk.store.region.list({ limit: 50 })
    const region = pickRubRegion(regions)
    return (region?.id as string | undefined) || null
  } catch {
    return null
  }
}

export async function listStoreProducts(): Promise<StoreProduct[]> {
  try {
    const regionId = await getRegionIdSafe()
    const { products } = await sdk.store.product.list({
      limit: 50,
      region_id: regionId || undefined,
      fields: PRODUCT_FIELDS,
    })
    return (products || []) as StoreProduct[]
  } catch {
    return []
  }
}

export function matchStoreProduct(products: StoreProduct[], nameOrHandle: string) {
  const key = slugifyLamp(nameOrHandle)
  return (
    products.find((product) => slugifyLamp(product.handle || "") === key) ||
    products.find((product) => slugifyLamp(product.title || "") === key) ||
    null
  )
}

function relatedFrom(products: StoreProduct[], handle: string): RelatedLamp[] {
  const live = products
    .filter((product) => (product.handle || slugifyLamp(product.title || "")) !== handle)
    .slice(0, 4)
    .map((product) => {
      const lamp = findAdminLamp(product.handle || product.title || "")
      return {
        handle: product.handle || lamp?.handle || slugifyLamp(product.title || "lamp"),
        title: product.title || lamp?.title || "Lamp",
        blurb: asText(product.metadata?.blurb, lamp?.blurb || product.subtitle || ""),
        priceLabel: productPrice(product, lamp?.price || 0),
        image: product.thumbnail || product.images?.[0]?.url || lamp?.catalogImage || "/catalog/flux.png",
      }
    })
  if (live.length >= 4) return live
  const extras = ADMIN_LAMPS.filter((lamp) => lamp.handle !== handle)
    .filter((lamp) => !live.some((item) => item.handle === lamp.handle))
    .map((lamp) => ({
      handle: lamp.handle,
      title: lamp.title,
      blurb: lamp.blurb,
      priceLabel: formatMoney(lamp.price),
      image: lamp.catalogImage,
    }))
  return [...live, ...extras].slice(0, 4)
}

function staticView(lamp: AdminLamp, related: RelatedLamp[]): ProductView {
  const images = productImages({ images: [] }, lamp)
  return {
    id: `static_${lamp.handle}`,
    handle: lamp.handle,
    title: lamp.title,
    description: `An elegant table lamp featuring a modern minimalist style. ${lamp.blurb}.`,
    priceLabel: formatMoney(lamp.price),
    variantId: "",
    images,
    material: lamp.material,
    category: lamp.category,
    color: lamp.color,
    care: DEFAULT_CARE,
    bullets: CARE_BULLETS,
    related,
  }
}

function toView(product: StoreProduct, related: RelatedLamp[]): ProductView {
  const lamp = findAdminLamp(product.handle || product.title || "")
  const metadata = product.metadata ?? {}
  return {
    id: product.id,
    handle: product.handle || lamp?.handle || slugifyLamp(product.title || "lamp"),
    title: product.title || lamp?.title || "Lamp",
    description:
      product.description ||
      `An elegant table lamp featuring a modern minimalist style with touches of retro aesthetics. This model serves as a striking accent in a bedroom, living room, or home office.`,
    priceLabel: productPrice(product, lamp?.price || 0),
    variantId: product.variants?.[0]?.id || "",
    images: productImages(product, lamp),
    material: asText(metadata.material, lamp?.material || "metal"),
    category: asText(metadata.category, lamp?.category || "living room"),
    color: asText(metadata.color, lamp?.color || "beige"),
    care: asText(metadata.care, DEFAULT_CARE),
    bullets: CARE_BULLETS,
    related,
  }
}

export async function getProductView(handle: string): Promise<ProductView | null> {
  const key = slugifyLamp(handle)
  const products = await listStoreProducts()
  const live = matchStoreProduct(products, key)
  const related = relatedFrom(products, live?.handle || key)
  if (live) return toView(live, related)
  const lamp = findAdminLamp(key)
  return lamp ? staticView(lamp, related) : null
}

export async function getDefaultProductHandle() {
  const products = await listStoreProducts()
  const flux = matchStoreProduct(products, "flux-line")
  return flux?.handle || products[0]?.handle || "flux-line"
}
