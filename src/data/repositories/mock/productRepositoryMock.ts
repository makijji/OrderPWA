import { v4 as uuidv4 } from 'uuid'
import type { ProductRepository } from '../../../domain/repositories'
import type { Product, ProductFilters, ProductSort } from '../../../domain/models'
import { applyProductFilters, applyProductSort, normalize } from '../repositoryUtils'
import { loadStore, saveStore } from './mockStore'

export class ProductRepositoryMock implements ProductRepository {
  async list(filters?: ProductFilters, sort?: ProductSort): Promise<Product[]> {
    const store = loadStore()
    return applyProductSort(applyProductFilters(store.products, filters), sort)
  }

  async getById(id: string): Promise<Product | undefined> {
    const store = loadStore()
    return store.products.find((product) => product.id === id)
  }

  async findBySkuOrName(sku: string, name: string): Promise<Product | undefined> {
    const store = loadStore()
    const normalizedSku = normalize(sku)
    const normalizedName = normalize(name)

    return store.products.find((product) => {
      if (normalizedSku && normalize(product.sku) === normalizedSku) return true
      return normalize(product.name) === normalizedName
    })
  }

  async potentialNameDuplicates(name: string, ignoreId?: string): Promise<Product[]> {
    const query = normalize(name)
    if (!query) return []

    const store = loadStore()
    return store.products.filter(
      (product) => product.id !== ignoreId && normalize(product.name).includes(query),
    )
  }

  async create(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const now = new Date().toISOString()
    const product: Product = {
      ...input,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }

    const store = loadStore()
    store.products.unshift(product)
    saveStore(store)
    return product
  }

  async update(id: string, input: Partial<Product>): Promise<Product> {
    const store = loadStore()
    const index = store.products.findIndex((product) => product.id === id)
    if (index < 0) {
      throw new Error(`Product ${id} not found`)
    }

    const updated: Product = {
      ...store.products[index],
      ...input,
      id,
      updatedAt: new Date().toISOString(),
    }

    store.products[index] = updated
    saveStore(store)
    return updated
  }

  async duplicate(id: string): Promise<Product> {
    const current = await this.getById(id)
    if (!current) {
      throw new Error('Product not found for duplication')
    }

    return this.create({
      ...current,
      name: `${current.name} Copy`,
      sku: current.sku ? `${current.sku}-COPY` : '',
    })
  }

  async archive(id: string): Promise<Product> {
    return this.update(id, { isActive: false })
  }

  async reactivate(id: string): Promise<Product> {
    return this.update(id, { isActive: true })
  }

  async bulkUpsert(products: Product[]): Promise<{ created: number; updated: number }> {
    const store = loadStore()
    let created = 0
    let updated = 0

    for (const row of products) {
      const index = store.products.findIndex((product) => product.id === row.id)
      if (index === -1) {
        store.products.push(row)
        created += 1
      } else {
        store.products[index] = row
        updated += 1
      }
    }

    saveStore(store)
    return { created, updated }
  }

  async deleteAll(): Promise<void> {
    const store = loadStore()
    store.products = []
    saveStore(store)
  }

  async putMany(products: Product[]): Promise<void> {
    const store = loadStore()
    store.products = products
    saveStore(store)
  }
}
