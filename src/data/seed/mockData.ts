import { addDays, format } from 'date-fns'
import { LOCATIONS, SUPPLIERS } from '../../domain/constants'
import type { AppSettings, Order, Product } from '../../domain/models'
import { INVENTORY_SEED } from './inventorySeed'

function buildStableSeedId(index: number, sku: string, name: string): string {
  const token = (sku || name).replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 36)
  return `seed-${String(index + 1).padStart(4, '0')}-${token || 'item'}`
}

export function createSeedProducts(): Product[] {
  const now = new Date()

  return INVENTORY_SEED.map((row, index) => {
    const createdAt = addDays(now, -Math.max(index % 60, 1)).toISOString()
    return {
      id: buildStableSeedId(index, row.sku, row.name),
      name: row.name,
      category: row.category || 'NN',
      unit: row.unit || 'NN',
      location: row.location || LOCATIONS[0],
      minStock: Math.max(0, row.minStock),
      defaultOrderQty: Math.max(0, row.defaultOrderQty),
      supplier: row.supplier || SUPPLIERS[0],
      sku: row.sku,
      notes: row.notes,
      isActive: row.isActive,
      createdAt,
      updatedAt: createdAt,
    }
  })
}

export function createSeedOrders(_products: Product[]): Order[] {
  return []
}

export function createDefaultSettings(): AppSettings {
  return {
    id: 'app-settings',
    organizationLabel: 'Private Facility Operations',
    departmentLabel: 'Storage & Maintenance',
    preferredExportFormat: 'xlsx',
    defaultEmailRecipient: '',
    theme: 'system',
    fileNamePattern: '{period}_{title}',
    updatedAt: new Date().toISOString(),
  }
}

export function createSeedOrderTitle(): string {
  return `Monthly Replenishment ${format(new Date(), 'MMMM yyyy')}`
}
