import type { Lamp } from "@/lib/catalog"
import { ProductCard } from "@/modules/home/product-card"

export function ProductBand({
  id,
  title,
  lamps,
  popular = false,
  scrollerClass,
}: {
  id?: string
  title: string
  lamps: Lamp[]
  popular?: boolean
  scrollerClass: string
}) {
  return (
    <section className="band" id={id}>
      <div className="band__head">
        <h2>{title}</h2>
        {popular ? null : (
          <a className="link-more" href="/catalog">
            View catalog
          </a>
        )}
        <a className="btn band__btn" href="/catalog">
          View catalogue
        </a>
      </div>
      <div className={scrollerClass}>
        {lamps.map((lamp) => (
          <ProductCard key={lamp.id} lamp={lamp} popular={popular} />
        ))}
      </div>
      {popular ? (
        <>
          <a className="link-more link-more--center" href="#catalog">
            Show more
          </a>
          <a className="btn band__btn band__btn--center" href="/catalog">
            View catalogue
          </a>
        </>
      ) : null}
    </section>
  )
}
