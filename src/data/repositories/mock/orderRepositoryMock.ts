import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import type { Order, OrderItem } from '../../../domain/models'
import type { OrderRepository } from '../../../domain/repositories'
import { loadStore, saveStore } from './mockStore'

function cloneItems(items: OrderItem[]): OrderItem[] {
  return items.map((item) => ({ ...item }))
}

export class OrderRepositoryMock implements OrderRepository {
  async list(): Promise<Order[]> {
    const store = loadStore()
    return [...store.orders].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async getById(id: string): Promise<Order | undefined> {
    const store = loadStore()
    return store.orders.find((order) => order.id === id)
  }

  async createDraft(title = ''): Promise<Order> {
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

    const store = loadStore()
    store.orders.unshift(order)
    saveStore(store)
    return order
  }

  async save(order: Order): Promise<Order> {
    const store = loadStore()
    const index = store.orders.findIndex((entry) => entry.id === order.id)

    const updatedOrder: Order = {
      ...order,
      updatedAt: new Date().toISOString(),
    }

    if (index === -1) {
      store.orders.unshift(updatedOrder)
    } else {
      store.orders[index] = updatedOrder
    }

    saveStore(store)
    return updatedOrder
  }

  async duplicateAsDraft(id: string): Promise<Order> {
    const source = await this.getById(id)
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

    const store = loadStore()
    store.orders.unshift(draft)
    saveStore(store)
    return draft
  }

  async delete(id: string): Promise<void> {
    const store = loadStore()
    store.orders = store.orders.filter((order) => order.id !== id)
    saveStore(store)
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
    const store = loadStore()
    store.orders = []
    saveStore(store)
  }

  async putMany(orders: Order[]): Promise<void> {
    const store = loadStore()
    store.orders = orders
    saveStore(store)
  }
}
