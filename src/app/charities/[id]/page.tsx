'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Calendar, ExternalLink, Heart } from 'lucide-react'
import { useParams } from 'next/navigation'

interface CharityEvent { id: string; title: string; eventDate: string; description: string }
interface Charity {
  id: string; name: string; description: string
  imageUrl: string; websiteUrl: string
  events: CharityEvent[]
}

declare global {
  interface Window { Razorpay: new (options: object) => { open: () => void } }
}

export default function CharityPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [charity, setCharity] = useState<Charity | null>(null)
  const [amount, setAmount] = useState(50000)
  const [donating, setDonating] = useState(false)
  const [donated, setDonated] = useState(false)

  useEffect(() => {
    api.charities.get(id).then(setCharity).catch(() => {})
  }, [id])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  async function donate() {
    if (!user) return (window.location.href = '/login')
    setDonating(true)
    try {
      const data = await api.donations.create({ charity_id: id, amount_paise: amount })
      const options = {
        key: data.key_id,
        order_id: data.order_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Digital Heroes',
        description: `Donation to ${data.charity_name}`,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          await api.donations.verify({ ...response, charity_id: id, amount_paise: amount })
          setDonated(true)
        },
        theme: { color: '#00e676' }
      }
      new window.Razorpay(options).open()
    } finally {
      setDonating(false)
    }
  }

  if (!charity) return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    </>
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">

          {donated && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3 mb-6">
              Thank you for your donation! 💚
            </div>
          )}

          {charity.imageUrl && (
            <div className="h-64 rounded-2xl overflow-hidden mb-8">
              <img src={charity.imageUrl} alt={charity.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-3xl font-black mb-4">{charity.name}</h1>
              <p className="text-gray-300 leading-relaxed mb-6">{charity.description}</p>

              {charity.websiteUrl && (
                <a href={charity.websiteUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-400 text-sm hover:underline mb-8">
                  Visit website <ExternalLink size={14} />
                </a>
              )}

              {charity.events?.length > 0 && (
                <div>
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-400" /> Upcoming Events
                  </h2>
                  <div className="flex flex-col gap-3">
                    {charity.events.map(ev => (
                      <div key={ev.id} className="card p-4">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold">{ev.title}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(ev.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        {ev.description && <p className="text-sm text-gray-400">{ev.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card p-6 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Heart size={18} className="text-pink-400" />
                <h3 className="font-bold">Make a donation</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">One-off donation, independent of your subscription.</p>

              <label className="text-sm text-gray-400 mb-2 block">Amount</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[50000, 100000, 250000].map(a => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`rounded-lg py-2 text-sm font-semibold border transition-colors ${amount === a ? 'border-green-400 text-green-400 bg-green-400/5' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                  >
                    ₹{a / 100}
                  </button>
                ))}
              </div>
              <input
                type="number"
                className="input mb-4"
                placeholder="Custom amount (paise)"
                value={amount}
                min={100}
                onChange={e => setAmount(Number(e.target.value))}
              />
              <button onClick={donate} disabled={donating} className="btn-primary w-full">
                {donating ? 'Loading…' : `Donate ₹${(amount / 100).toFixed(0)}`}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
