const BASE = process.env.NEXT_PUBLIC_API_URL

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('dh_token')
}

async function req(path: string, options: RequestInit = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// Auth
export const api = {
  auth: {
    signup: (body: { email: string; password: string; full_name: string }) =>
      req('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      req('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => req('/api/auth/logout', { method: 'POST' }),
    refresh: (refresh_token: string) =>
      req('/api/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token }) })
  },
  profile: {
    get: () => req('/api/profile'),
    update: (body: object) => req('/api/profile', { method: 'PATCH', body: JSON.stringify(body) })
  },
  scores: {
    list: () => req('/api/scores'),
    add: (body: { score: number }) =>
      req('/api/scores', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: object) =>
      req(`/api/scores/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: string) => req(`/api/scores/${id}`, { method: 'DELETE' })
  },
  subscriptions: {
    me: () => req('/api/subscriptions/me'),
    checkout: (body: { plan: string; charity_id?: string; charity_percentage?: number }) =>
      req('/api/subscriptions/checkout', { method: 'POST', body: JSON.stringify(body) }),
    verify: (body: object) =>
      req('/api/subscriptions/verify', { method: 'POST', body: JSON.stringify(body) }),
    cancel: () => req('/api/subscriptions/cancel', { method: 'POST' }),
    updateCharity: (body: { charity_id: string; charity_percentage: number }) =>
      req('/api/subscriptions/charity', { method: 'PATCH', body: JSON.stringify(body) })
  },
  charities: {
    list: (params?: { search?: string; featured?: boolean }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString()
      return req(`/api/charities${qs ? `?${qs}` : ''}`)
    },
    get: (id: string) => req(`/api/charities/${id}`)
  },
  draws: {
    list: () => req('/api/draws'),
    myEntries: () => req('/api/draws/entries/me')
  },
  winners: {
    me: () => req('/api/winners/me'),
    uploadProof: (id: string, proof_url: string) =>
      req(`/api/winners/${id}/proof`, { method: 'PATCH', body: JSON.stringify({ proof_url }) })
  },
  donations: {
    create: (body: { charity_id: string; amount_paise: number }) =>
      req('/api/donations', { method: 'POST', body: JSON.stringify(body) }),
    verify: (body: object) =>
      req('/api/donations/verify', { method: 'POST', body: JSON.stringify(body) }),
    me: () => req('/api/donations/me')
  }
}
