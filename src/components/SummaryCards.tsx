import { useEffect, useState } from 'react'
import type { Project } from '../store'
import { useRenovation } from '../store'

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

export function SummaryCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent}`}>{currency(value)}</p>
    </div>
  )
}

export function BudgetSummaryCard({ project }: { project: Project }) {
  const { updateBudget } = useRenovation()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(project.totalBudget)

  useEffect(() => {
    setValue(project.totalBudget)
  }, [project.totalBudget])

  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">Total Budget</p>
          {editing ? (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                className="w-28 rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={() => {
                  updateBudget(project.id, value || 0)
                  setEditing(false)
                }}
                className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setValue(project.totalBudget)
                  setEditing(false)
                }}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{currency(project.totalBudget)}</p>
          )}
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  )
}

