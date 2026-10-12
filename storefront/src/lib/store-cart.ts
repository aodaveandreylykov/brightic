import { sdk } from "@/lib/medusa"

export const CART_ID_KEY = "cart_id"

const CART_FIELDS =
  "*items,*items.variant,*items.product,*items.product.images,+items.total,+items.subtotal,+item_total,+total,+subtotal"

export type StoreCartItem = {
  id: string
  title?: string | null
  subtitle?: string | null
  thumbnail?: string | null
  quantity?: number | null
  unit_price?: number | null
  total?: number | null
  variant_id?: string | null
  product_title?: string | null
  product_description?: string | null
  product?: {
    title?: string | null
    description?: string | null
    images?: { url?: string | null }[] | null
  } | null
}

export type StoreCart = {
  id: string
  currency_code?: string
  item_total?: number | null
  total?: number | null
  items?: StoreCartItem[] | null
}

type StoreProduct = {
  id: string
  title?: string | null
  handle?: string | null
  description?: string | null
  images?: { url?: string | null }[] | null
  variants?: { id?: string | null }[] | null
}

let inflightCart: Promise<StoreCart> | null = null

function storedCartId() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CART_ID_KEY)
}

function persistCartId(id: string) {
  localStorage.setItem(CART_ID_KEY, id)
}

export async function getRegionId() {
  const { regions } = await sdk.store.region.list({ limit: 50 })
  const region =
    regions.find((item: { currency_code?: string }) => item.currency_code === "usd") ?? regions[0]
  if (!region?.id) throw new Error("No Medusa region is available")
  return region.id as string
}

export async function retrieveCart(cartId: string) {
  const { cart } = await sdk.store.cart.retrieve(cartId, { fields: CART_FIELDS })
  return cart as StoreCart
}

export async function ensureCart() {
  if (inflightCart) return inflightCart

  inflightCart = (async () => {
    const existingId = storedCartId()
    if (existingId) {
      try {
        return await retrieveCart(existingId)
      } catch {
        localStorage.removeItem(CART_ID_KEY)
      }
    }

    const region_id = await getRegionId()
    const { cart } = await sdk.store.cart.create({ region_id })
    persistCartId(cart.id)
    return retrieveCart(cart.id)
  })()

  try {
    return await inflightCart
  } finally {
    inflightCart = null
  }
}

export async function addLineItem(variantId: string, quantity = 1) {
  const cart = await ensureCart()
  const { cart: next } = await sdk.store.cart.createLineItem(
    cart.id,
    { variant_id: variantId, quantity },
    { fields: CART_FIELDS }
  )
  persistCartId(next.id)
  return next as StoreCart
}

export async function updateLineItem(lineItemId: string, quantity: number) {
  const cart = await ensureCart()
  const { cart: next } = await sdk.store.cart.updateLineItem(
    cart.id,
    lineItemId,
    { quantity },
    { fields: CART_FIELDS }
  )
  return next as StoreCart
}

export async function deleteLineItem(lineItemId: string) {
  const cart = await ensureCart()
  const { parent } = await sdk.store.cart.deleteLineItem(cart.id, lineItemId, {
    fields: CART_FIELDS,
  })
  return (parent as StoreCart) ?? retrieveCart(cart.id)
}

function norm(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase()
}

export async function findVariantId(input: {
  variantId?: string
  productId?: string
  title?: string
  handle?: string
}) {
  if (input.variantId) return input.variantId
  if (input.productId?.startsWith("variant_")) return input.productId

  if (input.productId?.startsWith("prod_")) {
    const { product } = (await sdk.store.product.retrieve(input.productId, {
      fields: "id,title,handle,*variants",
    })) as { product: StoreProduct }
    const variantId = product.variants?.[0]?.id
    if (!variantId) throw new Error("This product has no variant")
    return variantId
  }

  const query = input.title || input.handle || ""
  const { products } = await sdk.store.product.list({
    q: query || undefined,
    limit: 50,
    fields: "id,title,handle,*variants",
  })

  const list = (products || []) as StoreProduct[]
  const title = input.title ? norm(input.title) : ""
  const handle = input.handle ? norm(input.handle) : ""
  const match =
    list.find((product) => (product.title ? norm(product.title) === title : false)) ||
    list.find((product) => (product.handle ? norm(product.handle) === handle : false)) ||
    list.find((product) => (product.title ? norm(product.title).includes(title) : false)) ||
    list[0]

  const variantId = match?.variants?.[0]?.id
  if (!variantId) throw new Error("Could not find this lamp in Medusa")
  return variantId
}
