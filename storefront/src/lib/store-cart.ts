import { sdk } from "@/lib/medusa"
import { slugifyLamp } from "@/lib/admin-catalog"

export const CART_ID_KEY = "cart_id"
export const LAST_ORDER_KEY = "brightic_last_order"

const CART_FIELDS =
  "*items,*items.variant,*items.product,*items.product.images,+items.total,+items.subtotal,+item_total,+total,+subtotal,*shipping_address,*billing_address,*shipping_methods,*payment_collection,*payment_collection.payment_sessions,*region,*region.countries,+shipping_total,+email"

export type CartAddress = {
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  company?: string | null
  postal_code?: string | null
  city?: string | null
  country_code?: string | null
  province?: string | null
  phone?: string | null
}

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
  email?: string | null
  currency_code?: string
  region_id?: string | null
  item_total?: number | null
  shipping_total?: number | null
  total?: number | null
  items?: StoreCartItem[] | null
  shipping_address?: CartAddress | null
  billing_address?: CartAddress | null
  shipping_methods?: { id?: string; name?: string; amount?: number }[] | null
  payment_collection?: {
    payment_sessions?: {
      id?: string
      provider_id?: string
      data?: { client_secret?: string | null } | null
    }[] | null
  } | null
  region?: {
    id?: string
    currency_code?: string
    countries?: { iso_2?: string | null; display_name?: string | null }[] | null
  } | null
}

export type ShippingOption = {
  id: string
  name?: string | null
  amount?: number | null
  price_type?: string | null
}

export type PaymentProvider = {
  id: string
  is_enabled?: boolean
}

export type StoreOrder = {
  id: string
  email?: string | null
  total?: number | null
  currency_code?: string | null
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

export function forgetCart() {
  if (typeof window === "undefined") return
  localStorage.removeItem(CART_ID_KEY)
}

export function rememberOrder(order: StoreOrder) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order))
}

export function readRememberedOrder(id: string): StoreOrder | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_KEY)
    if (!raw) return null
    const order = JSON.parse(raw) as StoreOrder
    return order?.id === id ? order : null
  } catch {
    return null
  }
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

export async function updateCart(data: {
  email?: string
  shipping_address?: CartAddress
  billing_address?: CartAddress
}) {
  const cart = await ensureCart()
  const { cart: next } = await sdk.store.cart.update(cart.id, data, { fields: CART_FIELDS })
  persistCartId(next.id)
  return next as StoreCart
}

export async function listShippingOptions() {
  const cart = await ensureCart()
  const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
    cart_id: cart.id,
  })
  return (shipping_options || []) as ShippingOption[]
}

export async function addShippingMethod(optionId: string) {
  const cart = await ensureCart()
  const { cart: next } = await sdk.store.cart.addShippingMethod(cart.id, {
    option_id: optionId,
  })
  persistCartId(next.id)
  return retrieveCart(next.id)
}

export async function listPaymentProviders(regionId: string) {
  const { payment_providers } = await sdk.store.payment.listPaymentProviders({
    region_id: regionId,
  })
  return (payment_providers || []) as PaymentProvider[]
}

export async function initiatePaymentSession(providerId: string) {
  const cart = await ensureCart()
  await sdk.store.payment.initiatePaymentSession(cart, {
    provider_id: providerId,
  })
  return retrieveCart(cart.id)
}

export async function completeCart() {
  const cart = await ensureCart()
  return sdk.store.cart.complete(cart.id)
}

export function completeCartError(result: Awaited<ReturnType<typeof completeCart>>) {
  if (result.type === "cart" && result.error && typeof result.error === "object" && "message" in result.error) {
    return String(result.error.message || "Could not complete the order")
  }
  return "Could not complete the order"
}

export async function findVariantId(input: {
  variantId?: string
  productId?: string
  title?: string
  handle?: string
}) {
  if (input.variantId) return input.variantId
  if (input.productId?.startsWith("variant_")) return input.productId

  if (input.handle) {
    const { products } = await sdk.store.product.list({
      handle: slugifyLamp(input.handle),
      limit: 1,
      fields: "id,title,handle,*variants",
    })
    const variantId = (products?.[0] as StoreProduct | undefined)?.variants?.[0]?.id
    if (variantId) return variantId
  }

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
  const title = slugifyLamp(input.title || "")
  const handle = slugifyLamp(input.handle || "")
  const match =
    list.find((product) => slugifyLamp(product.handle || "") === handle) ||
    list.find((product) => slugifyLamp(product.title || "") === title) ||
    list.find((product) => slugifyLamp(product.title || "").includes(title)) ||
    list[0]

  const variantId = match?.variants?.[0]?.id
  if (!variantId) throw new Error("Could not find this lamp in Medusa")
  return variantId
}
