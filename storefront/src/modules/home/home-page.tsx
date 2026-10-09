import type { Lamp } from "@/lib/catalog"
import { ProductBand } from "@/modules/home/product-band"

const storeSections = [
  "Facets of light",
  "Warm outline",
  "Urban glow",
  "Lunar path",
  "Echo of materials",
  "Momentum",
  "Quiet light",
  "Golden hour",
  "Geometry of shadow",
  "Flow of forms",
  "Industrial pulse",
  "Crystal haze",
]

const collectionTiles = [
  ["tile--crystal", "/assets/shop/col-crystal.jpg", "Crystal Haze"],
  ["tile--golden", "/assets/shop/col-golden.jpg", "Golden Hour"],
  ["tile--warm", "/assets/shop/col-warm.jpg", "Warm Outline"],
  ["tile--facets", "/assets/shop/col-facets.jpg", "Facets of Light"],
  ["tile--geometry", "/assets/shop/col-geometry.jpg", "Geometry of Shadow"],
  ["tile--lunar", "/assets/shop/col-lunar.jpg", "Lunar Path"],
  ["tile--quiet", "/assets/shop/col-quiet.jpg", "Quiet Light"],
  ["tile--industrial", "/assets/shop/col-industrial.jpg", "Industrial Pulse"],
  ["tile--urban", "/assets/shop/col-urban.jpg", "Urban Glow"],
  ["tile--momentum", "/assets/shop/col-momentum.jpg", "Momentum"],
] as const

export function HomePage({
  bestSellers,
  popular,
}: {
  bestSellers: Lamp[]
  popular: Lamp[]
}) {
  return (
    <div className="page">
      <header className="header">
        <a className="logo" href="/" aria-label="Brightic">
          <img src="/assets/shop/logo.svg" width="175" height="42" alt="" />
        </a>
        <nav className="nav" aria-label="Primary">
          <a href="#catalog">Catalog</a>
          <a href="#collections">News</a>
          <a href="#contact">Contact</a>
          <a href="#about">Help</a>
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
              <img src="/assets/shop/icon-a.svg" width="30" height="30" alt="" />
            </button>
            <button type="button" className="icon-btn" data-panel="account" aria-expanded="false" aria-controls="panel-account" aria-label="Account">
              <img src="/assets/shop/icon-b.svg" width="30" height="30" alt="" />
            </button>
            <button type="button" className="icon-btn" data-panel="saved" aria-expanded="false" aria-controls="panel-saved" aria-label="Saved">
              <img src="/assets/shop/icon-c.svg" width="30" height="30" alt="" />
            </button>
            <button type="button" className="icon-btn" data-panel="cart" aria-expanded="false" aria-controls="panel-cart" aria-label="Basket">
              <img src="/assets/shop/icon-d.svg" width="30" height="30" alt="" />
            </button>
          </div>
          <div className="header__icons header__icons--compact">
            <button type="button" className="icon-btn icon-btn--profile" data-panel="account" aria-expanded="false" aria-controls="panel-account" aria-label="Account">
              <img src="/assets/shop/icon-profile.svg" width="24" height="24" alt="" />
            </button>
            <button type="button" className="icon-btn" data-panel="cart" aria-expanded="false" aria-controls="panel-cart" aria-label="Basket">
              <img src="/assets/shop/icon-union.svg" width="21" height="22" alt="" />
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
          <a href="#catalog">Catalog</a>
          <a href="#collections">News</a>
          <a href="#contact">Contact</a>
          <a href="#about">Help</a>
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
        <a className="btn" href="#contact">
          Contact
        </a>
      </div>
      <div className="panel" id="panel-saved" hidden>
        <p>Saved lamps will appear here.</p>
        <a className="btn" href="/catalog">
          View catalogue
        </a>
      </div>
      <div className="panel" id="panel-cart" hidden>
        <p>Your basket is empty.</p>
        <a className="btn" href="/catalog">
          View catalogue
        </a>
      </div>

      <main>
        <section className="hero" aria-label="Design born of light">
          <div className="hero__media">
            <img src="/assets/shop/hero.jpg" alt="" />
          </div>
          <p className="hero__eyebrow">Create an atmosphere</p>
          <p className="hero__lead">
            Turn every room into a gallery: our designer table lamps are designed to be the main accent of the interior – with impeccable detail workmanship, noble materials and light that highlights textures and creates the atmosphere you need at any time of the day
          </p>
          <a className="btn hero__cta" href="#collections">
            View collection
          </a>
          <h1 className="hero__title">
            <span className="hero__design">Design</span>
            <span className="hero__born">
              born <em>of light</em>
            </span>
          </h1>
        </section>

        <ProductBand
          id="catalog"
          title="best-sellers"
          lamps={bestSellers}
          scrollerClass="scroller scroller--best"
        />

        <section className="store" aria-labelledby="store-title">
          <h2 id="store-title">
            <span>Store</span> <span>sections</span>
          </h2>
          <ul className="store__list">
            {storeSections.map((name) => (
              <li key={name}>
                <a href="#collections" className={name === "Lunar path" ? "is-active" : undefined}>
                  {name}
                </a>
              </li>
            ))}
          </ul>
          <img className="store__photo" src="/assets/shop/store-lamp.png" alt="Table lamp from the Lunar Path collection" />
        </section>

        <section className="collections" id="collections">
          <div className="collections__copy">
            <h2>All collections</h2>
            <p className="collections__lead collections__lead--full">
              Discover all our collections—each light fixture is designed to serve as a meaningful focal point. From understated minimalism to expressive artistic forms—find the style that matches your mood. A variety of styles, materials, and lighting scenarios to suit any interior
            </p>
            <p className="collections__lead collections__lead--short">
              Discover all our collections—each light fixture is designed to serve as a meaningful focal point. From understated minimalism to expressive artistic forms—find the style that matches your mood. A variety of styles and lighting scenarios to suit any interior
            </p>
            <a className="btn btn--dark" href="#catalog">
              View collections
            </a>
          </div>
          {collectionTiles.map(([className, src, caption]) => (
            <figure key={caption} className={`tile ${className}`}>
              <img src={src} alt="" />
              <figcaption>{caption}</figcaption>
            </figure>
          ))}
        </section>

        <ProductBand
          id="popular"
          title="Most popular lamps"
          lamps={popular}
          popular
          scrollerClass="scroller scroller--pop"
        />

        <section className="about" id="about">
          <div className="about__intro">
            <h2>About the brand</h2>
            <p className="about__lead about__lead--full">
              We create designer table lamps, where every detail is subject to the idea: the light should not only illuminate, but also reveal the space. Our collections combine original design, noble materials and thoughtful ergonomics. We work with proven manufacturers and control quality at every stage – from sketch to final assembly
            </p>
            <p className="about__lead about__lead--mid">
              We create designer table lamps, where every detail is subject to the idea: the light should not only illuminate, but also reveal the space. Our collections combine original design, noble materials and thoughtful ergonomics. We work with proven manufacturers and control quality at every stage
            </p>
            <p className="about__lead about__lead--short">
              We create designer table lamps, where every detail is subject to the idea: the light should not only illuminate, but also reveal the space
            </p>
            <a className="btn about__btn" href="#about">
              Learn more
            </a>
            <a className="link-more about__link" href="#about">
              Learn more
            </a>
          </div>
          <div className="stats">
            <article className="stat">
              <div className="stat__mark">
                <span>buyers ///</span>
              </div>
              <p className="stat__num">70%+</p>
              <p className="stat__text">
                Clients appreciate that the actual product perfectly matches the photos and descriptions on our website. They love how the light fixtures look in their interiors and enjoy the experience of interacting with our brand. This loyalty is the result of our attention to detail at every stage, from design to delivery. We view repeat purchases as the most valuable validation of the quality of our work.
              </p>
            </article>
            <article className="stat">
              <div className="stat__mark">
                <span>raiting ///</span>
              </div>
              <p className="stat__num">4.8+</p>
              <p className="stat__text">
                Buyers particularly highlight the striking design of the light fixtures and their well-thought-out ergonomics. Reviews also frequently mention the reliability of the materials and the quality of the craftsmanship. The way the light from our lamps transforms the room&apos;s atmosphere plays a significant role as well.
              </p>
            </article>
            <article className="stat">
              <div className="stat__mark">
                <span>collections ///</span>
              </div>
              <p className="stat__num">10+</p>
              <p className="stat__text">
                Each collection represents a carefully considered stylistic narrative, ranging from minimalist forms to expressive art objects. This approach enables the customer to instantly gauge the interior’s mood and find a light fixture that does more than just fit in—it becomes a focal point that defines the room&apos;s character.
              </p>
            </article>
          </div>
        </section>

        <section className="reviews" id="reviews" aria-roledescription="carousel" aria-label="Reviews">
          <div className="reviews__intro">
            <h2>
              <span>Confidence confirmed</span> <span>by reviews</span>
            </h2>
            <p>
              Our luminaires live in real interiors – and we are proud of every feedback. Here are the honest opinions of buyers: about the quality of materials, ease of use and how light changes the atmosphere of the room. Let someone else’s experience help you find your perfect accent for home
            </p>
          </div>
          <div className="reviews__viewport">
            <div className="reviews__track">
              <article className="review review--beige">
                <p>
                  “I bought a Velum lamp for the bedroom – and it was a top ten. The light is so soft that you always have a “golden hour”. It became the main emphasis: guests immediately notice and ask where it was taken. Looks more expensive, materials are nice, assembly is neat. Now I&apos;m looking at another one! “
                </p>
                <footer>
                  <img src="/assets/shop/avatar-marina.jpg" width="65" height="65" alt="" />
                  <span>
                    <strong>Marina Smirnova</strong>Moscow
                  </span>
                </footer>
              </article>
              <article className="review">
                <p>
                  &quot;I was looking for a unique gift for a designer friend and stumbled upon your &apos;Urban Glow&apos; collection. I chose a model with graphic shapes and a metal body—it fit perfectly into her loft-style interior. She absolutely loves it; she says it’s not just a lamp, but a genuine art piece. Thanks for the great selection and fast delivery—it arrived just in time for her birthday!&quot;
                </p>
                <footer>
                  <img src="/assets/shop/avatar-elena.jpg" width="65" height="65" alt="" />
                  <span>
                    <strong>Elena Fischer</strong>Vienna
                  </span>
                </footer>
              </article>
              <article className="review review--desk">
                <p>
                  “I work as an interior designer in Milan, often picking accent items for projects. The Geometry of Shadow collection is one of the best solutions for creating expressive light scenarios. Customers regularly ask me where I get these lamps. Quality and packaging at the height! »
                </p>
                <footer>
                  <img src="/assets/shop/avatar-sofia.jpg" width="65" height="65" alt="" />
                  <span>
                    <strong>Sofia Rossi</strong>Rome
                  </span>
                </footer>
              </article>
            </div>
          </div>
          <div className="reviews__nav reviews__nav--desk">
            <div className="reviews__bar" aria-hidden="true">
              <i></i>
            </div>
            <div className="reviews__arrows">
              <button type="button" className="arrow" data-dir="-1" aria-label="Previous review">
                <img src="/assets/shop/arrow-a.svg" width="60" height="56" alt="" />
              </button>
              <button type="button" className="arrow" data-dir="1" aria-label="Next review">
                <img src="/assets/shop/arrow-b.svg" width="60" height="56" alt="" />
              </button>
            </div>
          </div>
          <div className="reviews__nav reviews__nav--mob">
            <button type="button" className="arrow arrow--line" data-dir="-1" aria-label="Previous review">
              <img src="/assets/shop/arrow-mob.svg" width="71" height="15" alt="" />
            </button>
            <button type="button" className="arrow arrow--line" data-dir="1" aria-label="Next review">
              <img src="/assets/shop/arrow-mob.svg" width="71" height="15" alt="" />
            </button>
          </div>
        </section>

        <section className="contact" id="contact">
          <h2>Get in touch</h2>
          <form className="form" action="#contact" method="post">
            <div className="form__row">
              <label className="field">
                <span>Name</span>
                <input type="text" name="name" required autoComplete="name" />
              </label>
              <label className="field">
                <span>Email</span>
                <input type="email" name="email" required autoComplete="email" />
              </label>
            </div>
            <label className="field field--message">
              <span>Message</span>
              <textarea name="message" required></textarea>
            </label>
            <label className="check">
              <input type="checkbox" name="terms" required />
              <span>
                I have read and accepting with <a href="#contact">Privacy Policy</a> and <a href="#contact">Terms Conditions</a>
              </span>
            </label>
            <button className="btn btn--submit" type="submit">
              submit
            </button>
            <p className="form__note" role="status" hidden>
              Message sent. We will write back shortly.
            </p>
          </form>
        </section>
      </main>

      <footer className="footer">
        <img className="footer__mark" src="/assets/shop/wordmark.svg" width="403" height="100" alt="Brightic" />
        <div className="footer__col">
          <h2>Navigation</h2>
          <a href="#catalog">Catalog</a>
          <a href="#about">About the company</a>
          <a href="#about">FAQ</a>
          <a href="#contact">Contacts</a>
        </div>
        <div className="footer__col">
          <h2>Internal sections</h2>
          <a href="#collections">New collections</a>
          <a href="#popular">Popular products</a>
          <a href="#catalog">Selected</a>
          <button type="button" data-panel="cart" aria-controls="panel-cart">
            Basket
          </button>
        </div>
        <div className="footer__col">
          <h2>Legal information</h2>
          <a href="#contact">Privacy Policy</a>
          <a href="#contact">Public Offer</a>
        </div>
        <div className="footer__social">
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
        <p className="footer__copy">©  2026 Brightic. All rights reserved</p>
        <div className="footer__pay">
          <img src="/assets/shop/pay-apple.svg" width="37" height="30" alt="Apple Pay" />
          <img src="/assets/shop/pay-visa.svg" width="30" height="30" alt="Visa" />
          <img src="/assets/shop/pay-mastercard.svg" width="30" height="30" alt="Mastercard" />
          <img src="/assets/shop/pay-paypal.svg" width="24" height="24" alt="PayPal" />
        </div>
      </footer>
    </div>
  )
}
