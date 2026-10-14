import { Suspense } from "react"
import CartTrigger from "@/modules/cart/cart-trigger"
import CheckoutFlow from "@/modules/checkout/checkout-flow"
import "@/modules/checkout/checkout.css"

export const metadata = {
  title: "Checkout — Brightic",
  description: "Доставка по России и оплата картой, СБП или при получении.",
}

export default function Page() {
  return (
    <div className="checkout-page">
      <header className="header">
        <a className="logo" href="/" aria-label="Brightic">
          <img src="/assets/shop/logo.svg" width="175" height="42" alt="" />
        </a>
        <nav className="nav" aria-label="Primary">
          <a href="/catalog">Catalog</a>
          <a href="/#collections">News</a>
          <a href="/#contact">Contact</a>
          <a href="/#about">Help</a>
        </nav>
        <div className="header__tools">
          <CartTrigger className="icon-btn">
            <img src="/assets/shop/icon-d.svg" width="30" height="30" alt="" />
          </CartTrigger>
        </div>
      </header>
      <Suspense fallback={
        <div className="checkout-empty" style={{ padding: "60px" }}>
          <p>Загружаем корзину…</p>
        </div>
      }>
        <CheckoutFlow />
      </Suspense>
    </div>
  )
}
