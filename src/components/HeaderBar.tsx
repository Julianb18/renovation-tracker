import { useEffect, useState } from 'react'
import type { Project } from '../store'
import { useAuth } from '../auth'
import { useRenovation } from '../store'

type HeaderBarProps = {
  project: Project
}

export function HeaderBar({ project }: HeaderBarProps) {
  const { user, loading, signIn, signOutUser } = useAuth()
  const { updateProjectName } = useRenovation()
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(project.name)

  useEffect(() => {
    setNameInput(project.name)
  }, [project.name])

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300/80">Renovation Budget Tracker</p>
        {editingName ? (
          <div className="mt-2 flex items-center gap-2">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full max-w-sm rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-lg font-semibold text-white"
              placeholder="Project title"
            />
            <button
              onClick={() => {
                const next = nameInput.trim()
                if (!next) return
                updateProjectName(project.id, next)
                setEditingName(false)
              }}
              className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
            >
              Save
            </button>
            <button
              onClick={() => {
                setNameInput(project.name)
                setEditingName(false)
              }}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-50">{project.name || 'Untitled project'}</h1>
            <button
              onClick={() => setEditingName(true)}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              Edit title
            </button>
          </div>
        )}
        <p className="mt-1 text-slate-400">Manage categories, items, and payments for this project.</p>
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
              {user.isAnonymous ? 'Guest demo user' : user.displayName || user.email}
            </div>
            <button
              onClick={() => void signOutUser()}
              className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={() => void signIn()}
            className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-400 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Sign in to sync'}
          </button>
        )}
      </div>
    </header>
  )
}

