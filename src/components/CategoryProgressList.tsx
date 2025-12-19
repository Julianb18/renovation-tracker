import { Link } from 'react-router-dom'
import type { Category, Project } from '../store'

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

type Props = {
  project: Project
  categories: Category[]
  onDelete: (categoryId: string) => void
}

export function CategoryProgressList({ project, categories, onDelete }: Props) {
  return (
    <div className="mt-4 space-y-4">
      {categories.map((category) => {
        const catTotals = getCategoryTotals(category)
        const committedPct =
          catTotals.committed === 0 ? 0 : Math.min(100, Math.round((catTotals.committed / project.totalBudget) * 100))
        const paidPct =
          catTotals.committed === 0 ? 0 : Math.min(100, Math.round((catTotals.paid / catTotals.committed) * 100))
        return (
          <div key={`${category.id}-row`} className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${category.gradient} text-lg`}
                >
                  {category.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{category.name}</p>
                  <p className="text-xs text-slate-400">
                    Committed {currency(catTotals.committed)} • Paid {currency(catTotals.paid)}
                  </p>
                </div>
              </div>
              <Link
                className="text-xs font-semibold text-indigo-200 underline decoration-indigo-500/70 decoration-dashed"
                to={`/category/${category.id}`}
              >
                View
              </Link>
              <button
                onClick={() => {
                  const ok = window.confirm(`Delete category "${category.name}"? This will remove its items.`)
                  if (ok) onDelete(category.id)
                }}
                className="text-xs font-semibold text-rose-200 underline decoration-rose-400/70 decoration-dashed"
              >
                Delete
              </button>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${category.gradient}`}
                style={{ width: `${committedPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Paid {paidPct}%</span>
              <span>Remaining {currency(catTotals.remaining)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getCategoryTotals(category: Category) {
  const committed = category.items.reduce((s, i) => s + i.amount, 0)
  const paid = category.items.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0)
  return { committed, paid, remaining: committed - paid }
}

