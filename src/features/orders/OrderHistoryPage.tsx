import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppData } from '../../app/data-context'
import { useFeedback } from '../../app/feedback-context'
import type { AppSettings, Order } from '../../domain/models'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import { EmptyState, LoadingState } from '../../shared/components/State'
import { formatDateTime } from '../../shared/utils/format'
import { exportOrder } from '../export/exportService'

export function OrderHistoryPage() {
  const data = useAppData()
  const navigate = useNavigate()
  const { showToast } = useFeedback()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)

  const load = useCallback(async () => {
    const [ordersList, appSettings] = await Promise.all([data.orders.list(), data.settings.get()])
    setOrders(ordersList)
    setSettings(appSettings)
  }, [data.orders, data.settings])

  useEffect(() => {
    void load()
  }, [load])

  if (!orders || !settings) {
    return <LoadingState text="Loading order history" />
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">Order History</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {orders.length} saved orders across draft and ready states.
        </p>
      </Card>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Create your first monthly draft from the dashboard."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold">{order.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Period: {order.period} · Updated: {formatDateTime(order.updatedAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    order.status === 'ready'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
                      : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                {order.items.length} lines · Last export {formatDateTime(order.exportedAt)}
              </p>

              <div className="flex flex-wrap gap-2">
                <Link to={`/orders/${order.id}`}>
                  <Button variant="secondary">Open</Button>
                </Link>

                <Button
                  variant="secondary"
                  onClick={async () => {
                    const duplicated = await data.orders.duplicateAsDraft(order.id)
                    showToast('Draft duplicated', 'success')
                    navigate(`/orders/${duplicated.id}`)
                  }}
                >
                  Duplicate as Draft
                </Button>

                <Button
                  onClick={async () => {
                    const { shared } = await exportOrder(
                      order,
                      settings,
                      settings.preferredExportFormat,
                      true,
                    )
                    const next = await data.settings.update({
                      lastExportAt: new Date().toISOString(),
                    })
                    setSettings(next)
                    showToast(shared ? 'Shared order export' : 'Export downloaded', 'success')
                  }}
                >
                  Re-export
                </Button>

                <Button variant="danger" onClick={() => setDeleteTarget(order)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete order"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          void (async () => {
            await data.orders.delete(deleteTarget.id)
            setDeleteTarget(null)
            await load()
            showToast('Order deleted', 'success')
          })()
        }}
      />
    </div>
  )
}
