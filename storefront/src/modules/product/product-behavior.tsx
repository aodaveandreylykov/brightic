"use client"

import { useEffect } from "react"

export function ProductBehavior() {
  useEffect(() => {
    const root = document.querySelector(".pdp")
    if (!root) return
    const page = root

    function onClick(event: Event) {
      const target = event.target
      if (!(target instanceof Element)) return

      const thumb = target.closest(".thumb")
      if (thumb && page.contains(thumb)) {
        const frame = thumb.closest(".pdp-frame")
        const img = frame?.querySelector<HTMLImageElement>(".stage__img")
        if (img) {
          img.src = thumb.getAttribute("data-src") || ""
          img.className = "stage__img " + (thumb.getAttribute("data-crop") || "")
        }
        frame?.querySelectorAll(".thumb").forEach((el) => {
          el.classList.toggle("is-on", el === thumb)
        })
        return
      }

      const step = target.closest(".qty__dec, .qty__inc")
      if (step) {
        const qty = step.closest(".qty")
        const n = qty?.querySelector(".qty__n")
        if (!n) return
        const current = parseInt(n.textContent || "1", 10) || 1
        let next = step.classList.contains("qty__inc") ? current + 1 : current - 1
        if (next < 1) next = 1
        n.textContent = (n.textContent || "").indexOf(" ") === -1 ? String(next) : String(next) + " "
        return
      }

      const acc = target.closest(".acc")
      if (acc) {
        acc.classList.toggle("is-open")
        return
      }

      const fav = target.closest(".fav")
      if (fav) {
        const pressed = fav.getAttribute("aria-pressed") === "true"
        fav.setAttribute("aria-pressed", String(!pressed))
        return
      }

      const burger = target.closest(".pdp-burger")
      if (burger) {
        const menu = burger.closest(".pdp-frame")?.querySelector<HTMLElement>(".pdp-menu")
        if (!menu) return
        const willOpen = menu.hasAttribute("hidden")
        menu.hidden = !willOpen
        burger.setAttribute("aria-expanded", String(willOpen))
      }
    }

    page.addEventListener("click", onClick)
    return () => page.removeEventListener("click", onClick)
  }, [])

  return null
}
