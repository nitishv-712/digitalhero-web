'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { cache } from '@/lib/cache'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Skeleton } from '@/components/ui/Skeleton'
import { Trophy } from 'lucide-react'

interface Draw {
  id: string
  title: string
  drawMonth: string
  drawnNumbers: number[]
  totalPool: number
  pool3: number
  pool4: number
  pool5: number
  publishedAt: string
}

function DrawSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex justify-between mb-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex gap-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-12 h-12 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    </div>
  )
}

export default function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Show cached data if available
    const cached = cache.getStale<Draw[]>('draws:list')
    if (cached) { 
      setDraws(cached)
      setLoading(false)
    }
    
    // Always fetch fresh data (don't return early)
    api.draws.list().then(d => {
      cache.set('draws:list', d)
      setDraws(d)
    }).catch(err => console.error('Failed to fetch draws:', err)).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
              <Trophy size={28} className="text-yellow-400" />
            </div>
            <h1 className="text-4xl font-black mb-3">Monthly Draws</h1>
            <p className="text-gray-400">Match your scores to win. Jackpot rolls over if unclaimed.</p>
          </div>

          {loading ? (
            <div className="flex flex-col gap-6">
              <DrawSkeleton />
              <DrawSkeleton />
            </div>
          ) : draws.length === 0 ? (
            <p className="text-center text-gray-500 py-20">No draws published yet. Check back soon.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {draws.map(d => (
                <div key={d.id} className="card p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold">{d.title}</h2>
                      <p className="text-sm text-gray-400">
                        {new Date(d.drawMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        {' · '}Published {new Date(d.publishedAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-green-400">₹{(d.totalPool / 100).toFixed(0)}</div>
                      <div className="text-xs text-gray-500">Total pool</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Drawn numbers</p>
                    <div className="flex gap-3 flex-wrap">
                      {d.drawnNumbers.map(n => (
                        <div key={n} className="w-12 h-12 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center text-green-400 font-black text-lg">
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: '3-Match', amount: d.pool3, color: 'text-purple-400' },
                      { label: '4-Match', amount: d.pool4, color: 'text-blue-400' },
                      { label: '5-Match', amount: d.pool5, color: 'text-yellow-400' }
                    ].map(({ label, amount, color }) => (
                      <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                        <div className={`text-lg font-black ${color}`}>₹{(amount / 100).toFixed(0)}</div>
                        <div className="text-xs text-gray-500">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
