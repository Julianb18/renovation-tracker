import type { Project } from '../store'
import { useAuth } from '../auth'

type HeaderBarProps = {
  project: Project
}

export function HeaderBar({ project }: HeaderBarProps) {
  const { user, loading, signIn, signOutUser } = useAuth()

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300/80">Renovation Budget Tracker</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-50">{project.name}</h1>
        <p className="mt-1 text-slate-400">Manage categories, items, and payments for this project.</p>
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
              {user.displayName || user.email}
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

