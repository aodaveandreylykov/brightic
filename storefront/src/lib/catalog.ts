import { sdk } from "@/lib/medusa"

export type Lamp = {
  id: string
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

type StoreProduct = {
  id: string
  title: string
  images?: { url?: string | null }[] | null
  metadata?: Record<string, unknown> | null
  variants?: {
    calculated_price?: { calculated_amount?: number | null } | null
  }[] | null
}

function money(value: unknown, fallback: unknown): string {
  const raw = value ?? fallback
  const amount = typeof raw === "number" ? raw : Number(raw)
  if (!Number.isFinite(amount)) return ""
  return `$ ${Math.round(amount)}`
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
  const calculated = product.variants?.[0]?.calculated_price?.calculated_amount
  const images = (product.images ?? [])
    .map((image) => image.url)
    .filter((url): url is string => Boolean(url))

  return {
    id: product.id,
    title: product.title,
    images,
    hideOnMobile: asBool(metadata.hide_on_mobile),
    prices: {
      mobile: money(metadata.price_mobile, calculated),
      tablet: money(metadata.price_tablet, calculated),
      desktop: money(metadata.price_desktop, calculated),
    },
    sort: asNumber(metadata.sort, 0),
    band: String(metadata.band ?? ""),
  }
}

export async function getHomepageLamps(): Promise<{
  bestSellers: Lamp[]
  popular: Lamp[]
}> {
  const { regions } = await sdk.store.region.list({ limit: 50 })
  const region =
    regions.find((item: { currency_code?: string }) => item.currency_code === "usd") ??
    regions[0]

  const { products } = await sdk.store.product.list({
    limit: 50,
    region_id: region?.id,
    fields: "id,title,handle,*images,+metadata,*variants.calculated_price",
  })

  const lamps = (products as StoreProduct[]).map(toLamp)
  const bySort = (left: Lamp, right: Lamp) => left.sort - right.sort

  return {
    bestSellers: lamps
      .filter((lamp) => lamp.band === "best-sellers")
      .sort(bySort),
    popular: lamps.filter((lamp) => lamp.band === "most-popular").sort(bySort),
  }
}
