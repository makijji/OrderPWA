import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import type { Order, OrderItem } from '../../../domain/models'
import type { OrderRepository } from '../../../domain/repositories'
import { db } from '../../db/appDb'
import { ensureDexieSeeded } from '../../db/seedDexie'

function cloneItems(items: OrderItem[]): OrderItem[] {
  return items.map((item) => ({ ...item }))
}

export class OrderRepositoryIndexedDb implements OrderRepository {
  async list(): Promise<Order[]> {
    await ensureDexieSeeded()
    const orders = await db.orders.toArray()
    return orders.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async getById(id: string): Promise<Order | undefined> {
    await ensureDexieSeeded()
    return db.orders.get(id)
  }

  async createDraft(title = ''): Promise<Order> {
    await ensureDexieSeeded()
    const now = new Date()
    const order: Order = {
      id: uuidv4(),
      title: title || `Monthly Replenishment ${format(now, 'MMMM yyyy')}`,
      period: format(now, 'yyyy-MM'),
      status: 'draft',
      items: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }

    await db.orders.add(order)
    return order
  }

  async save(order: Order): Promise<Order> {
    await ensureDexieSeeded()
    const next: Order = {
      ...order,
      updatedAt: new Date().toISOString(),
    }
    await db.orders.put(next)
    return next
  }

  async duplicateAsDraft(id: string): Promise<Order> {
    await ensureDexieSeeded()
    const source = await db.orders.get(id)
    if (!source) {
      throw new Error('Order not found')
    }

    const draft: Order = {
      ...source,
      id: uuidv4(),
      title: `${source.title} Copy`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exportedAt: undefined,
      items: cloneItems(source.items).map((item) => ({
        ...item,
        id: uuidv4(),
        checked: false,
      })),
    }

    await db.orders.add(draft)
    return draft
  }

  async delete(id: string): Promise<void> {
    await ensureDexieSeeded()
    await db.orders.delete(id)
  }

  async getLastDraft(): Promise<Order | undefined> {
    const orders = await this.list()
    return orders.find((order) => order.status === 'draft')
  }

  async quickAddProducts(limit = 8): Promise<string[]> {
    const orders = await this.list()
    const counts = new Map<string, number>()

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.orderQty > 0) {
          counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1)
        }
      })
    })

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId]) => productId)
  }

  async deleteAll(): Promise<void> {
    await ensureDexieSeeded()
    await db.orders.clear()
  }

  async putMany(orders: Order[]): Promise<void> {
    await ensureDexieSeeded()
    await db.orders.clear()
    await db.orders.bulkPut(orders)
  }
}
