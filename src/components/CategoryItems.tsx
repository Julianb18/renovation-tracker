import { useEffect, useState } from 'react'
import type { Item, Status } from '../store'

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

export function AddItemForm({
  onSubmit,
}: {
  onSubmit: (payload: { title: string; amount: number; status: Status; note?: string }) => void
}) {
  const [title, setTitle] = useState('')
  const [amountInput, setAmountInput] = useState('500')
  const [status, setStatus] = useState<Status>('Scheduled')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="mt-3 space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        const amt = Number(amountInput)
        if (!title.trim() || Number.isNaN(amt) || amt <= 0) {
          setError('Enter a title and a positive amount')
          return
        }
        onSubmit({ title: title.trim(), amount: amt, status, note: note.trim() || undefined })
        setTitle('')
        setAmountInput('500')
        setStatus('Scheduled')
        setNote('')
        setError(null)
      }}
    >
      <label className="block text-sm text-slate-300">
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
          placeholder="Order tiles"
        />
      </label>
      <label className="block text-sm text-slate-300">
        Amount
        <input
          type="number"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
          onFocus={(e) => e.target.select()}
        />
      </label>
      <label className="block text-sm text-slate-300">
        Status
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
        >
          <option>Scheduled</option>
          <option>Approved</option>
          <option>Paid</option>
        </select>
      </label>
      <label className="block text-sm text-slate-300">
        Note (optional)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
          rows={2}
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
      >
        Add item
      </button>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </form>
  )
}

export function EditItemButton({
  item,
  onSave,
}: {
  item: Item
  onSave: (updates: Partial<Pick<Item, 'title' | 'amount' | 'status' | 'note'>>) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [amount, setAmount] = useState(item.amount)
  const [note, setNote] = useState(item.note ?? '')

  useEffect(() => {
    setTitle(item.title)
    setAmount(item.amount)
    setNote(item.note ?? '')
  }, [item])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
      >
        Edit
      </button>
    )
  }

  return (
    <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-slate-900/90 p-3 shadow-xl">
      <div className="space-y-2 text-sm">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
          onFocus={(e) => e.target.select()}
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-white"
          rows={2}
          placeholder="Notes"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (!title.trim()) return
              onSave({ title: title.trim(), amount, note: note.trim() || undefined })
              setOpen(false)
            }}
            className="flex-1 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white"
          >
            Save
          </button>
          <button
            onClick={() => setOpen(false)}
            className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export function ItemCard({
  item,
  onStatusChange,
  onEdit,
}: {
  item: Item
  onStatusChange: (status: Status) => void
  onEdit: (updates: Partial<Pick<Item, 'title' | 'amount' | 'status' | 'note'>>) => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold text-white">{item.title}</p>
        <p className="text-xs text-slate-400">{currency(item.amount)}</p>
        {item.note && <p className="text-xs text-slate-500">{item.note}</p>}
      </div>
      <div className="flex items-center gap-3">
        <select
          value={item.status}
          onChange={(e) => onStatusChange(e.target.value as Status)}
          className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
        >
          <option>Scheduled</option>
          <option>Approved</option>
          <option>Paid</option>
        </select>
        <EditItemButton item={item} onSave={onEdit} />
      </div>
    </div>
  )
}

