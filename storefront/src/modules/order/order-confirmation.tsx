"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { formatMoney } from "@/lib/money"
import { readRememberedOrder, type StoreOrder } from "@/lib/store-cart"
import "@/modules/checkout/checkout.css"

export default function OrderConfirmation() {
  const search = useSearchParams()
  const id = search.get("id") || ""
  const [order, setOrder] = useState<StoreOrder | null>(null)

  useEffect(() => {
    if (id) setOrder(readRememberedOrder(id))
  }, [id])

  return (
    <div className="order-page">
      <header className="header">
        <a className="logo" href="/" aria-label="Brightic">
          <img src="/assets/shop/logo.svg" width="175" height="42" alt="" />
        </a>
        <nav className="nav" aria-label="Primary">
          <a href="/catalog">Catalog</a>
          <a href="/">Home</a>
        </nav>
      </header>
      <main className="order-shell">
        <h1>Спасибо за заказ</h1>
        <p className="order-id">Заказ {order?.id || id || "оформлен"}</p>
        <p className="checkout-lead">
          {order?.email
            ? `Подтверждение отправим на ${order.email}.`
            : "Заказ оформлен. Он появится в Medusa Admin: /app/orders."}
        </p>
        {order?.items?.length ? (
          <aside className="checkout-summary">
            {order.items.map((item) => (
              <p key={item.id} className="checkout-line">
                <span>
                  {item.product_title || item.title} × {item.quantity || 1}
                </span>
                <span>{formatMoney(item.total ?? item.unit_price)}</span>
              </p>
            ))}
            <p className="checkout-line checkout-line--total">
              <span>Итого</span>
              <span>{formatMoney(order.total)}</span>
            </p>
          </aside>
        ) : null}
        <div className="checkout-actions">
          <a className="checkout-btn checkout-btn--dark" href="/catalog">
            Продолжить покупки
          </a>
        </div>
      </main>
    </div>
  )
}
