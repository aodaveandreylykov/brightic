import "@/modules/cart/cart.css"

const assets = "/assets/cart"

export type CartSuggest = {
  id: string
  title: string
  blurb: string
  price: number
  image: string
}

export const cartSuggestions: CartSuggest[] = [
  {
    id: "lumenweave",
    title: "Lumenweave",
    blurb: "Textured layered glow",
    price: 650,
    image: `${assets}/suggest-lumen.png`,
  },
  {
    id: "echo-glow",
    title: "Echo Glow",
    blurb: "Subtle reflective warmth",
    price: 120,
    image: `${assets}/suggest-echo.png`,
  },
]

export default function CartDrawer({ catalogHref = "/catalog" }: { catalogHref?: string }) {
  return (
    <>
      <button type="button" className="cart-backdrop" id="cart-backdrop" hidden aria-label="Close cart" />
      <div className="panel panel--cart" id="panel-cart" hidden>
        <div className="cart-drawer" data-cart-root>
          <div className="cart-drawer__head">
            <h2 className="cart-drawer__title" data-cart-title>
              Your Cart (0)
            </h2>
            <button type="button" className="cart-drawer__close" data-cart-close aria-label="Close cart">
              <img src={`${assets}/close.svg`} width="22" height="22" alt="" />
            </button>
          </div>
          <hr className="cart-drawer__rule" />

          <div className="cart-drawer__body">
            <div className="cart-drawer__empty" data-cart-empty>
              <p>Your basket is empty.</p>
              <a className="cart-drawer__empty-link" href={catalogHref}>
                View catalogue
              </a>
            </div>

            <div className="cart-drawer__items" data-cart-items hidden />

            <section className="cart-drawer__more" data-cart-more hidden aria-label="Add more light">
              <h3 className="cart-drawer__more-title">Add more light</h3>
              <div className="cart-suggest" data-cart-suggest>
                {cartSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="cart-suggest__card"
                    data-cart-suggest-add
                    data-id={item.id}
                    data-title={item.title}
                    data-blurb={item.blurb}
                    data-price={String(item.price)}
                    data-image={item.image}
                  >
                    <span className="cart-suggest__media">
                      <img src={item.image} alt="" />
                    </span>
                    <span className="cart-suggest__row">
                      <span className="cart-suggest__name">{item.title}</span>
                      <span className="cart-suggest__price">{`$ ${item.price}`}</span>
                    </span>
                    <span className="cart-suggest__blurb">{item.blurb}</span>
                    <span className="cart-suggest__qty">Quantity: 1</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="cart-drawer__foot" data-cart-foot hidden>
            <button type="button" className="cart-drawer__checkout" data-cart-checkout>
              Checkout - $ 0
            </button>
            <p className="cart-drawer__note">Shipping &amp; taxes calculated at checkout</p>
          </div>
        </div>
      </div>
    </>
  )
}
