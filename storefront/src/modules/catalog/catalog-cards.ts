export type Shot = {
  x: number
  y: number
  w: number
  h: number
  sx: number
  sy: number
  tx: number
  ty: number
}

export type CatalogCard = {
  bp: "d" | "t" | "m"
  kind: "sq" | "mid" | "wide" | "t-sm" | "t-lg" | "m"
  left: number
  top: number
  width: number
  height: number
  name: string
  blurb: string
  price: string
  image: string
  shot: Shot
  blurbTop?: number
  priceTop?: number
}

const sq = (sx: number, sy: number, tx: number, ty: number): Shot => ({
  x: 69,
  y: 67,
  w: 306,
  h: 312,
  sx,
  sy,
  tx,
  ty,
})

const mid = (sx: number, sy: number, tx: number, ty: number): Shot => ({
  x: 111,
  y: 105,
  w: 378,
  h: 490,
  sx,
  sy,
  tx,
  ty,
})

const wide = (sx: number, sy: number, tx: number, ty: number): Shot => ({
  x: 281,
  y: 105,
  w: 348,
  h: 490,
  sx,
  sy,
  tx,
  ty,
})

export const catalogCards: CatalogCard[] = [
  { bp: "d", kind: "sq", left: 40, top: 0, width: 445, height: 445, name: "Momentum Beam", blurb: "dynamic\ndirectional flow", price: "$ 1100", image: "momentum.png", shot: sq(1.022, 1.041, -0.026, -0.1) },
  { bp: "d", kind: "sq", left: 505, top: 0, width: 445, height: 445, name: "Flux Line", blurb: "fluid modern light form", price: "$ 800", image: "flux.png", shot: sq(1.117, 1.084, -0.059, -0.041) },
  { bp: "d", kind: "sq", left: 970, top: 0, width: 445, height: 445, name: "Stria Nova", blurb: "clean\nlinear design", price: "$ 900", image: "stria.png", shot: sq(1.4, 1, -0.2, 0) },
  { bp: "d", kind: "sq", left: 1435, top: 0, width: 445, height: 445, name: "Lumenweave", blurb: "textured \nlayered glow", price: "$ 650", image: "lumenweave.png", shot: sq(1.628, 1, -0.314, 0) },
  { bp: "d", kind: "mid", left: 40, top: 465, width: 600, height: 700, name: "Metal Beam", blurb: "sleek silhouette", price: "$ 1100", image: "metal.png", shot: mid(0.682, 0.885, 0.183, 0.046) },
  { bp: "d", kind: "mid", left: 660, top: 465, width: 600, height: 700, name: "Amethyst Vortex", blurb: "shimmering violet hues", price: "$ 1500", image: "amethyst.png", shot: mid(1.056, 1, -0.028, 0) },
  { bp: "d", kind: "mid", left: 1280, top: 465, width: 600, height: 700, name: "Steel Petal", blurb: "delicate curved elements", price: "$ 900", image: "steel.png", shot: mid(1.313, 1, -0.156, 0) },
  { bp: "d", kind: "sq", left: 40, top: 1185, width: 445, height: 445, name: "Glowform", blurb: "sleek soft illumination", price: "$ 700", image: "glowform.png", shot: sq(1, 0.964, 0, 0.018) },
  { bp: "d", kind: "sq", left: 505, top: 1185, width: 445, height: 445, name: "Echo Glow", blurb: "subtle\nreflective warmth", price: "$ 1200", image: "echo.png", shot: sq(1.907, 1, -0.454, 0) },
  { bp: "d", kind: "sq", left: 970, top: 1185, width: 445, height: 445, name: "Momentum Beam", blurb: "calm even\nhorizon light", price: "$ 950", image: "horizon.png", shot: sq(1.513, 1, -0.257, 0) },
  { bp: "d", kind: "sq", left: 1435, top: 1185, width: 445, height: 445, name: "Crystal Veil", blurb: "elegant\nfaceted softness", price: "$ 800", image: "crystal.png", shot: sq(1.394, 1, -0.197, 0) },
  { bp: "d", kind: "wide", left: 40, top: 1650, width: 910, height: 700, name: "Lunar Dome", blurb: "soft diffused light", price: "$ 750", image: "lunar.png", shot: wide(0.642, 0.903, 0.173, 0.049) },
  { bp: "d", kind: "wide", left: 970, top: 1650, width: 910, height: 700, name: "Striking red shade", blurb: "Crimson Accent", price: "$ 1300", image: "red.png", shot: wide(0.93, 1, 0.035, 0) },

  { bp: "t", kind: "t-sm", left: 20, top: 0, width: 193, height: 180, name: "Flux Line", blurb: "fluid modern\nlight form", price: "$ 800", image: "flux.png", shot: { x: 40, y: 29, w: 106, h: 112, sx: 0.883, sy: 0.928, tx: 0.06, ty: 0.034 }, blurbTop: 148, priceTop: 155 },
  { bp: "t", kind: "t-sm", left: 223, top: 0, width: 194, height: 180, name: "Lumenweave", blurb: "textured\nlayered glow", price: "$ 650", image: "lumenweave.png", shot: { x: 65, y: 33, w: 55, h: 114, sx: 0.334, sy: 0.697, tx: 0.334, ty: 0.152 }, blurbTop: 144, priceTop: 155 },
  { bp: "t", kind: "t-sm", left: 427, top: 0, width: 193, height: 180, name: "Glowform", blurb: "sleek soft\nillumination", price: "$ 700", image: "glowform.png", shot: { x: 44, y: 37, w: 100, h: 106, sx: 0.809, sy: 0.856, tx: 0.094, ty: 0.063 }, blurbTop: 144, priceTop: 155 },
  { bp: "t", kind: "t-lg", left: 20, top: 190, width: 295, height: 320, name: "Amethyst Vortex", blurb: "shimmering violet hues", price: "$ 1500", image: "amethyst.png", shot: { x: 57, y: 39, w: 176, h: 241, sx: 0.703, sy: 0.962, tx: 0.149, ty: 0 }, blurbTop: 293, priceTop: 295 },
  { bp: "t", kind: "t-lg", left: 325, top: 190, width: 295, height: 320, name: "Steel Petal", blurb: "delicate\ncurved elements", price: "$ 900", image: "steel.png", shot: { x: 88, y: 39, w: 142, h: 241, sx: 0.499, sy: 0.85, tx: 0.243, ty: 0.074 }, blurbTop: 276, priceTop: 295 },
  { bp: "t", kind: "t-sm", left: 20, top: 520, width: 193, height: 180, name: "Echo Glow", blurb: "reflective\nwarmth", price: "$ 1200", image: "echo.png", shot: { x: 67, y: 32, w: 59, h: 110, sx: 0.422, sy: 0.823, tx: 0.255, ty: 0.09 }, blurbTop: 148, priceTop: 155 },
  { bp: "t", kind: "t-sm", left: 223, top: 520, width: 194, height: 180, name: "Momentum Beam", blurb: "dynamic\ndirectional flow", price: "$ 1100", image: "momentum.png", shot: { x: 55, y: 36, w: 84, h: 107, sx: 0.688, sy: 0.88, tx: 0.157, ty: 0 }, blurbTop: 144, priceTop: 155 },
  { bp: "t", kind: "t-sm", left: 427, top: 520, width: 193, height: 180, name: "Horizon Glow", blurb: "calm even\nhorizon light", price: "$ 950", image: "horizon.png", shot: { x: 60, y: 39, w: 68, h: 105, sx: 0.527, sy: 0.813, tx: 0.238, ty: 0.099 }, blurbTop: 144, priceTop: 155 },
  { bp: "t", kind: "t-lg", left: 20, top: 710, width: 295, height: 320, name: "Lunar Dome", blurb: "soft diffused light", price: "$ 750", image: "lunar.png", shot: { x: 59, y: 39, w: 171, h: 241, sx: 0.642, sy: 0.903, tx: 0.173, ty: 0.049 }, blurbTop: 293, priceTop: 295 },
  { bp: "t", kind: "t-lg", left: 325, top: 710, width: 295, height: 320, name: "striking red shade", blurb: "Crimson Accent", price: "$ 1300", image: "red.png", shot: { x: 53, y: 39, w: 184, h: 241, sx: 0.657, sy: 0.86, tx: 0.17, ty: 0.083 }, blurbTop: 293, priceTop: 295 },

  { bp: "m", kind: "m", left: 20, top: 0, width: 280, height: 300, name: "Flux Line", blurb: "fluid modern\nlight form", price: "$ 800", image: "flux.png", shot: { x: 35, y: 39, w: 209, h: 221, sx: 0.883, sy: 0.928, tx: 0.06, ty: 0.034 }, blurbTop: 264, priceTop: 275 },
  { bp: "m", kind: "m", left: 20, top: 320, width: 280, height: 300, name: "Glowform", blurb: "sleek soft\nillumination", price: "$ 700", image: "glowform.png", shot: { x: 37, y: 41, w: 205, h: 218, sx: 0.809, sy: 0.856, tx: 0.094, ty: 0.063 }, blurbTop: 264, priceTop: 275 },
  { bp: "m", kind: "m", left: 20, top: 640, width: 280, height: 300, name: "Amethyst Vortex", blurb: "shimmering violet hues", price: "$ 1500", image: "amethyst.png", shot: { x: 62, y: 40, w: 155, h: 220, sx: 0.703, sy: 0.962, tx: 0.149, ty: 0 }, blurbTop: 273, priceTop: 275 },
  { bp: "m", kind: "m", left: 20, top: 960, width: 280, height: 300, name: "Metal Beam", blurb: "sleek\nsilhouette", price: "$ 1100", image: "metal.png", shot: { x: 55, y: 39, w: 170, h: 221, sx: 0.682, sy: 0.885, tx: 0.183, ty: 0.046 }, blurbTop: 264, priceTop: 275 },
  { bp: "m", kind: "m", left: 20, top: 1272.2, width: 280, height: 298.3, name: "Echo Glow", blurb: "reflective\nwarmth", price: "$ 1200", image: "echo.png", shot: { x: 83, y: 43, w: 113, h: 211, sx: 0.422, sy: 0.823, tx: 0.255, ty: 0.09 }, blurbTop: 264, priceTop: 275 },
  { bp: "m", kind: "m", left: 20, top: 1600, width: 280, height: 300, name: "Steel Petal", blurb: "delicate\ncurved elements", price: "$ 900", image: "steel.png", shot: { x: 80, y: 39, w: 120, h: 205, sx: 0.499, sy: 0.85, tx: 0.243, ty: 0.074 }, blurbTop: 256, priceTop: 275 },
  { bp: "m", kind: "m", left: 20, top: 1920, width: 280, height: 300, name: "Stria Nova", blurb: "clean\nlinear design", price: "$ 900", image: "stria.png", shot: { x: 59, y: 34, w: 162, h: 231, sx: 0.64, sy: 0.914, tx: 0.175, ty: 0.048 }, blurbTop: 264, priceTop: 275 },
  { bp: "m", kind: "m", left: 20, top: 2240, width: 280, height: 300, name: "Crystal Veil", blurb: "elegant\nsoftness", price: "$ 800", image: "crystal.png", shot: { x: 59, y: 34, w: 162, h: 231, sx: 0.66, sy: 0.939, tx: 0.173, ty: 0.026 }, blurbTop: 264, priceTop: 275 },
  { bp: "m", kind: "m", left: 20, top: 2560, width: 280, height: 320, name: "Striking red shade", blurb: "Crimson Accent", price: "$ 1300", image: "red.png", shot: { x: 48, y: 39, w: 184, h: 241, sx: 0.657, sy: 0.86, tx: 0.17, ty: 0.083 }, blurbTop: 293, priceTop: 295 },
]
