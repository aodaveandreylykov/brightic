import { findAdminLamp, slugifyLamp } from "@/lib/admin-catalog"
import { formatMoney } from "@/lib/money"
import { listStoreProducts, type StoreProduct } from "@/lib/products"

export type Lamp = {
  id: string
  handle: string
  title: string
  images: string[]
  hideOnMobile: boolean
  prices: {
    mobile: string
    tablet: string
    desktop: string
  }
  sort: number
}

function asBool(value: unknown): boolean {
  return value === true || value === "true"
}

function asNumber(value: unknown, fallback: number): number {
  const amount = typeof value === "number" ? value : Number(value)
  return Number.isFinite(amount) ? amount : fallback
}

function toLamp(product: StoreProduct): Lamp & { band: string } {
  const metadata = product.metadata ?? {}
  const lamp = findAdminLamp(product.handle || product.title || "")
  const calculated = product.variants?.[0]?.calculated_price?.calculated_amount
  const images = (product.images ?? [])
    .map((image) => image.url)
    .filter((url): url is string => Boolean(url))
  const price = formatMoney(metadata.price_mobile ?? calculated ?? lamp?.price)

  return {
    id: product.id,
    handle: product.handle || lamp?.handle || slugifyLamp(product.title || "lamp"),
    title: product.title || lamp?.title || "Lamp",
    images: images.length ? images : lamp?.catalogImage ? [lamp.catalogImage] : [],
    hideOnMobile: asBool(metadata.hide_on_mobile) || Boolean(lamp?.hideOnMobile),
    prices: {
      mobile: formatMoney(metadata.price_mobile) || price,
      tablet: formatMoney(metadata.price_tablet) || price,
      desktop: formatMoney(metadata.price_desktop) || price,
    },
    sort: asNumber(metadata.sort, lamp?.sort ?? 0),
    band: String(metadata.band ?? lamp?.band ?? ""),
  }
}

export async function getHomepageLamps(): Promise<{
  bestSellers: Lamp[]
  popular: Lamp[]
}> {
  try {
    const products = await listStoreProducts()
    const lamps = products.map(toLamp)
    const bySort = (left: Lamp, right: Lamp) => left.sort - right.sort

    return {
      bestSellers: lamps.filter((lamp) => lamp.band === "best-sellers").sort(bySort),
      popular: lamps.filter((lamp) => lamp.band === "most-popular").sort(bySort),
    }
  } catch {
    return { bestSellers: [], popular: [] }
  }
}
