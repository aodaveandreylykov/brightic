"use client"

import type { ButtonHTMLAttributes, ReactNode } from "react"
import { useCart } from "@/modules/cart/cart-provider"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export default function CartTrigger({ children, className, onClick, ...rest }: Props) {
  const { toggleCart, open, count } = useCart()

  return (
    <button
      type="button"
      className={className}
      data-panel="cart"
      aria-controls="panel-cart"
      aria-expanded={open}
      aria-label={count ? `Basket, ${count} ${count === 1 ? "item" : "items"}` : "Basket"}
      {...rest}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick?.(event)
        toggleCart()
      }}
    >
      {children}
      <span className="cart-badge" aria-hidden="true" hidden={count < 1}>
        {count > 0 ? String(count) : ""}
      </span>
    </button>
  )
}
