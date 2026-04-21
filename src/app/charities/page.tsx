'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { cache } from '@/lib/cache'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/Skeleton'
import { Search, Heart } from 'lucide-react'

interface Charity {
  id: string
  name: string
  description: string
  imageUrl: string
  isFeatured: boolean
  events: { id: string; title: string; eventDate: string }[]
}

function CharityCardSkeleton() {
  return (
    <div className="card p-6">
      <Skeleton className="h-32 rounded-xl mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const key = `charities:search:${search}`
    const cached = cache.getStale<Charity[]>(key)
    if (cached) { 
      setCharities(cached)
      setLoading(false)
    }
    
    // Debounce API calls but always fetch
    const t = setTimeout(() => {
      setLoading(true)
      api.charities.list({ search: search || undefined })
        .then(d => { 
          cache.set(key, d)
          setCharities(d) 
        })
        .catch(err => console.error('Failed to fetch charities:', err))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const featured = charities.filter(c => c.isFeatured)
  const rest = charities.filter(c => !c.isFeatured)

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12">
            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-pink-400" />
            </div>
            <h1 className="text-4xl font-black mb-3">Our Charities</h1>
            <p className="text-gray-400 max-w-xl mx-auto">Every subscription supports a cause. Choose yours.</p>
          </div>

          <div className="relative max-w-md mx-auto mb-12">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              className="input pl-11"
              placeholder="Search charities…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <CharityCardSkeleton key={i} />)}
            </div>
          ) : (
            <>
              {featured.length > 0 && !search && (
                <div className="mb-12">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6">Spotlight</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {featured.map(c => (
                      <Link key={c.id} href={`/charities/${c.id}`} className="card overflow-hidden hover:border-white/20 transition-colors group">
                        {c.imageUrl && (
                          <div className="h-48 overflow-hidden">
                            <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-pink-500/10 text-pink-400 px-2 py-1 rounded-full">Featured</span>
                          </div>
                          <h3 className="text-xl font-bold mb-2">{c.name}</h3>
                          <p className="text-gray-400 text-sm line-clamp-2">{c.description}</p>
                          {c.events?.length > 0 && (
                            <p className="text-xs text-green-400 mt-3">{c.events.length} upcoming event{c.events.length > 1 ? 's' : ''}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-5">
                {rest.map(c => (
                  <Link key={c.id} href={`/charities/${c.id}`} className="card p-6 hover:border-white/20 transition-colors group">
                    {c.imageUrl && (
                      <div className="h-32 rounded-xl overflow-hidden mb-4">
                        <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <h3 className="font-bold mb-2">{c.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{c.description}</p>
                  </Link>
                ))}
              </div>

              {charities.length === 0 && (
                <p className="text-center text-gray-500 py-20">No charities found.</p>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
