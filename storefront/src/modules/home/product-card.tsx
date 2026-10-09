import type { Lamp } from "@/lib/catalog"

export function ProductCard({
  lamp,
  popular = false,
}: {
  lamp: Lamp
  popular?: boolean
}) {
  const classes = [
    "card",
    popular ? "card--pop" : "",
    lamp.hideOnMobile ? "card--desk-tab" : "",
  ]
    .filter(Boolean)
    .join(" ")
  const [desktopImage, tabletImage] = lamp.images

  return (
    <article className={classes}>
      <a href="#catalog">
        <div className="card__media">
          {tabletImage ? (
            <>
              <img className="img-d" src={desktopImage} alt="" />
              <img className="img-s" src={tabletImage} alt="" />
            </>
          ) : (
            <img src={desktopImage} alt="" />
          )}
        </div>
        <h3>{lamp.title}</h3>
        <p className="price">
          <span className="p-m">{lamp.prices.mobile}</span>
          <span className="p-t">{lamp.prices.tablet}</span>
          <span className="p-d">{lamp.prices.desktop}</span>
        </p>
      </a>
    </article>
  )
}
