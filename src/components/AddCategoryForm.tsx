import { useState } from 'react'
import type { IconKey } from '../store'
import { iconLibrary, useRenovation } from '../store'

type Props = {
  projectId: string
  open: boolean
  onToggle: () => void
}

export function AddCategoryForm({ projectId, open, onToggle }: Props) {
  const { addCategory } = useRenovation()
  const [name, setName] = useState('')
  const [iconKey, setIconKey] = useState<IconKey>('kitchen')

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-400"
      >
        <span className="text-lg">＋</span>
        New Category
      </button>
      {open && (
        <div className="w-full max-w-sm rounded-2xl border border-indigo-400/30 bg-slate-900/80 p-4 shadow-lg shadow-indigo-500/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Add category</p>
            <button className="text-xs text-slate-300" onClick={onToggle}>
              Close
            </button>
          </div>
          <div className="mt-3 space-y-3">
            <label className="block text-sm text-slate-300">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kitchen"
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Icon
              <select
                value={iconKey}
                onChange={(e) => setIconKey(e.target.value as IconKey)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-white"
              >
                {Object.entries(iconLibrary).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.icon} {meta.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() => {
                if (!name.trim()) return
                addCategory(projectId, name.trim(), iconKey)
                setName('')
                setIconKey('kitchen')
                onToggle()
              }}
              className="w-full rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

