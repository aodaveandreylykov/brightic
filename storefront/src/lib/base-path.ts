export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ""

export function withBase(path: string) {
  if (!path) return BASE_PATH || "/"
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("mailto:") ||
    path.startsWith("#")
  ) {
    return path
  }
  if (!path.startsWith("/")) return path
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) return path
  return `${BASE_PATH}${path}`
}
