import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useAppData } from '../../app/data-context'
import { useFeedback } from '../../app/feedback-context'
import type { AppSettings, Order, OrderItem, PreferredExportFormat, Product } from '../../domain/models'
import { exportOrder, buildOrderEmailSubject, buildOrderSummaryText } from '../export/exportService'
import { copyText } from '../../shared/utils/files'
import { Card } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { EmptyState, LoadingState } from '../../shared/components/State'
import { StickyActionBar } from '../../shared/components/StickyActionBar'
import { useAutosave } from '../../shared/hooks/useAutosave'
import { OrderItemRow } from './components/OrderItemRow'

function toOrderItem(product: Product): OrderItem {
  return {
    id: uuidv4(),
    productId: product.id,
    snapshotName: product.name,
    snapshotUnit: product.unit,
    snapshotCategory: product.category,
    snapshotLocation: product.location,
    currentStock: 0,
    orderQty: product.defaultOrderQty,
    notes: '',
    checked: false,
  }
}

export function OrderEditorPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const data = useAppData()
  const { showToast } = useFeedback()

  const [isLoading, setIsLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)
  const [catalog, setCatalog] = useState<Product[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [search, setSearch] = useState('')
  const [quickAddIds, setQuickAddIds] = useState<string[]>([])
  const [hideZeroRows, setHideZeroRows] = useState(false)
  const [exportFormat, setExportFormat] = useState<PreferredExportFormat>('xlsx')

  useEffect(() => {
    void (async () => {
      setIsLoading(true)
      const [products, appSettings, quickIds] = await Promise.all([
        data.products.list({
          search: '',
          category: 'all',
          location: 'all',
          supplier: 'all',
          status: 'active',
        }),
        data.settings.get(),
        data.orders.quickAddProducts(),
      ])

      setCatalog(products)
      setSettings(appSettings)
      setExportFormat(appSettings.preferredExportFormat)
      setQuickAddIds(quickIds)

      if (orderId) {
        const existing = await data.orders.getById(orderId)
        if (existing) {
          setOrder(existing)
        } else {
          const created = await data.orders.createDraft()
          setOrder(created)
          navigate(`/orders/${created.id}`, { replace: true })
        }
      } else {
        const created = await data.orders.createDraft()
        setOrder(created)
        navigate(`/orders/${created.id}`, { replace: true })
      }

      setIsLoading(false)
    })()
  }, [data.orders, data.products, data.settings, navigate, orderId])

  useAutosave(
    order,
    async (value) => {
      if (!value) return
      await data.orders.save(value)
    },
    1000,
  )

  const visibleCatalog = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) {
      return catalog.slice(0, 40)
    }

    return catalog
      .filter((product) =>
        `${product.name} ${product.sku} ${product.location}`.toLowerCase().includes(normalized),
      )
      .slice(0, 40)
  }, [catalog, search])

  const quickAddProducts = useMemo(
    () => quickAddIds.map((id) => catalog.find((product) => product.id === id)).filter(Boolean) as Product[],
    [catalog, quickAddIds],
  )

  const addProductToOrder = useCallback((product: Product) => {
    setOrder((current) => {
      if (!current) return current
      if (current.items.some((item) => item.productId === product.id)) {
        return current
      }
      return {
        ...current,
        items: [...current.items, toOrderItem(product)],
      }
    })
  }, [])

  const groupedItems = useMemo(() => {
    if (!order) return []

    const byCategory = new Map<string, OrderItem[]>()
    order.items.forEach((item) => {
      if (hideZeroRows && item.orderQty <= 0) {
        return
      }

      const list = byCategory.get(item.snapshotCategory) ?? []
      list.push(item)
      byCategory.set(item.snapshotCategory, list)
    })

    return [...byCategory.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [hideZeroRows, order])

  if (isLoading || !order || !settings) {
    return <LoadingState text="Preparing order draft" />
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Order title</span>
            <input
              className="min-h-11 w-full rounded-xl border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-800"
              value={order.title}
              onChange={(event) =>
                setOrder((current) => (current ? { ...current, title: event.target.value } : current))
              }
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Period</span>
            <input
              type="month"
              className="min-h-11 w-full rounded-xl border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-800"
              value={order.period}
              onChange={(event) =>
                setOrder((current) => (current ? { ...current, period: event.target.value } : current))
              }
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hideZeroRows}
              onChange={(event) => setHideZeroRows(event.target.checked)}
            />
            Hide zero quantity rows
          </label>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              order.status === 'ready'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
                : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
            }`}
          >
            {order.status === 'ready' ? 'Ready' : 'Draft'}
          </span>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold">Quick Add Frequent Items</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickAddProducts.length === 0 ? (
            <p className="text-sm text-slate-500">No quick-add suggestions yet.</p>
          ) : (
            quickAddProducts.map((product) => (
              <button
                type="button"
                key={product.id}
                className="min-h-11 rounded-full bg-cyan-100 px-4 text-sm font-medium text-cyan-900 hover:bg-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-100"
                onClick={() => addProductToOrder(product)}
              >
                + {product.name}
              </button>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold">Add from Catalog</h2>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block font-medium">Search products</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Type name, SKU or location"
            className="min-h-11 w-full rounded-xl border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>

        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
          {visibleCatalog.map((product) => {
            const exists = order.items.some((item) => item.productId === product.id)
            return (
              <div
                key={product.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700"
              >
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-slate-500">
                    {product.category} · {product.location} · default {product.defaultOrderQty}
                  </p>
                </div>
                <Button
                  variant={exists ? 'secondary' : 'primary'}
                  disabled={exists}
                  onClick={() => addProductToOrder(product)}
                >
                  {exists ? 'Added' : 'Add'}
                </Button>
              </div>
            )
          })}
        </div>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Order Items</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {order.items.length} products in draft
          </p>
        </div>

        {groupedItems.length === 0 ? (
          <EmptyState
            title="No items in draft"
            description="Add products from the catalog to build this month's order."
          />
        ) : (
          groupedItems.map(([category, items]) => (
            <Card key={category} className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{category}</h3>
              {items.map((item) => (
                <OrderItemRow
                  key={item.id}
                  item={item}
                  onChange={(next) => {
                    setOrder((current) => {
                      if (!current) return current
                      return {
                        ...current,
                        items: current.items.map((entry) => (entry.id === item.id ? next : entry)),
                      }
                    })
                  }}
                  onRemove={() => {
                    setOrder((current) => {
                      if (!current) return current
                      return {
                        ...current,
                        items: current.items.filter((entry) => entry.id !== item.id),
                      }
                    })
                  }}
                />
              ))}
            </Card>
          ))
        )}
      </section>

      <StickyActionBar>
        <Button
          variant="secondary"
          onClick={async () => {
            const saved = await data.orders.save({
              ...order,
              status: 'ready',
            })
            setOrder(saved)
            showToast('Order marked as ready', 'success')
          }}
        >
          Mark Ready
        </Button>

        <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800">
          Export
          <select
            value={exportFormat}
            onChange={(event) => setExportFormat(event.target.value as PreferredExportFormat)}
            className="bg-transparent outline-none"
          >
            <option value="xlsx">XLSX</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </label>

        <Button
          onClick={async () => {
            const { shared } = await exportOrder(order, settings, exportFormat, true)
            const now = new Date().toISOString()
            const updatedSettings = await data.settings.update({
              lastExportAt: now,
              preferredExportFormat: exportFormat,
            })
            setSettings(updatedSettings)
            showToast(shared ? 'Shared export file' : 'Export downloaded', 'success')
          }}
        >
          Share Export
        </Button>

        <Button
          variant="secondary"
          onClick={async () => {
            await copyText(buildOrderEmailSubject(order))
            showToast('Email subject copied', 'success')
          }}
        >
          Copy Subject
        </Button>

        <Button
          variant="secondary"
          onClick={async () => {
            await copyText(buildOrderSummaryText(order))
            showToast('Summary copied', 'success')
          }}
        >
          Copy Summary
        </Button>
      </StickyActionBar>
    </div>
  )
}
