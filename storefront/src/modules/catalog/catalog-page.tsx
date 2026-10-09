import type { CSSProperties } from "react"
import { catalogCards, type CatalogCard, type Shot } from "@/modules/catalog/catalog-cards"
import "./catalog.css"

const kindClass: Record<CatalogCard["kind"], string> = {
  sq: "lamp lamp--sq",
  mid: "lamp lamp--mid",
  wide: "lamp lamp--wide",
  "t-sm": "lamp lamp--t-sm",
  "t-lg": "lamp lamp--t-lg",
  m: "lamp lamp--m",
}

function imageStyle(shot: Shot): CSSProperties {
  return {
    width: `${100 / shot.sx}%`,
    height: `${100 / shot.sy}%`,
    left: `${(-shot.tx / shot.sx) * 100}%`,
    top: `${(-shot.ty / shot.sy) * 100}%`,
  }
}

function shotBox(card: CatalogCard, flow: boolean): CSSProperties {
  if (!flow) {
    return { left: card.shot.x, top: card.shot.y, width: card.shot.w, height: card.shot.h }
  }
  return {
    left: `${(card.shot.x / card.width) * 100}%`,
    top: `${(card.shot.y / card.height) * 100}%`,
    width: `${(card.shot.w / card.width) * 100}%`,
    height: `${(card.shot.h / card.height) * 100}%`,
  }
}

function LampCard({ card, photos, flow = false }: { card: CatalogCard; photos: string; flow?: boolean }) {
  return (
    <article
      className={kindClass[card.kind]}
      data-bp={card.bp}
      style={flow ? undefined : { left: card.left, top: card.top, width: card.width, height: card.height }}
    >
      <div className="lamp__shot" style={shotBox(card, flow)}>
        <img src={`${photos}/${card.image}`} alt="" style={imageStyle(card.shot)} />
      </div>
      <p className="lamp__name">{card.name}</p>
      {card.bp === "d" ? (
        <div className="lamp__meta">
          <p className="lamp__blurb">{card.blurb}</p>
          <p className="lamp__price">{card.price}</p>
        </div>
      ) : (
        <>
          <p className="lamp__blurb" style={{ top: card.blurbTop, left: 10 }}>
            {card.blurb}
          </p>
          <p className="lamp__price" style={{ top: card.priceTop, right: 10 }}>
            {card.price}
          </p>
        </>
      )}
    </article>
  )
}

export function CatalogPage({
  home,
  catalog,
  shop,
  photos,
}: {
  home: string
  catalog: string
  shop: string
  photos: string
}) {
  const section = (hash: string) => `${home}#${hash}`
  const desktop = catalogCards.filter((card) => card.bp === "d")
  const desktopRows: Array<{ variant: "mid" | "sq" | "wide"; cards: CatalogCard[] }> = [
    { variant: "sq", cards: [desktop[0], desktop[1], desktop[2], desktop[3]] },
    { variant: "mid", cards: [desktop[4], desktop[5], desktop[6]] },
    { variant: "sq", cards: [desktop[7], desktop[8], desktop[9], desktop[10]] },
    { variant: "wide", cards: [desktop[11], desktop[12]] },
  ]

  return (
    <div className="page catalog-page">
      <header className="header">
        <a className="logo" href={home} aria-label="Brightic">
          <img src={`${shop}/logo.svg`} width="175" height="42" alt="" />
        </a>
        <nav className="nav" aria-label="Primary">
          <a href={catalog}>Catalog</a>
          <a href={section("collections")}>News</a>
          <a href={section("contact")}>Contact</a>
          <a href={section("about")}>Help</a>
        </nav>
        <div className="header__tools">
          <div className="lang" role="group" aria-label="Language">
            <button type="button" className="lang__btn is-active" data-lang="en" aria-pressed="true">
              EN
            </button>
            <span aria-hidden="true">/</span>
            <button type="button" className="lang__btn" data-lang="ru" aria-pressed="false">
              RU
            </button>
          </div>
          <div className="header__icons header__icons--desk">
            <button type="button" className="icon-btn" data-panel="search" aria-expanded="false" aria-controls="panel-search" aria-label="Search">
              <img src={`${shop}/icon-a.svg`} width="30" height="30" alt="" />
            </button>
            <button type="button" className="icon-btn" data-panel="account" aria-expanded="false" aria-controls="panel-account" aria-label="Account">
              <img src={`${shop}/icon-b.svg`} width="30" height="30" alt="" />
            </button>
            <button type="button" className="icon-btn" data-panel="saved" aria-expanded="false" aria-controls="panel-saved" aria-label="Saved">
              <img src={`${shop}/icon-c.svg`} width="30" height="30" alt="" />
            </button>
            <button type="button" className="icon-btn" data-panel="cart" aria-expanded="false" aria-controls="panel-cart" aria-label="Basket">
              <img src={`${shop}/icon-d.svg`} width="30" height="30" alt="" />
            </button>
          </div>
          <div className="header__icons header__icons--compact">
            <button type="button" className="icon-btn icon-btn--profile" data-panel="account" aria-expanded="false" aria-controls="panel-account" aria-label="Account">
              <img src={`${shop}/icon-profile.svg`} width="24" height="24" alt="" />
            </button>
            <button type="button" className="icon-btn" data-panel="cart" aria-expanded="false" aria-controls="panel-cart" aria-label="Basket">
              <img src={`${shop}/icon-union.svg`} width="21" height="22" alt="" />
            </button>
            <button type="button" className="burger" aria-expanded="false" aria-controls="menu">
              <span></span>
              <span></span>
              <span></span>
              <span className="visually-hidden">Open menu</span>
            </button>
          </div>
        </div>
      </header>

      <div className="menu" id="menu" hidden>
        <nav aria-label="Mobile">
          <a href={catalog}>Catalog</a>
          <a href={section("collections")}>News</a>
          <a href={section("contact")}>Contact</a>
          <a href={section("about")}>Help</a>
        </nav>
      </div>

      <div className="panel" id="panel-search" hidden>
        <form className="panel__form" role="search">
          <label className="visually-hidden" htmlFor="q">
            Search the catalog
          </label>
          <input id="q" name="q" type="search" placeholder="Search lamps" />
          <button type="submit" className="btn">
            Search
          </button>
        </form>
      </div>
      <div className="panel" id="panel-account" hidden>
        <p>Sign in to save lamps and track an order.</p>
        <a className="btn" href={section("contact")}>
          Contact
        </a>
      </div>
      <div className="panel" id="panel-saved" hidden>
        <p>Saved lamps will appear here.</p>
        <a className="btn" href={catalog}>
          View catalogue
        </a>
      </div>
      <div className="panel" id="panel-cart" hidden>
        <p>Your basket is empty.</p>
        <a className="btn" href={catalog}>
          View catalogue
        </a>
      </div>

      <main>
        <div className="catalog-bar">
          <div className="catalog-bar__side">
            <span className="catalog-bar__filter">Filter</span>
            <span className="catalog-bar__chevron">
              <img src={`${photos}/chevron.svg`} width="8" height="6" alt="" />
            </span>
          </div>
          <div className="catalog-bar__sort">
            <span className="catalog-bar__muted">sort by:</span>
            <span>new arrival</span>
            <span className="catalog-bar__chevron">
              <img src={`${photos}/chevron.svg`} width="8" height="6" alt="" />
            </span>
          </div>
        </div>

        <div className="catalog-board">
          <div className="catalog-rows">
            {desktopRows.map((row) => (
              <div key={row.cards.map((card) => card.name).join("-")} className={`catalog-row catalog-row--${row.variant}`} data-cards={row.cards.length}>
                {row.cards.map((card) => (
                  <LampCard key={`${row.variant}-${card.name}-${card.price}`} card={card} photos={photos} flow />
                ))}
              </div>
            ))}
          </div>
          {catalogCards
            .filter((card) => card.bp !== "d")
            .map((card, index) => (
              <LampCard key={`${card.bp}-${index}`} card={card} photos={photos} />
            ))}
        </div>

        <div className="catalog-pager">
          <span className="catalog-pager__more">SHOW MORE</span>
          <div className="catalog-pager__row">
            <span className="catalog-pager__turn catalog-pager__turn--prev">
              <img src={`${photos}/page-prev.svg`} width="20" height="20" alt="" />
            </span>
            <div className="catalog-pager__nums">
              <span className="is-current">1</span>
              <span>2</span>
              <span>3</span>
            </div>
            <span className="catalog-pager__turn catalog-pager__turn--next">
              <img src={`${photos}/page-next.svg`} width="20" height="20" alt="" />
            </span>
          </div>
        </div>
      </main>

      <footer className="footer">
        <img className="footer__mark" src={`${shop}/wordmark.svg`} width="403" height="100" alt="Brightic" />
        <div className="footer__col">
          <h2>Navigation</h2>
          <a href={catalog}>Catalog</a>
          <a href={section("about")}>About the company</a>
          <a href={section("about")}>FAQ</a>
          <a href={section("contact")}>Contacts</a>
        </div>
        <div className="footer__col">
          <h2>Internal sections</h2>
          <a href={section("collections")}>New collections</a>
          <a href={section("popular")}>Popular products</a>
          <a href={catalog}>Selected</a>
          <button type="button" data-panel="cart" aria-controls="panel-cart">
            Basket
          </button>
        </div>
        <div className="footer__col">
          <h2>Legal information</h2>
          <a href={section("contact")}>Privacy Policy</a>
          <a href={section("contact")}>Public Offer</a>
        </div>
        <div className="footer__social">
          <a href="https://t.me" aria-label="Telegram">
            <img src={`${shop}/icon-telegram.svg`} width="40" height="40" alt="" />
          </a>
          <a href="https://instagram.com" aria-label="Instagram">
            <img src={`${shop}/icon-instagram.svg`} width="40" height="40" alt="" />
          </a>
          <a href="https://vk.com" aria-label="VK">
            <img src={`${shop}/icon-vk.svg`} width="40" height="40" alt="" />
          </a>
        </div>
        <p className="footer__copy">©  2026 Brightic. All rights reserved</p>
        <div className="footer__pay">
          <img src={`${shop}/pay-apple.svg`} width="37" height="30" alt="Apple Pay" />
          <img src={`${shop}/pay-visa.svg`} width="30" height="30" alt="Visa" />
          <img src={`${shop}/pay-mastercard.svg`} width="30" height="30" alt="Mastercard" />
          <img src={`${shop}/pay-paypal.svg`} width="24" height="24" alt="PayPal" />
        </div>
      </footer>
    </div>
  )
}
