import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from './auth'
import { getTotals, useRenovation } from './store'
import type { Category } from './store'
import { HeaderBar } from './components/HeaderBar'
import { AddCategoryForm } from './components/AddCategoryForm'
import { BudgetSummaryCard, SummaryCard } from './components/SummaryCards'
import { CategoryProgressList } from './components/CategoryProgressList'
import { UpcomingList } from './components/UpcomingList'
import { AddItemForm, ItemCard } from './components/CategoryItems'

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

function App() {
  const { user, loading, signIn } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-300">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Landing onSignIn={signIn} />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.18),transparent_25%),radial-gradient(circle_at_80%_0,rgba(14,165,233,0.14),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.12),transparent_30%)]" />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Routes>
          <Route path="/" element={<ProjectPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  )
}

function ProjectPage() {
  const { state, setActiveProject, deleteCategory } = useRenovation()
  const project = state.projects[0]
  const [showCategoryForm, setShowCategoryForm] = useState(false)

  if (!project) return <NotFound />

  useEffect(() => {
    if (state.activeProjectId !== project.id) {
      setActiveProject(project.id)
    }
  }, [project.id, setActiveProject, state.activeProjectId])

  const totals = getTotals(project)
  const upcoming = project.categories.flatMap((c) =>
    c.items.filter((i) => i.status !== 'Paid').map((i) => ({ ...i, category: c.name, categoryId: c.id }))
  )
  const paid = project.categories.flatMap((c) =>
    c.items.filter((i) => i.status === 'Paid').map((i) => ({ ...i, category: c.name, categoryId: c.id }))
  )

  return (
    <>
      <HeaderBar project={project} />

      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <BudgetSummaryCard project={project} />
        <SummaryCard label="Committed" value={totals.committed} accent="text-pink-300" />
        <SummaryCard label="Paid" value={totals.paid} accent="text-cyan-300" />
        <SummaryCard label="Remaining" value={totals.remaining} accent="text-amber-300" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr,1fr]">
        <div className="glass-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Project Overview</h2>
              <p className="text-sm text-slate-400">Categories, spend, and cashflow</p>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
              {project.categories.length} categories
            </span>
            <div className="flex items-center gap-3">
              <AddCategoryForm
                projectId={project.id}
                open={showCategoryForm}
                onToggle={() => setShowCategoryForm((v) => !v)}
              />
            </div>
          </div>

          <CategoryProgressList
            project={project}
            categories={project.categories}
            onDelete={(categoryId) => deleteCategory(project.id, categoryId)}
          />
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Upcoming & Paid</h2>
              <p className="text-sm text-slate-400">Quick look at cash flow</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
              Live sync
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <UpcomingList title="Upcoming" items={upcoming} emptyText="No scheduled/approved items" />
            <UpcomingList title="Paid" items={paid} emptyText="No paid items yet" />
          </div>
        </div>
      </div>
    </>
  )
}

function CategoryPage() {
  const { categoryId } = useParams()
  const { state, updateItem, addItem } = useRenovation()
  const navigate = useNavigate()
  const project = state.projects[0]
  const category = project?.categories.find((c) => c.id === categoryId)

  if (!project || !category) return <NotFound />

  const totals = getCategoryTotals(category)

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm font-semibold text-indigo-200 underline decoration-indigo-500/60"
      >
        ← Back to project
      </button>

      <div className="glass-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${category.gradient} text-2xl`}
            >
              {category.icon}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{project.name}</p>
              <h2 className="text-xl font-semibold text-white">{category.name}</h2>
              <p className="text-sm text-slate-400">
                Committed {currency(totals.committed)} • Paid {currency(totals.paid)} • Remaining{' '}
                {currency(totals.remaining)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-3">
            {category.items.length === 0 ? (
              <p className="text-sm text-slate-400">No items yet. Add your first purchase or task.</p>
            ) : (
              category.items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onStatusChange={(status) => updateItem(project.id, category.id, item.id, { status })}
                  onEdit={(updates) => updateItem(project.id, category.id, item.id, updates)}
                />
              ))
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="text-lg font-semibold text-white">Add item</h3>
            <AddItemForm
              onSubmit={(payload) =>
                addItem(project.id, category.id, payload.title, payload.amount, payload.status, payload.note)
              }
            />
          </div>
        </div>
      </div>
    </>
  )
}

function NotFound() {
  return <p className="text-slate-300">Not found.</p>
}

function getCategoryTotals(category: Category) {
  const committed = category.items.reduce((s, i) => s + i.amount, 0)
  const paid = category.items.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0)
  return { committed, paid, remaining: committed - paid }
}

export default App

function Landing({ onSignIn }: { onSignIn: () => Promise<void> }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(79,70,229,0.18),transparent_25%),radial-gradient(circle_at_80%_0,rgba(14,165,233,0.14),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.12),transparent_30%)]" />
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
          Renovation Budget Tracker
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white">Track every renovation dollar</h1>
        <p className="mt-3 max-w-xl text-slate-300">
          Sign in to sync your budget, categories, and expenses securely in Firestore and access them across devices.
        </p>
        <button
          onClick={() => void onSignIn()}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-400"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

