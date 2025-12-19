import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from './auth'

export type Status = 'Scheduled' | 'Approved' | 'Paid'

export type Item = {
  id: string
  title: string
  amount: number
  status: Status
  note?: string
}

export type Category = {
  id: string
  name: string
  iconKey: IconKey
  icon: string
  gradient: string
  items: Item[]
}

export type Project = {
  id: string
  name: string
  totalBudget: number
  categories: Category[]
}

export type IconKey = 'kitchen' | 'bedroom' | 'living' | 'bathroom' | 'exterior' | 'office'

export const iconLibrary: Record<
  IconKey,
  {
    label: string
    icon: string
    gradient: string
  }
> = {
  kitchen: {
    label: 'Kitchen',
    icon: '🍳',
    gradient: 'from-pink-500 via-rose-500 to-orange-400',
  },
  bedroom: {
    label: 'Bedroom',
    icon: '🛏️',
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
  },
  living: {
    label: 'Living Room',
    icon: '🛋️',
    gradient: 'from-amber-400 via-orange-400 to-amber-500',
  },
  bathroom: {
    label: 'Bathroom',
    icon: '🛁',
    gradient: 'from-cyan-400 via-sky-400 to-blue-500',
  },
  office: {
    label: 'Office',
    icon: '💻',
    gradient: 'from-blue-500 via-indigo-500 to-slate-500',
  },
}

type State = {
  projects: Project[]
  activeProjectId?: string
  hydrated: boolean
}

type PersistedState = Omit<State, 'hydrated'>

type Action =
  | { type: 'set-active-project'; projectId: string }
  | { type: 'add-project'; name: string; totalBudget: number }
  | { type: 'update-budget'; projectId: string; totalBudget: number }
  | { type: 'add-category'; projectId: string; name: string; iconKey: IconKey }
  | { type: 'delete-category'; projectId: string; categoryId: string }
  | {
      type: 'add-item'
      projectId: string
      categoryId: string
      title: string
      amount: number
      status: Status
      note?: string
    }
  | {
      type: 'update-item'
      projectId: string
      categoryId: string
      itemId: string
      updates: Partial<Pick<Item, 'title' | 'amount' | 'status' | 'note'>>
    }
  | { type: 'hydrate'; state: PersistedState }
  | { type: 'reset'; state: State }

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 10)
}

function sampleState(): State {
  const projectId = uuid()
  return {
    projects: [
      {
        id: projectId,
        name: '',
        totalBudget: 0,
        categories: [],
      },
    ],
    activeProjectId: projectId,
    hydrated: false,
  }
}

function sanitizeState(state: State): PersistedState {
  const { hydrated, ...rest } = state
  return rest
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      return action.state
    case 'hydrate':
      return { ...action.state, hydrated: true }
    case 'set-active-project':
      return { ...state, activeProjectId: action.projectId }
    case 'add-project': {
      const newProject: Project = {
        id: uuid(),
        name: action.name,
        totalBudget: action.totalBudget,
        categories: [],
      }
      return {
        ...state,
        projects: [...state.projects, newProject],
        activeProjectId: newProject.id,
      }
    }
    case 'update-budget': {
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId ? { ...p, totalBudget: action.totalBudget } : p
        ),
      }
    }
    case 'add-category': {
      const icon = iconLibrary[action.iconKey]
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? {
                ...p,
                categories: [
                  ...p.categories,
                  {
                    id: uuid(),
                    name: action.name,
                    iconKey: action.iconKey,
                    icon: icon.icon,
                    gradient: icon.gradient,
                    items: [],
                  },
                ],
              }
            : p
        ),
      }
    }
    case 'delete-category': {
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? { ...p, categories: p.categories.filter((c) => c.id !== action.categoryId) }
            : p
        ),
      }
    }
    case 'add-item': {
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? {
                ...p,
                categories: p.categories.map((c) =>
                  c.id === action.categoryId
                    ? {
                        ...c,
                        items: [
                          ...c.items,
                          {
                            id: uuid(),
                            title: action.title,
                            amount: action.amount,
                            status: action.status,
                            note: action.note,
                          },
                        ],
                      }
                    : c
                ),
              }
            : p
        ),
      }
    }
    case 'update-item': {
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.projectId
            ? {
                ...p,
                categories: p.categories.map((c) =>
                  c.id === action.categoryId
                    ? {
                        ...c,
                        items: c.items.map((i) => (i.id === action.itemId ? { ...i, ...action.updates } : i)),
                      }
                    : c
                ),
              }
            : p
        ),
      }
    }
    default:
      return state
  }
}

type Ctx = {
  state: State
  activeProject: Project | undefined
  setActiveProject: (id: string) => void
  addProject: (name: string, totalBudget: number) => void
  updateBudget: (projectId: string, totalBudget: number) => void
  addCategory: (projectId: string, name: string, iconKey: IconKey) => void
  deleteCategory: (projectId: string, categoryId: string) => void
  addItem: (projectId: string, categoryId: string, title: string, amount: number, status: Status, note?: string) => void
  updateItem: (
    projectId: string,
    categoryId: string,
    itemId: string,
    updates: Partial<Pick<Item, 'title' | 'amount' | 'status' | 'note'>>
  ) => void
}

const RenovationContext = createContext<Ctx | null>(null)

export function RenovationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, sampleState())
  const { user } = useAuth()

  // Reset local state when user changes to avoid leaking previous user's data
  useEffect(() => {
    if (user) {
      dispatch({ type: 'reset', state: sampleState() })
    }
  }, [user?.uid])

  // Hydrate from Firestore when signed in
  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'users', user.uid, 'data', 'app')
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() as PersistedState | undefined
      if (data) {
        dispatch({ type: 'hydrate', state: data })
      } else {
        const seed = sanitizeState(sampleState())
        void setDoc(ref, seed)
        dispatch({ type: 'hydrate', state: seed })
      }
    })
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  // Persist to Firestore when signed in and hydrated
  useEffect(() => {
    if (!user || !state.hydrated) return
    const persistable = sanitizeState(state)
    const ref = doc(db, 'users', user.uid, 'data', 'app')
    void setDoc(ref, persistable)
  }, [state, user])

  const activeProject = useMemo(() => {
    if (state.activeProjectId) return state.projects.find((p) => p.id === state.activeProjectId)
    return state.projects[0]
  }, [state.projects, state.activeProjectId])

  const value: Ctx = {
    state,
    activeProject,
    setActiveProject: (id) => dispatch({ type: 'set-active-project', projectId: id }),
    addProject: (name, totalBudget) => dispatch({ type: 'add-project', name, totalBudget }),
    updateBudget: (projectId, totalBudget) => dispatch({ type: 'update-budget', projectId, totalBudget }),
    addCategory: (projectId, name, iconKey) => dispatch({ type: 'add-category', projectId, name, iconKey }),
    deleteCategory: (projectId, categoryId) => dispatch({ type: 'delete-category', projectId, categoryId }),
    addItem: (projectId, categoryId, title, amount, status, note) =>
      dispatch({ type: 'add-item', projectId, categoryId, title, amount, status, note }),
    updateItem: (projectId, categoryId, itemId, updates) =>
      dispatch({ type: 'update-item', projectId, categoryId, itemId, updates }),
  }

  return <RenovationContext.Provider value={value}>{children}</RenovationContext.Provider>
}

export function useRenovation() {
  const ctx = useContext(RenovationContext)
  if (!ctx) throw new Error('useRenovation must be used within RenovationProvider')
  return ctx
}

export function getTotals(project: Project) {
  const committed = project.categories.reduce(
    (sum, c) => sum + c.items.reduce((s, i) => s + i.amount, 0),
    0
  )
  const paid = project.categories.reduce(
    (sum, c) => sum + c.items.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0),
    0
  )
  return { committed, paid, remaining: project.totalBudget - committed }
}

