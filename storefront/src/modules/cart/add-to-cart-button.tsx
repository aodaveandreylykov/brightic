"use client"

import type { ButtonHTMLAttributes, ReactNode } from "react"
import { useCart } from "@/modules/cart/cart-provider"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode
  title?: string
  blurb?: string
  price?: number
  image?: string
  id?: string
}

function slug(title: string) {
  return String(title || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function readFromPage(qtyFallback = 1) {
  const frame = document.querySelector<HTMLElement>(".pdp-frame:not([hidden])") || document.querySelector(".pdp")
  const titleEl = frame?.querySelector<HTMLElement>(".title") || document.querySelector<HTMLElement>("h1.title")
  const priceEl = frame?.querySelector<HTMLElement>(".price")
  const imgEl = frame?.querySelector<HTMLImageElement>(".stage__img")
  const qtyEl = frame?.querySelector(".qty__n")
  const title = titleEl?.textContent?.replace(/\s+/g, " ").trim() || "Flux Line"
  const priceText = priceEl?.textContent?.replace(/[^0-9.]/g, "") || "750"
  const qtyParsed = qtyEl ? parseInt(String(qtyEl.textContent || "1").trim(), 10) : qtyFallback
  return {
    id: slug(title),
    title,
    blurb: "Fluid modern light form",
    price: Number(priceText) || 750,
    qty: Number.isFinite(qtyParsed) && qtyParsed > 0 ? qtyParsed : 1,
    image: imgEl?.getAttribute("src") || "/assets/cart/item-flux.png",
  }
}

export default function AddToCartButton({
  children = "add to cart",
  className = "buy",
  title,
  blurb,
  price,
  image,
  id,
  onClick,
  ...rest
}: Props) {
  const { addItem, openCart } = useCart()

  return (
    <button
      type="button"
      className={className}
      {...rest}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick?.(event)
        const fromPage = readFromPage(1)
        addItem({
          id: id || fromPage.id,
          title: title || fromPage.title,
          blurb: blurb || fromPage.blurb,
          price: price ?? fromPage.price,
          image: image || fromPage.image,
          qty: fromPage.qty,
        })
        openCart()
      }}
    >
      {children}
    </button>
  )
}
