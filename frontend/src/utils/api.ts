// Centralized API URL helper
export const API_ROOT: string = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_URL)
  || (typeof window !== 'undefined' && (window as any).__API_URL)
  || ''

export const resolveUrl = (path: string): string => {
  if (!path) return path
  if (/^https?:\/\//i.test(path)) return path

  const root = API_ROOT.replace(/\/$/, '')
  if (path.startsWith('/')) {
    return root ? `${root}${path}` : path
  }
  return root ? `${root}/${path}` : `/${path}`
}

export default { API_ROOT, resolveUrl }
