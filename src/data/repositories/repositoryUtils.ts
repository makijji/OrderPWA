import { format } from 'date-fns'
import type { ExportRow, Order, Product, ProductFilters, ProductSort } from '../../domain/models'

export function normalize(value: string): string {
  return value.trim().toLowerCase()
}

export function applyProductFilters(
  products: Product[],
  filters: ProductFilters = {
    search: '',
    category: 'all',
    location: 'all',
    supplier: 'all',
    status: 'all',
  },
): Product[] {
  return products.filter((product) => {
    if (filters.search) {
      const query = normalize(filters.search)
      if (
        !normalize(product.name).includes(query) &&
        !normalize(product.sku).includes(query) &&
        !normalize(product.notes).includes(query)
      ) {
        return false
      }
    }

    if (filters.category !== 'all' && product.category !== filters.category) {
      return false
    }

    if (filters.location !== 'all' && product.location !== filters.location) {
      return false
    }

    if (filters.supplier !== 'all' && product.supplier !== filters.supplier) {
      return false
    }

    if (filters.status === 'active' && !product.isActive) {
      return false
    }

    if (filters.status === 'inactive' && product.isActive) {
      return false
    }

    return true
  })
}

export function applyProductSort(products: Product[], sort: ProductSort = 'name'): Product[] {
  return [...products].sort((a, b) => {
    if (sort === 'category') {
      return `${a.category} ${a.name}`.localeCompare(`${b.category} ${b.name}`)
    }
    if (sort === 'location') {
      return `${a.location} ${a.name}`.localeCompare(`${b.location} ${b.name}`)
    }
    return a.name.localeCompare(b.name)
  })
}

export function mapOrderExportRows(order: Order): ExportRow[] {
  return order.items
    .filter((item) => item.orderQty > 0)
    .map((item) => ({
      category: item.snapshotCategory,
      productName: item.snapshotName,
      location: item.snapshotLocation,
      unit: item.snapshotUnit,
      currentStock: item.currentStock,
      orderQty: item.orderQty,
      notes: item.notes,
    }))
    .sort((a, b) => `${a.category} ${a.productName}`.localeCompare(`${b.category} ${b.productName}`))
}

export function buildFileName(pattern: string, title: string, period: string): string {
  const safeTitle = title.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '')
  const date = format(new Date(), 'yyyyMMdd_HHmm')
  return pattern
    .replace('{title}', safeTitle)
    .replace('{period}', period)
    .replace('{date}', date)
    .replace(/\s+/g, '_')
}

export function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  if (typeof value === 'string') {
    const normalized = normalize(value)
    return ['true', '1', 'yes', 'y', 'active'].includes(normalized)
  }
  return true
}

export function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.trim())
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}
