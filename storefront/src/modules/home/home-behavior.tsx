"use client"

import { useEffect } from "react"

export function HomeBehavior() {
  useEffect(() => {
    const body = document.body
    const burger = document.querySelector<HTMLButtonElement>(".burger")
    const menu = document.getElementById("menu")
    const cleanups: Array<() => void> = []

    function closeMenu() {
      if (!menu || !burger) return
      menu.hidden = true
      burger.setAttribute("aria-expanded", "false")
      body.classList.remove("menu-open")
    }

    if (burger && menu) {
      const onBurger = () => {
        const open = menu.hidden
        menu.hidden = !open
        burger.setAttribute("aria-expanded", String(open))
        body.classList.toggle("menu-open", open)
        document.querySelectorAll<HTMLElement>(".panel").forEach((panel) => {
          panel.hidden = true
        })
      }
      burger.addEventListener("click", onBurger)
      cleanups.push(() => burger.removeEventListener("click", onBurger))

      menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu)
        cleanups.push(() => link.removeEventListener("click", closeMenu))
      })
    }

    document.querySelectorAll<HTMLButtonElement>("[data-panel]").forEach((button) => {
      const onPanel = () => {
        const id = button.getAttribute("aria-controls")
        const panel = id ? document.getElementById(id) : null
        if (!panel) return
        const willOpen = panel.hidden
        document.querySelectorAll<HTMLElement>(".panel").forEach((other) => {
          other.hidden = true
        })
        document.querySelectorAll<HTMLButtonElement>("[data-panel]").forEach((other) => {
          other.setAttribute("aria-expanded", "false")
        })
        panel.hidden = !willOpen
        button.setAttribute("aria-expanded", String(willOpen))
        closeMenu()
      }
      button.addEventListener("click", onPanel)
      cleanups.push(() => button.removeEventListener("click", onPanel))
    })

    document.querySelectorAll<HTMLButtonElement>(".lang__btn").forEach((button) => {
      const onLang = () => {
        document.querySelectorAll<HTMLButtonElement>(".lang__btn").forEach((other) => {
          const on = other === button
          other.classList.toggle("is-active", on)
          other.setAttribute("aria-pressed", String(on))
        })
        document.documentElement.lang = button.getAttribute("data-lang") || "en"
      }
      button.addEventListener("click", onLang)
      cleanups.push(() => button.removeEventListener("click", onLang))
    })

    const track = document.querySelector<HTMLElement>(".reviews__track")
    const bar = document.querySelector<HTMLElement>(".reviews__bar i")
    const cards = track ? Array.from(track.children) as HTMLElement[] : []
    let index = 0

    function showReview(next: number) {
      if (!track || !cards.length) return
      index = Math.max(0, Math.min(cards.length - 1, next))
      const card = cards[index]
      const shift = card.offsetLeft - cards[0].offsetLeft
      track.style.transform = `translateX(${-shift}px)`
      if (bar) {
        const portion = (index + 1) / cards.length
        bar.style.width = `${Math.max(36.41, portion * 100)}%`
      }
      cards.forEach((cardEl, i) => {
        cardEl.setAttribute("aria-hidden", String(i !== index && window.innerWidth < 1920))
      })
    }

    document.querySelectorAll<HTMLButtonElement>(".arrow").forEach((button) => {
      const onArrow = () => showReview(index + Number(button.getAttribute("data-dir")))
      button.addEventListener("click", onArrow)
      cleanups.push(() => button.removeEventListener("click", onArrow))
    })

    const onResize = () => showReview(index)
    window.addEventListener("resize", onResize)
    cleanups.push(() => window.removeEventListener("resize", onResize))
    showReview(0)

    const form = document.querySelector<HTMLFormElement>(".form")
    const note = document.querySelector<HTMLElement>(".form__note")
    if (form && note) {
      const onSubmit = (event: Event) => {
        event.preventDefault()
        if (!form.checkValidity()) {
          form.reportValidity()
          return
        }
        note.hidden = false
        form.reset()
      }
      form.addEventListener("submit", onSubmit)
      cleanups.push(() => form.removeEventListener("submit", onSubmit))
    }

    document.querySelectorAll<HTMLFormElement>(".panel__form").forEach((searchForm) => {
      const onSearch = (event: Event) => {
        event.preventDefault()
        const input = searchForm.querySelector("input")
        if (input && input.value.trim()) {
          window.location.hash = "catalog"
          const panel = searchForm.closest<HTMLElement>(".panel")
          if (panel) panel.hidden = true
        }
      }
      searchForm.addEventListener("submit", onSearch)
      cleanups.push(() => searchForm.removeEventListener("submit", onSearch))
    })

    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [])

  return null
}
