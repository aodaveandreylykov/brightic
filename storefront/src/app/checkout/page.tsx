import CartTrigger from "@/modules/cart/cart-trigger"
import CheckoutFlow from "@/modules/checkout/checkout-flow"
import "@/modules/checkout/checkout.css"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Checkout — Brightic",
  description: "Complete your Brightic lamp order.",
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
      <main className="checkout-shell">
        <h1>Checkout</h1>
        <p className="checkout-lead">Email, address, delivery, and payment — then the order lands in Admin.</p>
        <CheckoutFlow />
      </main>
    </div>
  )
}
