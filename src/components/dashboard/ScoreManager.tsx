'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Trash2, Check, X, AlertCircle } from 'lucide-react'

interface Score { id: string; score: number; scoreDate: string }

export default function ScoreManager({ isSubscriber = false }: { isSubscriber?: boolean }) {
  const [scores, setScores] = useState<Score[]>([])
  const [newScore, setNewScore] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editScore, setEditScore] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const data = await api.scores.list()
      setScores(data)
    } catch {}
  }

  async function addScore() {
    if (!newScore) return setError('Score is required')
    const s = Number(newScore)
    if (s < 1 || s > 45) return setError('Score must be 1–45')
    setError('')
    setLoading(true)
    try {
      await api.scores.add({ score: s })
      setNewScore('')
      await load()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add score')
    } finally {
      setLoading(false)
    }
  }

  async function saveEdit(id: string) {
    const s = Number(editScore)
    if (s < 1 || s > 45) return setError('Score must be 1–45')
    setError('')
    try {
      await api.scores.update(id, { score: s })
      setEditId(null)
      await load()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update score')
    }
  }

  async function deleteScore(id: string) {
    try {
      await api.scores.delete(id)
      await load()
    } catch {}
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">My Scores</h2>
        <span className="text-xs text-gray-500">{scores.length}/5 scores</span>
      </div>

      {!isSubscriber && (
        <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>Scores are saved but won&apos;t count toward draws until you <a href="/subscribe" className="underline">subscribe</a>.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 mb-6">
        {scores.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No scores yet. Add your first score below.</p>
        )}
        {scores.map(s => (
          <div key={s.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            {editId === s.id ? (
              <>
                <input
                  type="number"
                  className="input w-20 py-1 px-2 text-sm"
                  value={editScore}
                  min={1} max={45}
                  onChange={e => setEditScore(e.target.value)}
                />
                <span className="text-xs text-gray-500 flex-1">
                  {new Date(s.scoreDate).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <button onClick={() => saveEdit(s.id)} className="text-green-400 hover:text-green-300">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditId(null)} className="text-gray-500 hover:text-white">
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span className="text-2xl font-black text-green-400 w-12">{s.score}</span>
                <span className="text-sm text-gray-400 flex-1">
                  {new Date(s.scoreDate).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <button onClick={() => { setEditId(s.id); setEditScore(String(s.score)) }} className="text-gray-500 hover:text-white transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => deleteScore(s.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={15} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 pt-5">
        <p className="text-sm text-gray-400 mb-3">
          Add a score {scores.length >= 5 && <span className="text-yellow-400">(replaces oldest)</span>}
        </p>
        <div className="flex gap-3">
          <input
            type="number"
            className="input flex-1"
            placeholder="Enter Stableford score (1–45)"
            min={1} max={45}
            value={newScore}
            onChange={e => setNewScore(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addScore()}
          />
          <button
            onClick={addScore}
            disabled={loading}
            className="btn-primary px-4 py-2 flex items-center gap-1 text-sm"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>
    </div>
  )
}
