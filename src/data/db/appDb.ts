import Dexie, { type Table } from 'dexie'
import type { AppSettings, Order, Product } from '../../domain/models'

export class AppDexie extends Dexie {
  products!: Table<Product, string>
  orders!: Table<Order, string>
  settings!: Table<AppSettings, string>

  constructor() {
    super('order-pwa-db-v2')

    this.version(1).stores({
      products: 'id, name, category, location, supplier, sku, isActive, updatedAt',
      orders: 'id, status, period, updatedAt',
      settings: 'id, updatedAt',
    })
  }
}

export const db = new AppDexie()
