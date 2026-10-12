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
import "@/modules/cart/cart.css"

const STORAGE_KEY = "brightic-cart"
const SEED_KEY = "brightic-cart-seeded"
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

type CartContextValue = {
  items: CartItem[]
  open: boolean
  count: number
  total: number
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void
  removeItem: (id: string) => void
  setQty: (id: string, qty: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const DEMO: CartItem[] = [
  {
    id: "flux-line",
    title: "Flux line",
    blurb: "Fluid modern light form",
    price: 750,
    qty: 1,
    image: `${ASSETS}/item-flux.png`,
  },
  {
    id: "steel-petal",
    title: "Steel Petal",
    blurb: "Subtle reflective warmth",
    price: 1200,
    qty: 1,
    image: `${ASSETS}/item-steel.png`,
  },
]

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
    price: 120,
    image: `${ASSETS}/suggest-echo.png`,
  },
]

function money(amount: number) {
  return `$ ${Math.round(amount || 0)}`
}

function normalize(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .filter((item) => typeof item.id === "string" && item.id)
    .map((item) => ({
      id: String(item.id),
      title: String(item.title || item.id),
      blurb: String(item.blurb || ""),
      price: Number(item.price) || 0,
      qty: Math.max(1, Math.min(99, Number(item.qty) || 1)),
      image: String(item.image || `${ASSETS}/item-flux.png`),
    }))
}

function readStorage(): CartItem[] {
  try {
    return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"))
  } catch {
    return []
  }
}

function writeStorage(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function ensureSeed(): CartItem[] {
  const existing = readStorage()
  if (localStorage.getItem(SEED_KEY)) return existing
  if (existing.length) {
    localStorage.setItem(SEED_KEY, "1")
    return existing
  }
  writeStorage(DEMO)
  localStorage.setItem(SEED_KEY, "1")
  return DEMO.map((item) => ({ ...item }))
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

export default function CartProvider({
  children,
  catalogHref = "/catalog",
}: {
  children: ReactNode
  catalogHref?: string
}) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setItems(ensureSeed())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    writeStorage(items)
  }, [items, ready])

  const count = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items])
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), [items])

  const openCart = useCallback(() => setOpen(true), [])
  const closeCart = useCallback(() => setOpen(false), [])
  const toggleCart = useCallback(() => setOpen((value) => !value), [])

  const addItem = useCallback((payload: Omit<CartItem, "qty"> & { qty?: number }) => {
    setItems((prev) => {
      const qty = Math.max(1, payload.qty || 1)
      const found = prev.some((item) => item.id === payload.id)
      if (!found) {
        return [
          ...prev,
          {
            id: payload.id,
            title: payload.title,
            blurb: payload.blurb,
            price: payload.price,
            qty,
            image: payload.image,
          },
        ]
      }
      return prev.map((item) =>
        item.id === payload.id
          ? {
              ...item,
              qty: Math.min(99, item.qty + qty),
              title: payload.title || item.title,
              blurb: payload.blurb || item.blurb,
              price: payload.price ?? item.price,
              image: payload.image || item.image,
            }
          : item
      )
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      const next = Math.max(0, Math.min(99, qty))
      if (next < 1) return prev.filter((item) => item.id !== id)
      return prev.map((item) => (item.id === id ? { ...item, qty: next } : item))
    })
  }, [])

  useEffect(() => {
    document.body.classList.toggle("cart-open", open)
  }, [open])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart()
    }

    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setItems(readStorage())
    }

    document.addEventListener("keydown", onKey)
    window.addEventListener("storage", onStorage)
    return () => {
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("storage", onStorage)
    }
  }, [closeCart])

  useEffect(() => {
    ;(window as Window & { BrighticCart?: Record<string, unknown> }).BrighticCart = {
      open: openCart,
      close: closeCart,
      toggle: toggleCart,
      add: addItem,
      isOpen: () => open,
    }
  }, [addItem, closeCart, open, openCart, toggleCart])

  const value = useMemo(
    () => ({
      items,
      open,
      count,
      total,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      setQty,
    }),
    [items, open, count, total, openCart, closeCart, toggleCart, addItem, removeItem, setQty]
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
                              onClick={() => setQty(item.id, item.qty - 1)}
                            >
                              <img src={`${ASSETS}/minus.svg`} width="16" height="1" alt="" />
                            </button>
                            <span className="cart-qty__n">{item.qty}</span>
                            <button
                              type="button"
                              className="cart-qty__btn cart-qty__btn--plus"
                              aria-label="Increase quantity"
                              onClick={() => setQty(item.id, item.qty + 1)}
                            >
                              <img src={`${ASSETS}/plus.svg`} width="12" height="12" alt="" />
                            </button>
                          </div>
                          <button
                            type="button"
                            className="cart-item__remove"
                            onClick={() => removeItem(item.id)}
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
                        onClick={() =>
                          addItem({
                            id: item.id,
                            title: item.title,
                            blurb: item.blurb,
                            price: item.price,
                            image: item.image,
                            qty: 1,
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
                onClick={() => {
                  closeCart()
                  window.location.href = catalogHref
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
