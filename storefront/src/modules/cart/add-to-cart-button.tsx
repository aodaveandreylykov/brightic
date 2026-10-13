"use client"

import type { ButtonHTMLAttributes, ReactNode } from "react"
import { useState } from "react"
import { useCart } from "@/modules/cart/cart-provider"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode
  title?: string
  handle?: string
  variantId?: string
  productId?: string
  price?: number
  image?: string
  blurb?: string
}

function readFromPage(qtyFallback = 1) {
  const frame =
    document.querySelector<HTMLElement>(".pdp-frame:not([hidden])") || document.querySelector(".pdp")
  const titleEl = frame?.querySelector<HTMLElement>(".title") || document.querySelector<HTMLElement>("h1.title")
  const qtyEl = frame?.querySelector(".qty__n")
  const title = titleEl?.textContent?.replace(/\s+/g, " ").trim() || "Flux Line"
  const qtyParsed = qtyEl ? parseInt(String(qtyEl.textContent || "1").trim(), 10) : qtyFallback
  return {
    title,
    qty: Number.isFinite(qtyParsed) && qtyParsed > 0 ? qtyParsed : 1,
  }
}

export default function AddToCartButton({
  children = "add to cart",
  className = "buy",
  title,
  handle,
  variantId,
  productId,
  price,
  image,
  blurb,
  onClick,
  ...rest
}: Props) {
  const { addItem, openCart, pending } = useCart()
  const [busy, setBusy] = useState(false)

  return (
    <button
      type="button"
      className={className}
      disabled={pending || busy}
      {...rest}
      onClick={async (event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick?.(event)
        const fromPage = readFromPage(1)
        setBusy(true)
        try {
          await addItem({
            variantId,
            productId,
            handle,
            title: title || fromPage.title,
            qty: fromPage.qty,
            price,
            image,
            blurb,
          })
          openCart()
        } catch {
          openCart()
        } finally {
          setBusy(false)
        }
      }}
    >
      {children}
    </button>
  )
}
