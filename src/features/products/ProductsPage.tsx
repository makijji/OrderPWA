import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Product, ProductFilters, ProductSort } from '../../domain/models'
import { CATEGORIES, LOCATIONS, SUPPLIERS } from '../../domain/constants'
import { useAppData } from '../../app/data-context'
import { useFeedback } from '../../app/feedback-context'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { EmptyState, LoadingState } from '../../shared/components/State'
import { ProductFormModal } from './components/ProductFormModal'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'

const defaultFilters: ProductFilters = {
  search: '',
  category: 'all',
  location: 'all',
  supplier: 'all',
  status: 'active',
}

export function ProductsPage() {
  const data = useAppData()
  const { showToast } = useFeedback()
  const [products, setProducts] = useState<Product[] | null>(null)
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters)
  const [sort, setSort] = useState<ProductSort>('name')
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()
  const [formOpen, setFormOpen] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null)

  const loadProducts = useCallback(async () => {
    setProducts(await data.products.list(filters, sort))
  }, [data.products, filters, sort])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const activeCount = useMemo(
    () => (products ? products.filter((product) => product.isActive).length : 0),
    [products],
  )

  const closeForm = () => {
    setFormOpen(false)
    setEditingProduct(undefined)
  }

  if (!products) {
    return <LoadingState text="Loading products" />
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Product Catalog</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {products.length} records, {activeCount} active
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingProduct(undefined)
              setFormOpen(true)
            }}
          >
            Add Product
          </Button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Search</span>
            <input
              className="min-h-11 w-full rounded-xl border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-800"
              placeholder="Name, SKU, notes"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Category</span>
            <select
              className="min-h-11 w-full rounded-xl border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-800"
              value={filters.category}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  category: event.target.value as ProductFilters['category'],
                }))
              }
            >
              <option value="all">All</option>
              {CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Location</span>
            <select
              className="min-h-11 w-full rounded-xl border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-800"
              value={filters.location}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
            >
              <option value="all">All</option>
              {LOCATIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Supplier</span>
            <select
              className="min-h-11 w-full rounded-xl border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-800"
              value={filters.supplier}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  supplier: event.target.value,
                }))
              }
            >
              <option value="all">All</option>
              {SUPPLIERS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Status</span>
            <select
              className="min-h-11 w-full rounded-xl border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-800"
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value as ProductFilters['status'],
                }))
              }
            >
              <option value="all">All</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Sort</span>
            <select
              className="min-h-11 w-full rounded-xl border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-800"
              value={sort}
              onChange={(event) => setSort(event.target.value as ProductSort)}
            >
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="location">Location</option>
            </select>
          </label>
        </div>
      </Card>

      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Adjust filters or add the first product to start building orders."
        />
      ) : (
        <div className="grid gap-3">
          {products.map((product) => (
            <Card key={product.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold">{product.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {product.category} · {product.location} · {product.unit}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    SKU: {product.sku || 'n/a'} · Supplier: {product.supplier || 'n/a'}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    product.isActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                  }`}
                >
                  {product.isActive ? 'Active' : 'Archived'}
                </span>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300">
                Min stock: {product.minStock} · Default order qty: {product.defaultOrderQty}
              </div>

              {product.notes ? (
                <p className="text-sm text-slate-700 dark:text-slate-200">{product.notes}</p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingProduct(product)
                    setFormOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await data.products.duplicate(product.id)
                    showToast('Product duplicated', 'success')
                    void loadProducts()
                  }}
                >
                  Duplicate
                </Button>
                {product.isActive ? (
                  <Button variant="danger" onClick={() => setArchiveTarget(product)}>
                    Archive
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      await data.products.reactivate(product.id)
                      showToast('Product reactivated', 'success')
                      void loadProducts()
                    }}
                  >
                    Reactivate
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ProductFormModal
        open={formOpen}
        product={editingProduct}
        onClose={closeForm}
        onSaved={() => {
          showToast('Product saved', 'success')
          void loadProducts()
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(archiveTarget)}
        title="Archive product"
        description="Archived products stay in history but are hidden from active lists."
        confirmLabel="Archive"
        onCancel={() => setArchiveTarget(null)}
        onConfirm={() => {
          if (!archiveTarget) return
          void (async () => {
            await data.products.archive(archiveTarget.id)
            showToast('Product archived', 'success')
            setArchiveTarget(null)
            void loadProducts()
          })()
        }}
      />
    </div>
  )
}
