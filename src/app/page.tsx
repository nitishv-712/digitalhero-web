import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Heart, Trophy, Target, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">

        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
          {/* Background blobs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00e676]/5 blur-3xl blob" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#7c3aed]/10 blur-3xl blob blob-delay" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-gray-400 mb-8 fade-up">
              <Heart size={14} className="text-green-400" />
              Golf that gives back
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6 fade-up-delay">
              Play golf.<br />
              <span className="gradient-text">Change lives.</span><br />
              Win prizes.
            </h1>

            <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 fade-up-delay-2">
              Track your Stableford scores, support a charity you believe in, and enter our monthly prize draw — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-up-delay-2">
              <Link href="/subscribe" className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2">
                Start for free <ArrowRight size={18} />
              </Link>
              <Link href="/charities" className="btn-outline text-base px-8 py-4">
                Explore charities
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-4">How it works</h2>
            <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">Three simple steps. Real impact.</p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Target size={28} className="text-green-400" />,
                  step: '01',
                  title: 'Enter your scores',
                  desc: 'Log your last 5 Stableford scores. Your rolling average keeps your entry fresh every month.'
                },
                {
                  icon: <Heart size={28} className="text-pink-400" />,
                  step: '02',
                  title: 'Support a charity',
                  desc: 'Choose a charity at signup. A portion of every subscription goes directly to them — you decide how much.'
                },
                {
                  icon: <Trophy size={28} className="text-yellow-400" />,
                  step: '03',
                  title: 'Win the monthly draw',
                  desc: 'Match 3, 4, or all 5 drawn numbers to your scores. Jackpot rolls over if unclaimed.'
                }
              ].map(({ icon, step, title, desc }) => (
                <div key={step} className="card p-8 hover:border-white/20 transition-colors">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      {icon}
                    </div>
                    <span className="text-5xl font-black text-white/5">{step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{title}</h3>
                  <p className="text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prize pool breakdown */}
        <section className="py-24 px-6 bg-[#13131a]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">The prize pool</h2>
            <p className="text-gray-400 mb-16">Every subscription contributes. Every month, it pays out.</p>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { match: '5-Number Match', share: '40%', label: 'Jackpot', color: 'text-yellow-400', rollover: true },
                { match: '4-Number Match', share: '35%', label: 'Major prize', color: 'text-green-400', rollover: false },
                { match: '3-Number Match', share: '25%', label: 'Entry prize', color: 'text-purple-400', rollover: false }
              ].map(({ match, share, label, color, rollover }) => (
                <div key={match} className="card p-8">
                  <div className={`text-4xl font-black mb-2 ${color}`}>{share}</div>
                  <div className="font-semibold mb-1">{match}</div>
                  <div className="text-sm text-gray-500 mb-3">{label}</div>
                  {rollover && (
                    <span className="text-xs bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full">
                      Jackpot rolls over
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Charity impact */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center mx-auto mb-6">
              <Heart size={32} className="text-pink-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Giving is built in
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
              At least 10% of every subscription goes to your chosen charity. You can give more — up to 100%. Browse our charity directory and find a cause that moves you.
            </p>
            <Link href="/charities" className="btn-primary inline-flex items-center gap-2 px-8 py-4">
              Browse charities <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 bg-[#13131a]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to <span className="gradient-text">play with purpose?</span>
            </h2>
            <p className="text-gray-400 mb-10">Monthly or yearly. Cancel anytime. Impact always.</p>
            <Link href="/subscribe" className="btn-primary text-lg px-10 py-5 inline-flex items-center gap-2">
              Subscribe now <ArrowRight size={20} />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
