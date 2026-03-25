import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppData } from '../../app/data-context'
import { Card } from '../../shared/components/Card'
import { LoadingState } from '../../shared/components/State'
import { formatDateTime } from '../../shared/utils/format'

interface DashboardState {
  activeProducts: number
  belowMinStock: number
  lastExportAt?: string
  draftCount: number
  lastDraftId?: string
}

const actionCards = [
  { to: '/orders/new', title: 'New Order', description: 'Create monthly draft order' },
  { to: '/products', title: 'Products', description: 'Manage product catalog' },
  { to: '/import', title: 'Import', description: 'Import product list from CSV/JSON' },
  { to: '/orders/history', title: 'Order History', description: 'Re-open and re-export orders' },
  { to: '/settings', title: 'Settings', description: 'Theme, labels and backup' },
]

export function DashboardPage() {
  const data = useAppData()
  const navigate = useNavigate()
  const [state, setState] = useState<DashboardState | null>(null)

  useEffect(() => {
    void (async () => {
      const [summary, lastDraft] = await Promise.all([data.getSummary(), data.orders.getLastDraft()])
      setState({ ...summary, lastDraftId: lastDraft?.id })
    })()
  }, [data])

  if (!state) {
    return <LoadingState text="Loading dashboard" />
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Active Products</p>
          <p className="mt-2 text-2xl font-semibold">{state.activeProducts}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Below Minimum</p>
          <p className="mt-2 text-2xl font-semibold">{state.belowMinStock}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Last Export</p>
          <p className="mt-2 text-base font-semibold">{formatDateTime(state.lastExportAt)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Draft Count</p>
          <p className="mt-2 text-2xl font-semibold">{state.draftCount}</p>
        </Card>
      </section>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Continue Last Draft</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Resume your most recent unfinished order.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              state.lastDraftId
                ? navigate(`/orders/${state.lastDraftId}`)
                : navigate('/orders/new')
            }
            className="min-h-11 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
          >
            {state.lastDraftId ? 'Open Draft' : 'Create Draft'}
          </button>
        </div>
      </Card>

      <section className="grid gap-3 sm:grid-cols-2">
        {actionCards.map((card) => (
          <Link key={card.to} to={card.to}>
            <Card className="h-full transition hover:border-cyan-400 hover:shadow">
              <h3 className="text-base font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  )
}
