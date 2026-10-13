"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { withBase } from "@/lib/base-path"
import {
  addItemToCart,
  deleteLineItem,
  ensureCart,
  forgetCart,
  updateLineItem,
  type StoreCart,
  type StoreCartItem,
} from "@/lib/store-cart"
import "@/modules/cart/cart.css"

const ASSETS = "/assets/cart"

export type CartItem = {
  id: string
  title: string
  blurb: string
  price: number
  qty: number
  image: string
}

type CartSuggest = {
  id: string
  title: string
  blurb: string
  price: number
  image: string
}

type AddPayload = {
  variantId?: string
  productId?: string
  title?: string
  handle?: string
  qty?: number
  price?: number
  image?: string
  blurb?: string
}

type CartContextValue = {
  cart: StoreCart | null
  items: CartItem[]
  open: boolean
  ready: boolean
  count: number
  total: number
  pending: boolean
  error: string
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (item: AddPayload) => Promise<void>
  removeItem: (id: string) => Promise<void>
  setQty: (id: string, qty: number) => Promise<void>
  applyCart: (next: StoreCart | null) => void
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

const SUGGESTIONS: CartSuggest[] = [
  {
    id: "lumenweave",
    title: "Lumenweave",
    blurb: "Textured layered glow",
    price: 650,
    image: `${ASSETS}/suggest-lumen.png`,
  },
  {
    id: "echo-glow",
    title: "Echo Glow",
    blurb: "Subtle reflective warmth",
    price: 1200,
    image: `${ASSETS}/suggest-echo.png`,
  },
]

const IMAGE_FALLBACK: Record<string, string> = {
  "flux line": `${ASSETS}/item-flux.png`,
  "steel petal": `${ASSETS}/item-steel.png`,
  lumenweave: `${ASSETS}/suggest-lumen.png`,
  "echo glow": `${ASSETS}/suggest-echo.png`,
}

function money(amount: number) {
  return `$ ${Math.round(amount || 0)}`
}

function titleOf(item: StoreCartItem) {
  return item.product_title || item.product?.title || item.title || "Lamp"
}

function blurbOf(item: StoreCartItem) {
  const raw = item.subtitle || item.product_description || item.product?.description || ""
  return raw.replace(/\s+/g, " ").trim()
}

function imageOf(item: StoreCartItem) {
  const title = titleOf(item).toLowerCase()
  return (
    item.thumbnail ||
    item.product?.images?.[0]?.url ||
    IMAGE_FALLBACK[title] ||
    `${ASSETS}/item-flux.png`
  )
}

function mapItems(cart?: StoreCart | null): CartItem[] {
  return (cart?.items ?? []).map((item) => ({
    id: item.id,
    title: titleOf(item),
    blurb: blurbOf(item),
    price: Number(item.unit_price) || 0,
    qty: Math.max(1, Number(item.quantity) || 1),
    image: imageOf(item),
  }))
}

function cartTotal(cart?: StoreCart | null, items: CartItem[] = []) {
  const fromCart = Number(cart?.item_total ?? cart?.total)
  if (Number.isFinite(fromCart) && fromCart > 0) return fromCart
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}

export default function CartProvider({
  children,
  catalogHref = "/catalog",
  checkoutHref = "/checkout",
}: {
  children: ReactNode
  catalogHref?: string
  checkoutHref?: string
}) {
  const [cart, setCart] = useState<StoreCart | null>(null)
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  const items = useMemo(() => mapItems(cart), [cart])
  const count = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items])
  const total = useMemo(() => cartTotal(cart, items), [cart, items])

  const openCart = useCallback(() => setOpen(true), [])
  const closeCart = useCallback(() => setOpen(false), [])
  const toggleCart = useCallback(() => setOpen((value) => !value), [])

  const loadCart = useCallback(async () => {
    try {
      const next = await ensureCart()
      setCart(next)
      setError("")
      return next
    } catch {
      setError("")
      return null
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    void loadCart()
  }, [loadCart])

  const run = useCallback(async (action: () => Promise<StoreCart | void>) => {
    setPending(true)
    setError("")
    try {
      const next = await action()
      if (next) setCart(next)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not update cart"
      setError(message)
      throw caught
    } finally {
      setPending(false)
    }
  }, [])

  const applyCart = useCallback((next: StoreCart | null) => {
    setCart(next)
  }, [])

  const refreshCart = useCallback(async () => {
    forgetCart()
    setCart(null)
    await loadCart()
  }, [loadCart])

  const addItem = useCallback(
    async (payload: AddPayload) => {
      await run(() => addItemToCart(payload))
    },
    [run]
  )

  const removeItem = useCallback(
    async (id: string) => {
      await run(() => deleteLineItem(id))
    },
    [run]
  )

  const setQty = useCallback(
    async (id: string, qty: number) => {
      const next = Math.max(0, Math.min(99, qty))
      await run(() => (next < 1 ? deleteLineItem(id) : updateLineItem(id, next)))
    },
    [run]
  )

  useEffect(() => {
    document.body.classList.toggle("cart-open", open)
  }, [open])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [closeCart])

  const value = useMemo(
    () => ({
      cart,
      items,
      open,
      ready,
      count,
      total,
      pending,
      error,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      setQty,
      applyCart,
      refreshCart,
    }),
    [
      cart,
      items,
      open,
      ready,
      count,
      total,
      pending,
      error,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      setQty,
      applyCart,
      refreshCart,
    ]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
      <button
        type="button"
        className={`cart-backdrop${open ? " is-open" : ""}`}
        id="cart-backdrop"
        data-cart-backdrop
        aria-label="Close cart"
        aria-hidden={open ? "false" : "true"}
        tabIndex={open ? 0 : -1}
        onClick={closeCart}
      />
      <aside
        className={`panel panel--cart${open ? " is-open" : ""}`}
        id="panel-cart"
        data-cart-panel
        aria-hidden={open ? "false" : "true"}
        aria-label="Your cart"
      >
        <div className="cart-drawer" data-cart-root>
          <div className="cart-drawer__head">
            <h2 className="cart-drawer__title">Your Cart ({count})</h2>
            <button type="button" className="cart-drawer__close" aria-label="Close cart" onClick={closeCart}>
              <img src={`${ASSETS}/close.svg`} width="22" height="22" alt="" />
            </button>
          </div>
          <hr className="cart-drawer__rule" />

          <div className="cart-drawer__body">
            {error ? <p className="cart-drawer__error">{error}</p> : null}

            {items.length === 0 ? (
              <div className="cart-drawer__empty">
                <p>Your basket is empty.</p>
                <a className="cart-drawer__empty-link" href={catalogHref} onClick={closeCart}>
                  View catalogue
                </a>
              </div>
            ) : (
              <>
                <div className="cart-drawer__items">
                  {items.map((item) => (
                    <div key={item.id}>
                      <article className="cart-item" data-cart-item data-id={item.id}>
                        <div className="cart-item__media">
                          <img src={item.image} alt="" />
                        </div>
                        <div className="cart-item__top">
                          <div className="cart-item__info">
                            <p className="cart-item__name">{item.title}</p>
                            <p className="cart-item__blurb">{item.blurb}</p>
                          </div>
                          <p className="cart-item__price">{money(item.price)}</p>
                        </div>
                        <p className="cart-item__qty-label">Quantity:</p>
                        <div className="cart-item__actions">
                          <div className="cart-qty">
                            <button
                              type="button"
                              className="cart-qty__btn cart-qty__btn--minus"
                              aria-label="Decrease quantity"
                              disabled={pending}
                              onClick={() => void setQty(item.id, item.qty - 1)}
                            >
                              <img src={`${ASSETS}/minus.svg`} width="16" height="1" alt="" />
                            </button>
                            <span className="cart-qty__n">{item.qty}</span>
                            <button
                              type="button"
                              className="cart-qty__btn cart-qty__btn--plus"
                              aria-label="Increase quantity"
                              disabled={pending}
                              onClick={() => void setQty(item.id, item.qty + 1)}
                            >
                              <img src={`${ASSETS}/plus.svg`} width="12" height="12" alt="" />
                            </button>
                          </div>
                          <button
                            type="button"
                            className="cart-item__remove"
                            disabled={pending}
                            onClick={() => void removeItem(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </article>
                      <hr className="cart-item__rule" />
                    </div>
                  ))}
                </div>

                <section className="cart-drawer__more" aria-label="Add more light">
                  <h3 className="cart-drawer__more-title">Add more light</h3>
                  <div className="cart-suggest">
                    {SUGGESTIONS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="cart-suggest__card"
                        disabled={pending}
                        onClick={() =>
                          void addItem({
                            handle: item.id,
                            title: item.title,
                            qty: 1,
                            price: item.price,
                            image: item.image,
                            blurb: item.blurb,
                          })
                        }
                      >
                        <span className="cart-suggest__media">
                          <img src={item.image} alt="" />
                        </span>
                        <span className="cart-suggest__row">
                          <span className="cart-suggest__name">{item.title}</span>
                          <span className="cart-suggest__price">{money(item.price)}</span>
                        </span>
                        <span className="cart-suggest__blurb">{item.blurb}</span>
                        <span className="cart-suggest__qty">Quantity: 1</span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>

          {items.length > 0 ? (
            <div className="cart-drawer__foot">
              <button
                type="button"
                className="cart-drawer__checkout"
                disabled={pending}
                onClick={() => {
                  closeCart()
                  window.location.href = withBase(checkoutHref)
                }}
              >
                Checkout - {money(total)}
              </button>
              <p className="cart-drawer__note">Shipping &amp; taxes calculated at checkout</p>
            </div>
          ) : null}
        </div>
      </aside>
    </CartContext.Provider>
  )
}
