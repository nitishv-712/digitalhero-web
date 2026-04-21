'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

function validate(form: { full_name: string; email: string; password: string; confirm: string }) {
  const errors: Record<string, string> = {}
  if (!form.full_name.trim()) errors.full_name = 'Full name is required'
  else if (form.full_name.trim().length < 2) errors.full_name = 'Name must be at least 2 characters'

  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address'

  if (!form.password) errors.password = 'Password is required'
  else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters'
  else if (!/[A-Z]/.test(form.password)) errors.password = 'Include at least one uppercase letter'
  else if (!/[0-9]/.test(form.password)) errors.password = 'Include at least one number'

  if (!form.confirm) errors.confirm = 'Please confirm your password'
  else if (form.confirm !== form.password) errors.confirm = 'Passwords do not match'

  return errors
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ]
  const score = checks.filter(Boolean).length
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colors[score] : 'bg-white/10'}`} />
        ))}
      </div>
      <p className={`text-xs ${score <= 1 ? 'text-red-400' : score === 2 ? 'text-yellow-400' : score === 3 ? 'text-blue-400' : 'text-green-400'}`}>
        {labels[score]}
      </p>
    </div>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setServerError('')
    setLoading(true)
    try {
      await api.auth.signup({ full_name: form.full_name, email: form.email, password: form.password })
      router.push('/login?registered=true')
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h1 className="text-2xl font-black mb-2">Create your account</h1>
            <p className="text-gray-400 text-sm mb-8">Join Digital Heroes and start playing with purpose</p>

            {serverError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Full name</label>
                <input
                  type="text"
                  className={`input ${errors.full_name ? 'border-red-500/50' : ''}`}
                  placeholder="Your name"
                  value={form.full_name}
                  onChange={e => handleChange('full_name', e.target.value)}
                />
                {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Email</label>
                <input
                  type="email"
                  className={`input ${errors.email ? 'border-red-500/50' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Password</label>
                <input
                  type="password"
                  className={`input ${errors.password ? 'border-red-500/50' : ''}`}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                />
                <PasswordStrength password={form.password} />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Confirm password</label>
                <input
                  type="password"
                  className={`input ${errors.confirm ? 'border-red-500/50' : ''}`}
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={e => handleChange('confirm', e.target.value)}
                />
                {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
              </div>
              <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-green-400 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
