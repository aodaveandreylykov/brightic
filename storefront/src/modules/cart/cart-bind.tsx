"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

type CartApi = { mount?: () => void }

export function CartBind() {
  const pathname = usePathname()

  useEffect(() => {
    let frames = 0
    let raf = 0
    const tick = () => {
      const api = (window as Window & { BrighticCart?: CartApi }).BrighticCart
      if (api && typeof api.mount === "function") {
        api.mount()
        return
      }
      frames += 1
      if (frames < 120) raf = window.requestAnimationFrame(tick)
    }
    tick()
    return () => window.cancelAnimationFrame(raf)
  }, [pathname])

  return null
}
