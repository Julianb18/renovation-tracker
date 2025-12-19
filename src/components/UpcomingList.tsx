import { Link } from 'react-router-dom'
import type { Item } from '../store'

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

type UpcomingListProps = {
  title: string
  items: (Item & { category: string; categoryId: string; project?: string; projectId?: string; note?: string })[]
  emptyText: string
}

export function UpcomingList({ title, items, emptyText }: UpcomingListProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        items.map((item) => (
          <Link
            key={item.id}
            to={`/category/${item.categoryId}`}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10"
          >
            <div>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="text-xs text-slate-400">
                {item.project ? `${item.project} • ` : ''}
                {item.category} • {item.status}
              </p>
              {item.note && <p className="text-xs text-slate-500">{item.note}</p>}
            </div>
            <p className="text-sm font-semibold text-emerald-200">{currency(item.amount)}</p>
          </Link>
        ))
      )}
    </div>
  )
}

