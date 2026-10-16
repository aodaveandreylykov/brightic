import { findAdminLamp, slugifyLamp } from "@/lib/admin-catalog"
import { sdk } from "@/lib/medusa"
import { pickRubRegion, STORE_CURRENCY } from "@/lib/ru"

export const CART_ID_KEY = "cart_id"
export const LOCAL_CART_KEY = "brightic_local_cart"
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
      data?: {
        client_secret?: string | null
        // Flat (legacy) — some providers return confirmation_url directly
        confirmation_url?: string | null
        confirmation_token?: string | null
        payment_id?: string | null
        // YooKassa returns { confirmation: { confirmation_url, type } }
        confirmation?: {
          type?: string | null
          confirmation_url?: string | null
        } | null
      } | null
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

export type CdekPoint = {
  code: string
  name: string
  address: string
  city?: string
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
  localStorage.removeItem(LOCAL_CART_KEY)
}

function emptyLocalCart(): StoreCart {
  return {
    id: "local_cart",
    currency_code: STORE_CURRENCY,
    items: [],
    item_total: 0,
    total: 0,
  }
}

function readLocalCart(): StoreCart {
  if (typeof window === "undefined") return emptyLocalCart()
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY)
    if (!raw) return emptyLocalCart()
    const parsed = JSON.parse(raw) as StoreCart
    return parsed?.id ? parsed : emptyLocalCart()
  } catch {
    return emptyLocalCart()
  }
}

function writeLocalCart(cart: StoreCart): StoreCart {
  const items = cart.items ?? []
  const item_total = items.reduce(
    (sum, item) => sum + (Number(item.unit_price) || 0) * Math.max(1, Number(item.quantity) || 1),
    0
  )
  const next: StoreCart = {
    ...cart,
    id: "local_cart",
    currency_code: STORE_CURRENCY,
    items,
    item_total,
    total: item_total,
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(next))
  }
  return next
}

export function isLocalCart(cart?: StoreCart | null) {
  return !cart?.id || cart.id === "local_cart"
}

export type AddToCartPayload = {
  variantId?: string
  productId?: string
  title?: string
  handle?: string
  qty?: number
  price?: number
  image?: string
  blurb?: string
}

export function addLocalLine(payload: AddToCartPayload): StoreCart {
  const cart = readLocalCart()
  const handle = slugifyLamp(payload.handle || payload.title || "lamp")
  const lamp = findAdminLamp(handle)
  const lineId = `local_${handle}`
  const qty = Math.max(1, payload.qty || 1)
  const items = [...(cart.items ?? [])]
  const existing = items.find((item) => item.id === lineId)
  if (existing) {
    existing.quantity = Math.max(1, Number(existing.quantity) || 1) + qty
  } else {
    items.push({
      id: lineId,
      title: payload.title || lamp?.title || "Lamp",
      subtitle: payload.blurb || lamp?.blurb || "",
      thumbnail: payload.image || lamp?.catalogImage || "/assets/cart/item-flux.png",
      quantity: qty,
      unit_price: payload.price ?? lamp?.price ?? 0,
      product_title: payload.title || lamp?.title || "Lamp",
    })
  }
  return writeLocalCart({ ...cart, items })
}

function updateLocalLine(lineItemId: string, quantity: number): StoreCart {
  const cart = readLocalCart()
  const items = (cart.items ?? [])
    .map((item) => (item.id === lineItemId ? { ...item, quantity } : item))
    .filter((item) => (item.quantity || 0) > 0)
  return writeLocalCart({ ...cart, items })
}

function deleteLocalLine(lineItemId: string): StoreCart {
  const cart = readLocalCart()
  return writeLocalCart({
    ...cart,
    items: (cart.items ?? []).filter((item) => item.id !== lineItemId),
  })
}

function mergeLocalItems(cart: StoreCart): StoreCart {
  const localItems = readLocalCart().items ?? []
  if (!localItems.length) return cart
  const existing = new Set((cart.items ?? []).map((item) => item.id))
  const extra = localItems.filter((item) => !existing.has(item.id))
  if (!extra.length) return cart
  const items = [...(cart.items ?? []), ...extra]
  const extraTotal = extra.reduce(
    (sum, item) => sum + (Number(item.unit_price) || 0) * Math.max(1, Number(item.quantity) || 1),
    0
  )
  return {
    ...cart,
    items,
    item_total: (Number(cart.item_total) || 0) + extraTotal,
    total: (Number(cart.total) || 0) + extraTotal,
  }
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
  const region = pickRubRegion(regions)
  if (!region?.id) throw new Error("Нет региона RUB в Medusa")
  return region.id as string
}

export async function retrieveCart(cartId: string) {
  const { cart } = await sdk.store.cart.retrieve(cartId, { fields: CART_FIELDS })
  return cart as StoreCart
}

export async function ensureCart() {
  if (inflightCart) return inflightCart

  inflightCart = (async () => {
    try {
      const existingId = storedCartId()
      let cart: StoreCart | null = null
      if (existingId && existingId !== "local_cart") {
        try {
          cart = await retrieveCart(existingId)
        } catch {
          localStorage.removeItem(CART_ID_KEY)
        }
      }
      if (!cart) {
        const region_id = await getRegionId()
        const created = await sdk.store.cart.create({ region_id, country_code: "ru" })
        persistCartId(created.cart.id)
        cart = await retrieveCart(created.cart.id)
      } else if (cart.currency_code && cart.currency_code !== STORE_CURRENCY) {
        try {
          const region_id = await getRegionId()
          if (region_id && region_id !== cart.region_id) {
            const { cart: next } = await sdk.store.cart.update(
              cart.id,
              { region_id },
              { fields: CART_FIELDS }
            )
            cart = next as StoreCart
          }
        } catch {
          /* keep the retrieved cart if the RUB region is not ready yet */
        }
      }
      return mergeLocalItems(cart)
    } catch {
      return readLocalCart()
    }
  })()

  try {
    return await inflightCart
  } finally {
    inflightCart = null
  }
}

export async function addLineItem(variantId: string, quantity = 1) {
  const cart = await ensureCart()
  if (isLocalCart(cart)) throw new Error("Medusa cart is unavailable")
  const { cart: next } = await sdk.store.cart.createLineItem(
    cart.id,
    { variant_id: variantId, quantity },
    { fields: CART_FIELDS }
  )
  persistCartId(next.id)
  return next as StoreCart
}

export async function addItemToCart(payload: AddToCartPayload) {
  const qty = Math.max(1, payload.qty || 1)
  try {
    const variantId = await findVariantId({
      variantId: payload.variantId,
      productId: payload.productId,
      title: payload.title,
      handle: payload.handle,
    })
    const next = await addLineItem(variantId, qty)
    if (typeof window !== "undefined") localStorage.removeItem(LOCAL_CART_KEY)
    return next
  } catch {
    return addLocalLine({ ...payload, qty })
  }
}

export async function updateLineItem(lineItemId: string, quantity: number) {
  if (lineItemId.startsWith("local_")) return updateLocalLine(lineItemId, quantity)
  try {
    const cart = await ensureCart()
    if (isLocalCart(cart)) return updateLocalLine(lineItemId, quantity)
    const { cart: next } = await sdk.store.cart.updateLineItem(
      cart.id,
      lineItemId,
      { quantity },
      { fields: CART_FIELDS }
    )
    return next as StoreCart
  } catch {
    return updateLocalLine(lineItemId, quantity)
  }
}

export async function deleteLineItem(lineItemId: string) {
  if (lineItemId.startsWith("local_")) return deleteLocalLine(lineItemId)
  try {
    const cart = await ensureCart()
    if (isLocalCart(cart)) return deleteLocalLine(lineItemId)
    const { parent } = await sdk.store.cart.deleteLineItem(cart.id, lineItemId, {
      fields: CART_FIELDS,
    })
    return (parent as StoreCart) ?? retrieveCart(cart.id)
  } catch {
    return deleteLocalLine(lineItemId)
  }
}

export async function updateCart(data: {
  email?: string
  shipping_address?: CartAddress
  billing_address?: CartAddress
  metadata?: Record<string, unknown>
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

export async function listCdekPoints(city: string): Promise<CdekPoint[]> {
  const query = city.trim()
  if (!query) return []
  try {
    const result = await sdk.client.fetch<{ points?: CdekPoint[] }>("/store/cdek/delivery-points", {
      method: "GET",
      query: { city: query },
    })
    return result.points || []
  } catch {
    return []
  }
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

export async function initiatePaymentSession(
  providerId: string,
  data?: Record<string, unknown>
) {
  const cart = await ensureCart()
  await sdk.store.payment.initiatePaymentSession(cart, {
    provider_id: providerId,
    data,
  })
  return retrieveCart(cart.id)
}

export async function completeCart() {
  const cart = await ensureCart()
  return sdk.store.cart.complete(cart.id)
}

export function completeCartError(result: Awaited<ReturnType<typeof completeCart>>) {
  if (result.type === "cart" && result.error && typeof result.error === "object" && "message" in result.error) {
    return String(result.error.message || "Не удалось оформить заказ")
  }
  return "Не удалось оформить заказ"
}

export async function findVariantId(input: {
  variantId?: string
  productId?: string
  title?: string
  handle?: string
}) {
  if (input.variantId && input.variantId.trim()) return input.variantId
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
    list.find((product) => (title ? slugifyLamp(product.title || "").includes(title) : false))

  const variantId = match?.variants?.[0]?.id
  if (!variantId) throw new Error("Could not find this lamp in Medusa")
  return variantId
}
