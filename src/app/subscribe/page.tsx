'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { cache } from '@/lib/cache'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Check, ArrowRight } from 'lucide-react'

interface Charity { id: string; name: string }

declare global {
  interface Window { Razorpay: new (options: object) => { open: () => void } }
}

export default function SubscribePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [charities, setCharities] = useState<Charity[]>([])
  const [charityId, setCharityId] = useState('')
  const [charityPct, setCharityPct] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Show cached charities if available
    const cached = cache.getStale<Charity[]>('charities:all')
    if (cached) {
      setCharities(cached)
    }
    
    // Always fetch fresh charities
    api.charities.list()
      .then(d => {
        cache.set('charities:all', d)
        setCharities(d)
      })
      .catch(err => console.error('Failed to fetch charities:', err))
  }, [])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  async function handleCheckout() {
    if (!user) return router.push('/login')
    setLoading(true)
    setError('')
    try {
      const data = await api.subscriptions.checkout({
        plan,
        charity_id: charityId || undefined,
        charity_percentage: charityPct
      })

      const options = {
        key: data.key_id,
        order_id: data.order_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Digital Heroes',
        description: data.label,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          await api.subscriptions.verify({
            ...response,
            plan,
            charity_id: charityId || undefined,
            charity_percentage: charityPct
          })
          router.push('/dashboard?subscribed=true')
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#00e676' }
      }

      new window.Razorpay(options).open()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  const plans = {
    monthly: { label: 'Monthly', price: '₹1,000', period: '/month', saving: null },
    yearly:  { label: 'Yearly',  price: '₹10,000', period: '/year', saving: 'Save ₹2,000' }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-black mb-2 text-center">Choose your plan</h1>
          <p className="text-gray-400 text-center mb-12">Cancel anytime. Impact always.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {(['monthly', 'yearly'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={`card p-6 text-left transition-all ${plan === p ? 'border-green-400 glow-green' : 'hover:border-white/20'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-semibold">{plans[p].label}</span>
                  {plans[p].saving && (
                    <span className="text-xs bg-green-400/10 text-green-400 px-2 py-1 rounded-full">{plans[p].saving}</span>
                  )}
                </div>
                <div className="text-3xl font-black">{plans[p].price}</div>
                <div className="text-sm text-gray-500">{plans[p].period}</div>
                {plan === p && <div className="mt-3 text-green-400 text-sm flex items-center gap-1"><Check size={14} /> Selected</div>}
              </button>
            ))}
          </div>

          <div className="card p-6 mb-6">
            <h3 className="font-semibold mb-4">Choose a charity</h3>
            <select className="input mb-4" value={charityId} onChange={e => setCharityId(e.target.value)}>
              <option value="">Select a charity (optional)</option>
              {charities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <label className="text-sm text-gray-400 mb-2 block">
              Charity contribution: <span className="text-green-400 font-bold">{charityPct}%</span>
            </label>
            <input
              type="range" min={10} max={100} value={charityPct}
              onChange={e => setCharityPct(Number(e.target.value))}
              className="w-full accent-green-400"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10% (minimum)</span><span>100%</span>
            </div>
          </div>

          <div className="card p-6 mb-8">
            <h3 className="font-semibold mb-4">What&apos;s included</h3>
            <ul className="flex flex-col gap-3">
              {[
                'Monthly prize draw entry',
                'Score tracking (rolling 5 scores)',
                'Charity contribution every month',
                'Winner verification & payout',
                'Full dashboard access'
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check size={16} className="text-green-400 shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
          >
            {loading ? 'Loading…' : <>Continue to payment <ArrowRight size={18} /></>}
          </button>
        </div>
      </main>
      <Footer />
    </>
  )
}
