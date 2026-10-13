"use client"

import { useEffect } from "react"
import { withBase } from "@/lib/base-path"

export default function Page() {
  useEffect(() => {
    window.location.replace(withBase("/product/flux-line/"))
  }, [])

  return null
}
