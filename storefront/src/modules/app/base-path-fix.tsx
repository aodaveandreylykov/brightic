"use client"

import { useEffect } from "react"
import { BASE_PATH } from "@/lib/base-path"

function prefix(url: string | null) {
  if (!url || !BASE_PATH) return url
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("mailto:") ||
    url.startsWith("#") ||
    url.startsWith("//")
  ) {
    return url
  }
  if (!url.startsWith("/")) return url
  if (url === BASE_PATH || url.startsWith(`${BASE_PATH}/`)) return url
  return `${BASE_PATH}${url}`
}

function rewrite(root: ParentNode) {
  root.querySelectorAll("a[href^='/']").forEach((node) => {
    const el = node as HTMLAnchorElement
    const next = prefix(el.getAttribute("href"))
    if (next) el.setAttribute("href", next)
  })
  root.querySelectorAll("img[src^='/']").forEach((node) => {
    const el = node as HTMLImageElement
    const next = prefix(el.getAttribute("src"))
    if (next) el.setAttribute("src", next)
  })
}

export function BasePathFix() {
  useEffect(() => {
    if (!BASE_PATH) return
    rewrite(document)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) rewrite(node)
        })
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    function onClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest("a")
      if (!link) return
      const href = link.getAttribute("href")
      const next = prefix(href)
      if (next && href && next !== href) {
        event.preventDefault()
        window.location.assign(next)
      }
    }
    document.addEventListener("click", onClick, true)
    return () => {
      observer.disconnect()
      document.removeEventListener("click", onClick, true)
    }
  }, [])

  return null
}
