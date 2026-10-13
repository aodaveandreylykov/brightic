import AddToCartButton from "@/modules/cart/add-to-cart-button"
import type { ProductView, RelatedLamp } from "@/lib/products"

export function Specs({ product }: { product: ProductView }) {
  return (
    <div className="specs">
      <p>
        <span className="dim">Material: </span>
        <span>{product.material}</span>
      </p>
      <p>
        <span className="dim">Category:</span>
        <span>{product.category}</span>
      </p>
      <p>
        <span className="dim">Color:</span>
        <span>{product.color}</span>
      </p>
    </div>
  )
}

export function Qty({ minus, plus }: { minus: string; plus: string }) {
  return (
    <div className="qty">
      <button type="button" className="qty__dec" aria-label="Decrease quantity">
        <img src={minus} alt="" />
      </button>
      <span className="qty__n">1 </span>
      <button type="button" className="qty__inc" aria-label="Increase quantity">
        <img src={plus} alt="" />
      </button>
    </div>
  )
}

export function Accordion({
  className,
  title,
  open = false,
}: {
  className: string
  title: string
  open?: boolean
}) {
  return (
    <button type="button" className={`acc ${className}${open ? " is-open" : ""}`}>
      <span>{title}</span>
      <img className="acc__plus" src="/assets/product/acc-plus.svg" alt="" />
      <i className="acc__minus"></i>
    </button>
  )
}

export function BuyButton({ product }: { product: ProductView }) {
  return (
    <AddToCartButton
      variantId={product.variantId || undefined}
      handle={product.handle}
      title={product.title}
      productId={product.id.startsWith("prod_") ? product.id : undefined}
    />
  )
}

export function RelatedCard({
  item,
  className,
  heart,
  photoClass,
  named = true,
  stacked = false,
}: {
  item: RelatedLamp
  className: string
  heart: string
  photoClass: string
  named?: boolean
  stacked?: boolean
}) {
  return (
    <a className={`also ${className}`} href={`/product/${item.handle}`}>
      <span className="also__photo">
        <img className={photoClass} src={item.image} alt="" />
      </span>
      <img className="also__heart" src={heart} alt="" />
      {named ? <p className="also__name">{item.title}</p> : null}
      {stacked ? (
        <div className="also__meta">
          <p className="also__blurb">{item.blurb}</p>
          <p className="also__price">{item.priceLabel}</p>
        </div>
      ) : (
        <>
          <p className="also__blurb">{item.blurb}</p>
          <p className="also__price">{item.priceLabel}</p>
        </>
      )}
    </a>
  )
}

export function CareList({ product }: { product: ProductView }) {
  return (
    <ul className="bullets">
      {product.bullets.map((bullet) => (
        <li key={bullet}>
          <img src="/assets/product/dot.svg" alt="" />
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  )
}
