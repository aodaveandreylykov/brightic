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
        <h1>Thank you!</h1>
        <p className="order-id">Order {order?.id || id || "placed"}</p>
        <p className="order-lead">
          {order?.email
            ? `Confirmation will be sent to ${order.email}.`
            : "Your order has been placed. It will appear in Medusa Admin: /app/orders."}
        </p>

        {order?.items?.length ? (
          <div className="order-items">
            {order.items.map((item) => (
              <div key={item.id} className="order-line">
                <span>
                  {item.product_title || item.title} × {item.quantity || 1}
                </span>
                <span>{formatMoney(item.total ?? item.unit_price)}</span>
              </div>
            ))}
            <div className="order-total">
              <strong>Total:</strong>
              <strong>{formatMoney(order.total)}</strong>
            </div>
          </div>
        ) : null}

        <a className="order-btn" href="/catalog">
          Continue shopping
        </a>
      </main>
    </div>
  )
}
