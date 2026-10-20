import CartTrigger from "@/modules/cart/cart-trigger"
import type { ProductView } from "@/lib/products"
import { withBase } from "@/lib/base-path"
import {
  Accordion,
  BuyButton,
  CareList,
  Qty,
  RelatedCard,
  Specs,
} from "@/modules/product/product-blocks"
import "@/modules/product/product.css"

function related(product: ProductView, index: number) {
  return product.related[index] || product.related[0]
}

function Thumbs({ product }: { product: ProductView }) {
  const crops = ["img-main", "img-s2", "img-s3", "img-s4", "img-s5"]
  return (
    <div className="thumbs">
      {product.images.map((src, index) => (
        <button
          key={`${src}-${index}`}
          type="button"
          className={`thumb${index === 0 ? " is-on" : ""}`}
          data-crop={crops[index] || "img-main"}
          data-src={src}
        >
          <span className="thumb__crop">
            <img className="img-fit" src={src} alt="" />
          </span>
        </button>
      ))}
    </div>
  )
}

function NavMenu() {
  return (
    <div className="pdp-menu" hidden>
      <a href="/catalog">Catalog</a>
      <a href="/#collections">News</a>
      <a href="/#contact">Contact</a>
      <a href="/#about">Help</a>
    </div>
  )
}

function FooterCols() {
  return (
    <>
      <div className="ft__col ft__col-a">
        <h2>Navigation</h2>
        <a href="/catalog">Catalog</a>
        <a href="/#about">About the company</a>
        <a href="/#about">FAQ</a>
        <a href="/#contact">Contacts</a>
      </div>
      <div className="ft__col ft__col-b">
        <h2>Internal sections</h2>
        <a href="/#collections">New collections</a>
        <a href="/#popular">Popular products</a>
        <a href="/catalog">Selected</a>
        <CartTrigger className="footer-cart-link">Basket</CartTrigger>
      </div>
      <div className="ft__col ft__col-c">
        <h2>Legal information</h2>
        <a href="/#contact">Privacy Policy</a>
        <a href="/#contact">Public Offer</a>
      </div>
    </>
  )
}

export function ProductPage({ product }: { product: ProductView }) {
  const r = (index: number) => related(product, index)

  return (
    <div className="pdp">
      <div className="pdp-fit">
        <div className="pdp-frame pdp-frame--m">
          <header className="hd">
            <a className="hd__logo" href="/" aria-label="Brightic">
              <img src="/assets/shop/logo.svg" width="87" height="20" alt="" />
            </a>
            <div className="hd__tools">
              <CartTrigger>
                <img src="/assets/shop/icon-union.svg" width="19" height="20" alt="" />
              </CartTrigger>
              <button type="button" className="pdp-burger" aria-expanded="false" aria-label="Open menu">
                <i></i>
                <i></i>
                <i></i>
              </button>
            </div>
          </header>
          <NavMenu />
          <div className="stage">
            <img className="stage__img img-main" src={product.images[0]} alt={product.title} />
          </div>
          <div className="peek" aria-hidden="true">
            <img className="img-s2" src={product.images[1]} alt="" />
          </div>
          <h1 className="title">{product.title}</h1>
          <p className="price">{product.priceLabel}</p>
          <Specs product={product} />
          <Qty minus="/assets/product/qty-minus-t.svg" plus="/assets/product/qty-plus-t.svg" />
          <BuyButton product={product} />
          <div className="rule rule-a"></div>
          <Accordion className="acc-a" title="product care" open />
          <p className="care">{product.care}</p>
          <CareList product={product} />
          <div className="rule rule-b"></div>
          <div className="rule rule-c"></div>
          <div className="rule rule-d"></div>
          <Accordion className="acc-b" title="shipping & returnes" />
          <Accordion className="acc-c" title="details & care" />
          <h2 className="like">you may also like</h2>
          {r(0) ? (
            <RelatedCard item={r(0)} className="also-1" heart="/assets/product/heart-m.svg" photoClass="img-echo" />
          ) : null}
          {r(1) ? (
            <RelatedCard item={r(1)} className="also-2" heart="/assets/product/heart-m.svg" photoClass="img-lumen" />
          ) : null}
          <footer className="ft">
            <div className="ft__line ft__line-a"></div>
            <div className="ft__line ft__line-b"></div>
            <FooterCols />
            <div className="ft__social">
              <a href="https://t.me" aria-label="Telegram">
                <img src="/assets/shop/icon-telegram.svg" width="20" height="20" alt="" />
              </a>
              <a href="https://instagram.com" aria-label="Instagram">
                <img src="/assets/shop/icon-instagram.svg" width="20" height="20" alt="" />
              </a>
              <a href="https://vk.com" aria-label="VK">
                <img src="/assets/shop/icon-vk.svg" width="20" height="20" alt="" />
              </a>
            </div>
            <div className="ft__pay">
              <img src="/assets/product/pay-apple-m.svg" alt="Apple Pay" />
              <img src="/assets/product/pay-visa-m.svg" alt="Visa" />
              <img src="/assets/product/pay-mc-m.svg" alt="Mastercard" />
              <img src="/assets/product/pay-paypal-m.svg" alt="PayPal" />
            </div>
            <p className="ft__copy">©  2026 Brightic. All rights reserved</p>
          </footer>
        </div>

        <div className="pdp-frame pdp-frame--t">
          <header className="hd">
            <a className="hd__logo" href="/" aria-label="Brightic">
              <img src="/assets/shop/logo.svg" width="135" height="32" alt="" />
            </a>
            <div className="hd__tools">
              <button type="button" aria-label="Account">
                <img src="/assets/shop/icon-profile.svg" width="24" height="24" alt="" />
              </button>
              <CartTrigger>
                <img src="/assets/shop/icon-union.svg" width="21" height="22" alt="" />
              </CartTrigger>
              <button type="button" className="pdp-burger" aria-expanded="false" aria-label="Open menu">
                <i></i>
                <i></i>
                <i></i>
              </button>
            </div>
          </header>
          <NavMenu />
          <div className="stage">
            <img className="stage__img img-main" src={product.images[0]} alt={product.title} />
            <Thumbs product={product} />
          </div>
          <h1 className="title">{product.title}</h1>
          <p className="price">{product.priceLabel}</p>
          <Specs product={product} />
          <Qty minus="/assets/product/qty-minus-t.svg" plus="/assets/product/qty-plus-t.svg" />
          <BuyButton product={product} />
          <div className="lead">
            <p>{product.description}</p>
          </div>
          <div className="rule rule-a"></div>
          <div className="rule rule-b"></div>
          <div className="rule rule-c"></div>
          <div className="rule rule-d"></div>
          <Accordion className="acc-a" title="product care" />
          <Accordion className="acc-b" title="shipping & returnes" />
          <Accordion className="acc-c" title="details & care" />
          <h2 className="like">you may also like</h2>
          {r(0) ? (
            <RelatedCard item={r(0)} className="also-1" heart="/assets/product/heart-t.svg" photoClass="img-echo" />
          ) : null}
          {r(1) ? (
            <RelatedCard item={r(1)} className="also-2" heart="/assets/product/heart-t.svg" photoClass="img-lumen" />
          ) : null}
          {r(2) ? (
            <RelatedCard
              item={r(2)}
              className="also-3"
              heart="/assets/product/heart-t.svg"
              photoClass="img-facet"
              named={false}
            />
          ) : null}
          <footer className="ft">
            <div className="ft__line ft__line-a"></div>
            <div className="ft__line ft__line-b"></div>
            <div className="ft__vline"></div>
            <img className="ft__mark" src="/assets/shop/wordmark.svg" alt="Brightic" />
            <FooterCols />
            <div className="ft__social">
              <a href="https://t.me" aria-label="Telegram">
                <img src="/assets/shop/icon-telegram.svg" width="20" height="20" alt="" />
              </a>
              <a href="https://instagram.com" aria-label="Instagram">
                <img src="/assets/shop/icon-instagram.svg" width="20" height="20" alt="" />
              </a>
              <a href="https://vk.com" aria-label="VK">
                <img src="/assets/shop/icon-vk.svg" width="20" height="20" alt="" />
              </a>
            </div>
            <p className="ft__copy">©  2026 Brightic. All rights reserved</p>
            <div className="ft__pay">
              <img src="/assets/shop/pay-apple.svg" width="37" height="30" alt="Apple Pay" />
              <img src="/assets/shop/pay-visa.svg" width="30" height="30" alt="Visa" />
              <img className="pay-mc" src="/assets/shop/pay-mastercard.svg" width="28" height="28" alt="Mastercard" />
              <img className="pay-pp" src="/assets/shop/pay-paypal.svg" width="24" height="24" alt="PayPal" />
            </div>
          </footer>
        </div>

        <div className="pdp-frame pdp-frame--d">
          <header className="hd">
            <nav className="hd__nav" aria-label="Primary">
              <a href="/catalog">Catalog</a>
              <a href="/#collections">News</a>
              <a href="/#contact">Contact</a>
              <a href="/#about">Help</a>
            </nav>
            <a className="hd__logo" href="/" aria-label="Brightic">
              <img src="/assets/shop/logo.svg" width="175" height="42" alt="" />
            </a>
            <div className="hd__end">
              <div className="hd__lang">
                <span>EN</span>
                <span>/</span>
                <span className="is-dim">RU</span>
              </div>
              <div className="hd__tools">
                <button type="button" aria-label="Search">
                  <img src="/assets/shop/icon-a.svg" width="30" height="30" alt="" />
                </button>
                <button type="button" aria-label="Account">
                  <img src="/assets/shop/icon-b.svg" width="30" height="30" alt="" />
                </button>
                <button type="button" aria-label="Saved">
                  <img src="/assets/shop/icon-c.svg" width="30" height="30" alt="" />
                </button>
                <CartTrigger>
                  <img src="/assets/shop/icon-d.svg" width="30" height="30" alt="" />
                </CartTrigger>
              </div>
            </div>
          </header>
          <Thumbs product={product} />
          <div className="stage">
            <img className="stage__img img-main" src={product.images[0]} alt={product.title} />
          </div>
          <h1 className="title">{product.title}</h1>
          <p className="price">{product.priceLabel}</p>
          <Specs product={product} />
          <p className="lead">{product.description}</p>
          <Qty minus="/assets/product/qty-minus.svg" plus="/assets/product/qty-plus.svg" />
          <BuyButton product={product} />
          <button type="button" className="fav" aria-label="Save" aria-pressed="false">
            <img src={withBase("/assets/product/heart.svg")} alt="" />
          </button>
          <div className="rule rule-a"></div>
          <div className="rule rule-b"></div>
          <div className="rule rule-c"></div>
          <div className="rule rule-d"></div>
          <Accordion className="acc-a" title="product care" />
          <Accordion className="acc-b" title="shipping & returnes" />
          <Accordion className="acc-c" title="details & care" />
          <h2 className="like">you may also like</h2>
          {r(0) ? (
            <RelatedCard
              item={r(0)}
              className="also-1"
              heart="/assets/product/heart-card.svg"
              photoClass="img-d1"
              stacked
            />
          ) : null}
          {r(1) ? (
            <RelatedCard
              item={r(1)}
              className="also-2"
              heart="/assets/product/heart-card.svg"
              photoClass="img-d2"
              stacked
            />
          ) : null}
          {r(2) ? (
            <RelatedCard
              item={r(2)}
              className="also-3"
              heart="/assets/product/heart-card.svg"
              photoClass="img-d3"
              stacked
            />
          ) : null}
          {r(3) ? (
            <RelatedCard
              item={r(3)}
              className="also-4"
              heart="/assets/product/heart-card.svg"
              photoClass="img-d4"
              stacked
            />
          ) : null}
          <footer className="ft">
            <div className="ft__line ft__line-a"></div>
            <div className="ft__line ft__line-b"></div>
            <div className="ft__vline"></div>
            <img className="ft__mark" src="/assets/shop/wordmark.svg" width="403" height="100" alt="Brightic" />
            <FooterCols />
            <div className="ft__social">
              <a href="https://t.me" aria-label="Telegram">
                <img src="/assets/shop/icon-telegram.svg" width="40" height="40" alt="" />
              </a>
              <a href="https://instagram.com" aria-label="Instagram">
                <img src="/assets/shop/icon-instagram.svg" width="40" height="40" alt="" />
              </a>
              <a href="https://vk.com" aria-label="VK">
                <img src="/assets/shop/icon-vk.svg" width="40" height="40" alt="" />
              </a>
            </div>
            <p className="ft__copy">©  2026 Brightic. All rights reserved</p>
            <div className="ft__pay">
              <img src="/assets/shop/pay-apple.svg" width="37" height="30" alt="Apple Pay" />
              <img src="/assets/shop/pay-visa.svg" width="30" height="30" alt="Visa" />
              <img src="/assets/shop/pay-mastercard.svg" width="30" height="30" alt="Mastercard" />
              <img className="pay-pp" src="/assets/shop/pay-paypal.svg" width="24" height="24" alt="PayPal" />
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
