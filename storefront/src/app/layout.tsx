import type { Metadata } from "next"
import "@/modules/home/shop.css"

export const metadata: Metadata = {
  title: "Brightic — Design born of light",
  description:
    "Designer table lamps by Brightic. Collections, best-sellers, and light that turns a room into a gallery.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
