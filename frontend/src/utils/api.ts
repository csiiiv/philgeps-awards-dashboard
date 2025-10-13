// Centralized API URL helper
let runtimeApiRoot: string | null = null

export const setApiRoot = (root: string | null) => {
  runtimeApiRoot = root ? String(root).replace(/\/$/, '') : null
}

export const getApiRoot = (): string => {
  // Priority: explicit runtime override -> window.__API_URL -> Vite build-time env -> ''
  if (runtimeApiRoot !== null) return runtimeApiRoot

  const fromWindow = (typeof window !== 'undefined' && (window as any).__API_URL) || ''
  const fromVite = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) || ''
  return String(fromWindow || fromVite || '').replace(/\/$/, '')
}

// Normalize path by removing duplicate /api/v1 prefixes and ensuring leading slash
const normalizePath = (path: string): string => {
  if (!path) return path
  // If absolute URL, return as-is
  if (/^https?:\/\//i.test(path)) return path

  // Remove any leading/trailing whitespace
  let p = String(path).trim()

  // Remove any repeated /api/v1 occurrences so callers may pass paths with or without it
  p = p.replace(/^(?:\/?api(?:\/v\d+)?)+/i, '');

  // Ensure leading slash
  if (!p.startsWith('/')) p = `/${p}`
  return p
}

export const resolveUrl = (path: string): string => {
  if (!path) return path
  // If absolute URL, return unchanged
  if (/^https?:\/\//i.test(path)) return path

  const root = getApiRoot()

  // Normalize incoming path (remove duplicated api/version prefixes)
  const normalized = normalizePath(path)

  // If root is empty, return normalized path
  if (!root) return normalized

  // Join root and normalized path without double slashes
  return `${root}${normalized}`
}

export default { getApiRoot, setApiRoot, resolveUrl }
