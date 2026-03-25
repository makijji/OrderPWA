import type { AppSettings, Order, Product } from '../../../domain/models'
import { createDefaultSettings, createSeedOrders, createSeedProducts } from '../../seed/mockData'

interface MockStore {
  products: Product[]
  orders: Order[]
  settings: AppSettings
}

const STORAGE_KEY = 'orderpwa-mock-db-v2'

let cache: MockStore | null = null

function createInitialStore(): MockStore {
  const products = createSeedProducts()
  return {
    products,
    orders: createSeedOrders(products),
    settings: createDefaultSettings(),
  }
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

export function loadStore(): MockStore {
  if (cache) return clone(cache)

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    cache = createInitialStore()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
    return clone(cache)
  }

  try {
    const parsed = JSON.parse(raw) as MockStore
    cache = parsed
    return clone(parsed)
  } catch {
    cache = createInitialStore()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
    return clone(cache)
  }
}

export function saveStore(store: MockStore): void {
  cache = clone(store)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}
