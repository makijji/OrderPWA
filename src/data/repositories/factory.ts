import { ProductRepositoryIndexedDb } from './indexeddb/productRepositoryIndexedDb'
import { OrderRepositoryIndexedDb } from './indexeddb/orderRepositoryIndexedDb'
import { SettingsRepositoryIndexedDb } from './indexeddb/settingsRepositoryIndexedDb'
import { ImportRepositoryImpl } from './importRepository'
import { ProductRepositoryMock } from './mock/productRepositoryMock'
import { OrderRepositoryMock } from './mock/orderRepositoryMock'
import { SettingsRepositoryMock } from './mock/settingsRepositoryMock'
import type { DataContext } from '../../domain/repositories'
import type { DatabaseBackup } from '../../domain/models'

const provider = import.meta.env.VITE_DATA_PROVIDER ?? 'indexeddb'

const products =
  provider === 'indexeddb' ? new ProductRepositoryIndexedDb() : new ProductRepositoryMock()

const orders = provider === 'indexeddb' ? new OrderRepositoryIndexedDb() : new OrderRepositoryMock()

const settings =
  provider === 'indexeddb' ? new SettingsRepositoryIndexedDb() : new SettingsRepositoryMock()

const imports = new ImportRepositoryImpl(products)

async function getSummary() {
  const [productList, orderList, appSettings] = await Promise.all([
    products.list(),
    orders.list(),
    settings.get(),
  ])

  const activeProducts = productList.filter((product) => product.isActive).length
  const draftCount = orderList.filter((order) => order.status === 'draft').length

  const belowMinStock = orderList
    .filter((order) => order.status === 'draft')
    .flatMap((order) => order.items)
    .filter((item) => item.currentStock < item.orderQty)
    .length

  return {
    activeProducts,
    belowMinStock,
    lastExportAt: appSettings.lastExportAt,
    draftCount,
  }
}

async function backup(): Promise<string> {
  const [allProducts, allOrders, appSettings] = await Promise.all([
    products.list(),
    orders.list(),
    settings.get(),
  ])

  const payload: DatabaseBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    products: allProducts,
    orders: allOrders,
    settings: appSettings,
  }

  return JSON.stringify(payload, null, 2)
}

async function restore(payload: string): Promise<void> {
  const parsed = JSON.parse(payload) as DatabaseBackup
  if (parsed.version !== 1) {
    throw new Error(`Unsupported backup version: ${String(parsed.version)}`)
  }

  await products.deleteAll()
  await orders.deleteAll()
  await products.putMany(parsed.products)
  await orders.putMany(parsed.orders)
  await settings.save(parsed.settings)
}

export const dataContext: DataContext = {
  products,
  orders,
  settings,
  imports,
  getSummary,
  backup,
  restore,
}

export const activeProvider = provider
