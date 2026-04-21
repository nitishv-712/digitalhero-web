'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { cache } from '@/lib/cache'
import Navbar from '@/components/layout/Navbar'
import ScoreManager from '@/components/dashboard/ScoreManager'
import { CardSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { Trophy, Heart, Calendar, CreditCard, Upload, User, AlertCircle } from 'lucide-react'

interface Subscription {
  plan: string
  status: string
  currentPeriodEnd: string
  charityPercentage: number
  charity?: { name: string; id: string }
}
interface Winner {
  id: string
  matchType: string
  prizeAmount: number
  status: string
  proofUrl: string | null
  draw?: { title: string; drawMonth: string }
}
interface DrawEntry {
  id: string
  scores: number[]
  matchedCount: number | null
  matchType: string | null
  draw?: { title: string; drawMonth: string; status: string; drawnNumbers: number[] }
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [winners, setWinners] = useState<Winner[]>([])
  const [entries, setEntries] = useState<DrawEntry[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [proofUrl, setProofUrl] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    // Show cached data if available
    const cachedSub = cache.getStale<Subscription>('dashboard:sub')
    const cachedWinners = cache.getStale<Winner[]>('dashboard:winners')
    const cachedEntries = cache.getStale<DrawEntry[]>('dashboard:entries')
    if (cachedSub) setSub(cachedSub)
    if (cachedWinners) setWinners(cachedWinners)
    if (cachedEntries) setEntries(cachedEntries)
    if (cachedSub || cachedWinners || cachedEntries) setDataLoading(false)

    // Always fetch fresh data
    Promise.all([
      api.subscriptions.me().then(d => { cache.set('dashboard:sub', d); setSub(d) }).catch(() => {}),
      api.winners.me().then(d => { cache.set('dashboard:winners', d); setWinners(d) }).catch(() => {}),
      api.draws.myEntries().then(d => { cache.set('dashboard:entries', d); setEntries(d) }).catch(() => {}),
    ]).finally(() => setDataLoading(false))
  }, [user])

  async function submitProof(winnerId: string) {
    const url = proofUrl[winnerId]
    if (!url) return
    setUploading(winnerId)
    try {
      await api.winners.uploadProof(winnerId, url)
      const updated = await api.winners.me()
      cache.set('dashboard:winners', updated)
      setWinners(updated)
    } finally { setUploading(null) }
  }

  async function cancelSubscription() {
    setCancelling(true)
    try {
      await api.subscriptions.cancel()
      const updated = await api.subscriptions.me()
      cache.set('dashboard:sub', updated)
      setSub(updated)
      setCancelConfirm(false)
    } catch {} finally { setCancelling(false) }
  }

  if (!authLoading && !user) return null

  const statusColor: Record<string, string> = {
    active: 'text-green-400',
    inactive: 'text-gray-400',
    cancelled: 'text-yellow-400',
    lapsed: 'text-red-400'
  }

  const totalWon = winners.filter(w => w.status === 'paid').reduce((s, w) => s + w.prizeAmount, 0)

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <User size={18} className="text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black leading-none">Dashboard</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>
          <p className="text-gray-400 mb-10 mt-1">Welcome back. Here&apos;s everything in one place.</p>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Subscription */}
            {dataLoading ? <CardSkeleton /> : (
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <CreditCard size={20} className="text-purple-400" />
                  </div>
                  <h2 className="font-bold">Subscription</h2>
                </div>
                {sub ? (
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plan</span>
                      <span className="capitalize font-semibold">{sub.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className={`font-semibold capitalize ${statusColor[sub.status] || 'text-white'}`}>{sub.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Renews</span>
                      <span>{new Date(sub.currentPeriodEnd).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Charity</span>
                      <span>{sub.charity?.name || '—'}</span>
                    </div>
                    {sub.charity && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contribution</span>
                        <span className="text-green-400 font-bold">{sub.charityPercentage}%</span>
                      </div>
                    )}
                    {sub.status === 'active' && (
                      <div className="pt-2 border-t border-white/5">
                        {cancelConfirm ? (
                          <div className="flex flex-col gap-2">
                            <p className="text-yellow-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> Are you sure? This cannot be undone.</p>
                            <div className="flex gap-2">
                              <button onClick={cancelSubscription} disabled={cancelling}
                                className="flex-1 text-xs py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                                {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                              </button>
                              <button onClick={() => setCancelConfirm(false)}
                                className="flex-1 text-xs py-2 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors">
                                Keep it
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setCancelConfirm(true)}
                            className="text-xs text-gray-500 hover:text-red-400 transition-colors">
                            Cancel subscription
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm mb-4">No active subscription</p>
                    <a href="/subscribe" className="btn-primary text-sm px-6 py-2">Subscribe now</a>
                  </div>
                )}
              </div>
            )}

            {/* Charity Impact */}
            {dataLoading ? <CardSkeleton /> : (
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Heart size={20} className="text-pink-400" />
                  </div>
                  <h2 className="font-bold">Charity Impact</h2>
                </div>
                {sub?.charity ? (
                  <div className="flex flex-col gap-3 text-sm">
                    <p className="text-gray-300 font-semibold">{sub.charity.name}</p>
                    <p className="text-gray-400">You&apos;re contributing <span className="text-green-400 font-bold">{sub.charityPercentage}%</span> of your subscription every month.</p>
                    <div className="flex gap-3 mt-2">
                      <a href="/charities" className="text-green-400 text-sm hover:underline">Change charity →</a>
                      <a href={`/charities/${sub.charity.id}`} className="text-blue-400 text-sm hover:underline">Donate extra →</a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No charity selected. <a href="/subscribe" className="text-green-400 hover:underline">Subscribe to choose one.</a></p>
                )}
              </div>
            )}

            {/* Scores */}
            <div className="md:col-span-2">
              <ScoreManager isSubscriber={sub?.status === 'active'} />
            </div>

            {/* Draw Participation */}
            {dataLoading ? <CardSkeleton /> : (
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Calendar size={20} className="text-blue-400" />
                  </div>
                  <h2 className="font-bold">Draw Participation</h2>
                </div>
                {sub?.status === 'active' ? (
                  <>
                    <p className="text-gray-400 text-sm mb-4">You are entered into the next monthly draw. Keep your 5 scores up to date.</p>
                    {entries.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Recent entries</p>
                        {entries.slice(0, 3).map(e => (
                          <div key={e.id} className="bg-white/5 rounded-lg px-3 py-2 text-sm flex justify-between items-center">
                            <span className="text-gray-300">{e.draw?.title}</span>
                            {e.matchType
                              ? <span className="text-yellow-400 font-semibold capitalize text-xs">{e.matchType.replace('_', ' ')}</span>
                              : <span className="text-gray-500 text-xs">No match</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No draw entries yet.</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">Subscribe to participate in monthly draws.</p>
                )}
                <a href="/draws" className="text-green-400 text-sm hover:underline mt-4 block">View all draws →</a>
              </div>
            )}

            {/* Winnings */}
            {dataLoading ? <CardSkeleton /> : (
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Trophy size={20} className="text-yellow-400" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <h2 className="font-bold">Winnings</h2>
                    {totalWon > 0 && (
                      <span className="text-xs text-green-400 font-bold">Total paid: ₹{(totalWon / 100).toFixed(2)}</span>
                    )}
                  </div>
                </div>
                {winners.length === 0 ? (
                  <p className="text-gray-400 text-sm">No winnings yet. Keep playing!</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {winners.map(w => (
                      <div key={w.id} className="bg-white/5 rounded-xl p-4 text-sm">
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">{w.draw?.title}</span>
                          <span className="text-yellow-400 font-bold">₹{(w.prizeAmount / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400 mb-3">
                          <span className="capitalize">{w.matchType?.replace('_', ' ')}</span>
                          <span className={`capitalize font-semibold ${w.status === 'paid' ? 'text-green-400' : w.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>
                            {w.status}
                          </span>
                        </div>
                        {w.status === 'pending' && !w.proofUrl && (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="url"
                              className="input text-xs py-2"
                              placeholder="Paste proof screenshot URL"
                              value={proofUrl[w.id] || ''}
                              onChange={e => setProofUrl(p => ({ ...p, [w.id]: e.target.value }))}
                            />
                            <button
                              onClick={() => submitProof(w.id)}
                              disabled={uploading === w.id}
                              className="btn-primary text-xs px-3 py-2 flex items-center gap-1 whitespace-nowrap"
                            >
                              <Upload size={12} /> Submit
                            </button>
                          </div>
                        )}
                        {w.proofUrl && <p className="text-xs text-gray-500 mt-1">Proof submitted — awaiting review</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </>
  )
}
