type CacheEntry<T> = { data: T; ts: number }

const store = new Map<string, CacheEntry<unknown>>()

function ssRead<T>(key: string): T | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    return entry.data
  } catch { return null }
}

function ssWrite<T>(key: string, data: T) {
  if (typeof sessionStorage === 'undefined') return
  try { sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

export const cache = {
  get<T>(key: string, ttlMs = 30_000): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    if (Date.now() - entry.ts > ttlMs) return null
    return entry.data
  },

  getStale<T>(key: string): T | null {
    const mem = store.get(key) as CacheEntry<T> | undefined
    if (mem) return mem.data
    return ssRead<T>(key)
  },

  set<T>(key: string, data: T) {
    store.set(key, { data, ts: Date.now() })
    ssWrite(key, data)
  },

  isStale(key: string, ttlMs = 30_000): boolean {
    const entry = store.get(key)
    if (!entry) return true
    return Date.now() - entry.ts > ttlMs
  },

  invalidate(key: string) {
    store.delete(key)
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(key)
  }
}
