'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md bg-[#0a0a0f]/80">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight gradient-text">
          Digital Heroes
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <Link href="/charities" className="hover:text-white transition-colors">Charities</Link>
          <Link href="/draws" className="hover:text-white transition-colors">Draws</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <button onClick={handleLogout} className="btn-outline text-sm py-2 px-4">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
              <Link href="/subscribe" className="btn-primary text-sm py-2 px-5">Subscribe</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-gray-400" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0f] px-6 py-4 flex flex-col gap-4 text-sm">
          <Link href="/charities" onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">Charities</Link>
          <Link href="/draws" onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">Draws</Link>
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">Dashboard</Link>
              <button onClick={handleLogout} className="btn-outline text-sm py-2">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">Sign in</Link>
              <Link href="/subscribe" onClick={() => setOpen(false)} className="btn-primary text-sm py-2 text-center">Subscribe</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
