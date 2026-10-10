import "@/modules/product/product.css"

export function ProductPage() {
  return (
<div className="pdp">
    <div className="pdp-fit">
      <div className="pdp-frame pdp-frame--m">
        <header className="hd">
          <a className="hd__logo" href="/" aria-label="Brightic"><img src="/assets/shop/logo.svg" width="87" height="20" alt="" /></a>
          <div className="hd__tools">
            <button type="button" aria-label="Basket"><img src="/assets/shop/icon-union.svg" width="19" height="20" alt="" /></button>
            <button type="button" className="pdp-burger" aria-expanded="false" aria-label="Open menu"><i></i><i></i><i></i></button>
          </div>
        </header>
        <div className="pdp-menu" hidden>
          <a href="/catalog">Catalog</a>
          <a href="/#collections">News</a>
          <a href="/#contact">Contact</a>
          <a href="/#about">Help</a>
        </div>
        <div className="stage">
          <img className="stage__img img-main" src="/assets/product/shot-1.png" alt="Flux Line" />
        </div>
        <div className="peek" aria-hidden="true">
          <img className="img-s2" src="/assets/product/shot-2.png" alt="" />
        </div>
        <h1 className="title">Flux Line</h1>
        <p className="price">$ 750</p>
        <div className="specs">
          <p><span className="dim">Material: </span><span>marble/metal</span></p>
          <p><span className="dim">Category:</span><span>living room</span></p>
          <p><span className="dim">Color:</span><span>beige</span></p>
        </div>
        <div className="qty">
          <button type="button" className="qty__dec" aria-label="Decrease quantity"><img src="/assets/product/qty-minus-t.svg" alt="" /></button>
          <span className="qty__n">1 </span>
          <button type="button" className="qty__inc" aria-label="Increase quantity"><img src="/assets/product/qty-plus-t.svg" alt="" /></button>
        </div>
        <button type="button" className="buy">add to cart</button>
        <div className="rule rule-a"></div>
        <button type="button" className="acc acc-a is-open">
          <span>product care</span>
          <img className="acc__plus" src="/assets/product/acc-plus.svg" alt="" />
          <i className="acc__minus"></i>
        </button>
        <p className="care">With its terrazzo base, gold-toned rods, and sleek matte shade, this stylish table lamp makes a striking statement in any interior. Its thoughtful design and high-quality materials ensure durability, allowing it to retain its aesthetic appeal for years to come. Maintenance is effortless, requiring only regular, gentle cleaning and adherence to simple care guidelines.</p>
        <ul className="bullets">
          <li><img src="/assets/product/dot.svg" alt="" /><span>Do not place the lamp in humid areas or in direct sunlight</span></li>
          <li><img src="/assets/product/dot.svg" alt="" /><span>The optimal indoor humidity level is 40–60%</span></li>
          <li><img src="/assets/product/dot.svg" alt="" /><span>Do not exceed the recommended bulb wattage and use only LED bulbs</span></li>
          <li><img src="/assets/product/dot.svg" alt="" /><span>When transporting or moving the lamp, hold it by its substantial base</span></li>
        </ul>
        <div className="rule rule-b"></div>
        <div className="rule rule-c"></div>
        <div className="rule rule-d"></div>
        <button type="button" className="acc acc-b">
          <span>shipping &amp; returnes</span>
          <img className="acc__plus" src="/assets/product/acc-plus.svg" alt="" />
          <i className="acc__minus"></i>
        </button>
        <button type="button" className="acc acc-c">
          <span>details &amp; care</span>
          <img className="acc__plus" src="/assets/product/acc-plus.svg" alt="" />
          <i className="acc__minus"></i>
        </button>
        <h2 className="like">you may also like</h2>
        <a className="also also-1" href="/product">
          <span className="also__photo"><img className="img-echo" src="/assets/product/also-1.png" alt="" /></span>
          <img className="also__heart" src="/assets/product/heart-m.svg" alt="" />
          <p className="also__name">Striking red shade</p>
          <p className="also__blurb">Crimson Accent</p>
          <p className="also__price">$ 1300</p>
        </a>
        <a className="also also-2" href="/product">
          <span className="also__photo"><img className="img-lumen" src="/assets/product/also-glow-m.png" alt="" /></span>
          <img className="also__heart" src="/assets/product/heart-m.svg" alt="" />
          <p className="also__name">Glowform</p>
          <p className="also__blurb">sleek soft<br />illumination</p>
          <p className="also__price">$ 700</p>
        </a>
        <footer className="ft">
          <div className="ft__line ft__line-a"></div>
          <div className="ft__line ft__line-b"></div>
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
            <a href="/product">Basket</a>
          </div>
          <div className="ft__col ft__col-c">
            <h2>Legal information</h2>
            <a href="/#contact">Privacy Policy</a>
            <a href="/#contact">Public Offer</a>
          </div>
          <div className="ft__social">
            <a href="https://t.me" aria-label="Telegram"><img src="/assets/shop/icon-telegram.svg" width="20" height="20" alt="" /></a>
            <a href="https://instagram.com" aria-label="Instagram"><img src="/assets/shop/icon-instagram.svg" width="20" height="20" alt="" /></a>
            <a href="https://vk.com" aria-label="VK"><img src="/assets/shop/icon-vk.svg" width="20" height="20" alt="" /></a>
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
          <a className="hd__logo" href="/" aria-label="Brightic"><img src="/assets/shop/logo.svg" width="135" height="32" alt="" /></a>
          <div className="hd__tools">
            <button type="button" aria-label="Account"><img src="/assets/shop/icon-profile.svg" width="24" height="24" alt="" /></button>
            <button type="button" aria-label="Basket"><img src="/assets/shop/icon-union.svg" width="21" height="22" alt="" /></button>
            <button type="button" className="pdp-burger" aria-expanded="false" aria-label="Open menu"><i></i><i></i><i></i></button>
          </div>
        </header>
        <div className="pdp-menu" hidden>
          <a href="/catalog">Catalog</a>
          <a href="/#collections">News</a>
          <a href="/#contact">Contact</a>
          <a href="/#about">Help</a>
        </div>
        <div className="stage">
          <img className="stage__img img-main" src="/assets/product/shot-1.png" alt="Flux Line" />
          <div className="thumbs">
            <button type="button" className="thumb is-on" data-crop="img-main" data-src="/assets/product/shot-1.png"><span className="thumb__crop"><img className="img-fit" src="/assets/product/shot-1.png" alt="" /></span></button>
            <button type="button" className="thumb" data-crop="img-s2" data-src="/assets/product/shot-2.png"><span className="thumb__crop"><img className="img-s2" src="/assets/product/shot-2.png" alt="" /></span></button>
            <button type="button" className="thumb" data-crop="img-s3" data-src="/assets/product/shot-3.png"><span className="thumb__crop"><img className="img-s3" src="/assets/product/shot-3.png" alt="" /></span></button>
            <button type="button" className="thumb" data-crop="img-s4" data-src="/assets/product/shot-4.png"><span className="thumb__crop"><img className="img-s4" src="/assets/product/shot-4.png" alt="" /></span></button>
            <button type="button" className="thumb" data-crop="img-s5" data-src="/assets/product/shot-5.png"><span className="thumb__crop"><img className="img-s5" src="/assets/product/shot-5.png" alt="" /></span></button>
          </div>
        </div>
        <h1 className="title">Flux Line</h1>
        <p className="price">$ 750</p>
        <div className="specs">
          <p><span className="dim">Material: </span><span>marble/metal</span></p>
          <p><span className="dim">Category:</span><span>living room</span></p>
          <p><span className="dim">Color:</span><span>beige</span></p>
        </div>
        <div className="qty">
          <button type="button" className="qty__dec" aria-label="Decrease quantity"><img src="/assets/product/qty-minus-t.svg" alt="" /></button>
          <span className="qty__n">1 </span>
          <button type="button" className="qty__inc" aria-label="Increase quantity"><img src="/assets/product/qty-plus-t.svg" alt="" /></button>
        </div>
        <div className="lead">
          <p>An elegant table lamp featuring a modern minimalist style with touches of retro aesthetics. This model serves as a striking accent in a bedroom, living room, or home office. </p>
          <p>The base is crafted using the terrazzo technique; its textured surface—featuring dark gray flecks against a light beige background—highlights the handcrafted look and pairs seamlessly with warm gold-toned metal. Its thoughtful geometry and balanced proportions make the lamp versatile enough to complement a wide range of styles, from Scandi and minimalism to eclectic and mid-century modern.</p>
        </div>
        <div className="rule rule-a"></div>
        <div className="rule rule-b"></div>
        <div className="rule rule-c"></div>
        <div className="rule rule-d"></div>
        <button type="button" className="acc acc-a">
          <span>product care</span>
          <img className="acc__plus" src="/assets/product/acc-plus.svg" alt="" />
          <i className="acc__minus"></i>
        </button>
        <button type="button" className="acc acc-b">
          <span>shipping &amp; returnes</span>
          <img className="acc__plus" src="/assets/product/acc-plus.svg" alt="" />
          <i className="acc__minus"></i>
        </button>
        <button type="button" className="acc acc-c">
          <span>details &amp; care</span>
          <img className="acc__plus" src="/assets/product/acc-plus.svg" alt="" />
          <i className="acc__minus"></i>
        </button>
        <h2 className="like">you may also like</h2>
        <a className="also also-1" href="/product">
          <span className="also__photo"><img className="img-echo" src="/assets/product/also-1.png" alt="" /></span>
          <img className="also__heart" src="/assets/product/heart-t.svg" alt="" />
          <p className="also__name">Echo Glow</p>
          <p className="also__blurb">Subtle reflective<br />warmth</p>
          <p className="also__price">$ 800</p>
        </a>
        <a className="also also-2" href="/product">
          <span className="also__photo"><img className="img-lumen" src="/assets/product/also-glow-m.png" alt="" /></span>
          <img className="also__heart" src="/assets/product/heart-t.svg" alt="" />
          <p className="also__name">Lumenweave</p>
          <p className="also__blurb">Textured layered glow</p>
          <p className="also__price">$ 650</p>
        </a>
        <a className="also also-3" href="/product">
          <span className="also__photo"><img className="img-facet" src="/assets/product/also-facet-t.png" alt="" /></span>
          <img className="also__heart" src="/assets/product/heart-t.svg" alt="" />
          <p className="also__blurb">Elegant<br />faceted softness</p>
          <p className="also__price">$ 650</p>
        </a>
        <footer className="ft">
          <div className="ft__line ft__line-a"></div>
          <div className="ft__line ft__line-b"></div>
          <div className="ft__vline"></div>
          <img className="ft__mark" src="/assets/shop/wordmark.svg" alt="Brightic" />
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
            <a href="/product">Basket</a>
          </div>
          <div className="ft__col ft__col-c">
            <h2>Legal information</h2>
            <a href="/#contact">Privacy Policy</a>
            <a href="/#contact">Public Offer</a>
          </div>
          <div className="ft__social">
            <a href="https://t.me" aria-label="Telegram"><img src="/assets/shop/icon-telegram.svg" width="20" height="20" alt="" /></a>
            <a href="https://instagram.com" aria-label="Instagram"><img src="/assets/shop/icon-instagram.svg" width="20" height="20" alt="" /></a>
            <a href="https://vk.com" aria-label="VK"><img src="/assets/shop/icon-vk.svg" width="20" height="20" alt="" /></a>
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
          <a className="hd__logo" href="/" aria-label="Brightic"><img src="/assets/shop/logo.svg" width="175" height="42" alt="" /></a>
          <div className="hd__end">
            <div className="hd__lang"><span>EN</span><span>/</span><span className="is-dim">RU</span></div>
            <div className="hd__tools">
              <button type="button" aria-label="Search"><img src="/assets/shop/icon-a.svg" width="30" height="30" alt="" /></button>
              <button type="button" aria-label="Account"><img src="/assets/shop/icon-b.svg" width="30" height="30" alt="" /></button>
              <button type="button" aria-label="Saved"><img src="/assets/shop/icon-c.svg" width="30" height="30" alt="" /></button>
              <button type="button" aria-label="Basket"><img src="/assets/shop/icon-d.svg" width="30" height="30" alt="" /></button>
            </div>
          </div>
        </header>
        <div className="thumbs">
          <button type="button" className="thumb is-on" data-crop="img-main" data-src="/assets/product/shot-1.png"><span className="thumb__crop"><img className="img-fit" src="/assets/product/shot-1.png" alt="" /></span></button>
          <button type="button" className="thumb" data-crop="img-s2" data-src="/assets/product/shot-2.png"><span className="thumb__crop"><img className="img-s2" src="/assets/product/shot-2.png" alt="" /></span></button>
          <button type="button" className="thumb" data-crop="img-s3" data-src="/assets/product/shot-3.png"><span className="thumb__crop"><img className="img-s3" src="/assets/product/shot-3.png" alt="" /></span></button>
          <button type="button" className="thumb" data-crop="img-s4" data-src="/assets/product/shot-4.png"><span className="thumb__crop"><img className="img-s4" src="/assets/product/shot-4.png" alt="" /></span></button>
          <button type="button" className="thumb" data-crop="img-s5" data-src="/assets/product/shot-5.png"><span className="thumb__crop"><img className="img-s5" src="/assets/product/shot-5.png" alt="" /></span></button>
        </div>
        <div className="stage">
          <img className="stage__img img-main" src="/assets/product/shot-1.png" alt="Flux Line" />
        </div>
        <h1 className="title">Flux Line</h1>
        <p className="price">$ 750</p>
        <div className="specs">
          <p><span className="dim">Material: </span><span>marble/metal</span></p>
          <p><span className="dim">Category:</span><span>living room</span></p>
          <p><span className="dim">Color:</span><span>beige</span></p>
        </div>
        <p className="lead">An elegant table lamp featuring a modern minimalist style with touches of retro aesthetics. This model serves as a striking accent in a bedroom, living room, or home office. The base is crafted using the terrazzo technique; its textured surface—featuring dark gray flecks against a light beige background—highlights the handcrafted look and pairs seamlessly with warm gold-toned metal. Its thoughtful geometry and balanced proportions make the lamp versatile enough to complement a wide range of styles, from Scandi and minimalism to eclectic and mid-century modern.</p>
        <div className="qty">
          <button type="button" className="qty__dec" aria-label="Decrease quantity"><img src="/assets/product/qty-minus.svg" alt="" /></button>
          <span className="qty__n">1</span>
          <button type="button" className="qty__inc" aria-label="Increase quantity"><img src="/assets/product/qty-plus.svg" alt="" /></button>
        </div>
        <button type="button" className="buy">add to cart</button>
        <button type="button" className="fav" aria-label="Save" aria-pressed="false"><img src="/assets/product/heart.svg" alt="" /></button>
        <div className="rule rule-a"></div>
        <div className="rule rule-b"></div>
        <div className="rule rule-c"></div>
        <div className="rule rule-d"></div>
        <button type="button" className="acc acc-a">
          <span>product care</span>
          <img className="acc__plus" src="/assets/product/acc-plus.svg" alt="" />
          <i className="acc__minus"></i>
        </button>
        <button type="button" className="acc acc-b">
          <span>shipping &amp; returnes</span>
          <img className="acc__plus" src="/assets/product/acc-plus.svg" alt="" />
          <i className="acc__minus"></i>
        </button>
        <button type="button" className="acc acc-c">
          <span>details &amp; care</span>
          <img className="acc__plus" src="/assets/product/acc-plus.svg" alt="" />
          <i className="acc__minus"></i>
        </button>
        <h2 className="like">you may also like</h2>
        <a className="also also-1" href="/product">
          <span className="also__photo"><img className="img-d1" src="/assets/product/also-1.png" alt="" /></span>
          <img className="also__heart" src="/assets/product/heart-card.svg" alt="" />
          <p className="also__name">Stria Nova</p>
          <div className="also__meta">
            <p className="also__blurb">Subtle<br />reflective warmth</p>
            <p className="also__price">$ 800</p>
          </div>
        </a>
        <a className="also also-2" href="/product">
          <span className="also__photo"><img className="img-d2" src="/assets/product/also-2.png" alt="" /></span>
          <img className="also__heart" src="/assets/product/heart-card.svg" alt="" />
          <p className="also__name">Lumenweave</p>
          <div className="also__meta">
            <p className="also__blurb">Textured layered glow</p>
            <p className="also__price">$ 800</p>
          </div>
        </a>
        <a className="also also-3" href="/product">
          <span className="also__photo"><img className="img-d3" src="/assets/product/also-3.png" alt="" /></span>
          <img className="also__heart" src="/assets/product/heart-card.svg" alt="" />
          <p className="also__name">Crystal Veil</p>
          <div className="also__meta">
            <p className="also__blurb">Elegant<br />faceted softness</p>
            <p className="also__price">$ 800</p>
          </div>
        </a>
        <a className="also also-4" href="/product">
          <span className="also__photo"><img className="img-d4" src="/assets/product/also-4.png" alt="" /></span>
          <img className="also__heart" src="/assets/product/heart-card.svg" alt="" />
          <p className="also__name">Echo Glow</p>
          <div className="also__meta">
            <p className="also__blurb">clean<br />linear design</p>
            <p className="also__price">$ 800</p>
          </div>
        </a>
        <footer className="ft">
          <div className="ft__line ft__line-a"></div>
          <div className="ft__line ft__line-b"></div>
          <div className="ft__vline"></div>
          <img className="ft__mark" src="/assets/shop/wordmark.svg" width="403" height="100" alt="Brightic" />
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
            <a href="/product">Basket</a>
          </div>
          <div className="ft__col ft__col-c">
            <h2>Legal information</h2>
            <a href="/#contact">Privacy Policy</a>
            <a href="/#contact">Public Offer</a>
          </div>
          <div className="ft__social">
            <a href="https://t.me" aria-label="Telegram"><img src="/assets/shop/icon-telegram.svg" width="40" height="40" alt="" /></a>
            <a href="https://instagram.com" aria-label="Instagram"><img src="/assets/shop/icon-instagram.svg" width="40" height="40" alt="" /></a>
            <a href="https://vk.com" aria-label="VK"><img src="/assets/shop/icon-vk.svg" width="40" height="40" alt="" /></a>
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
