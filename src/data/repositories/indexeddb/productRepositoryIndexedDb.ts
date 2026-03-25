import { v4 as uuidv4 } from 'uuid'
import type { Product, ProductFilters, ProductSort } from '../../../domain/models'
import type { ProductRepository } from '../../../domain/repositories'
import { db } from '../../db/appDb'
import { ensureDexieSeeded } from '../../db/seedDexie'
import { applyProductFilters, applyProductSort, normalize } from '../repositoryUtils'

export class ProductRepositoryIndexedDb implements ProductRepository {
  async list(filters?: ProductFilters, sort?: ProductSort): Promise<Product[]> {
    await ensureDexieSeeded()
    const allProducts = await db.products.toArray()
    return applyProductSort(applyProductFilters(allProducts, filters), sort)
  }

  async getById(id: string): Promise<Product | undefined> {
    await ensureDexieSeeded()
    return db.products.get(id)
  }

  async findBySkuOrName(sku: string, name: string): Promise<Product | undefined> {
    await ensureDexieSeeded()
    const allProducts = await db.products.toArray()
    const normalizedSku = normalize(sku)
    const normalizedName = normalize(name)
    return allProducts.find((product) => {
      if (normalizedSku && normalize(product.sku) === normalizedSku) return true
      return normalize(product.name) === normalizedName
    })
  }

  async potentialNameDuplicates(name: string, ignoreId?: string): Promise<Product[]> {
    await ensureDexieSeeded()
    const query = normalize(name)
    if (!query) return []

    const allProducts = await db.products.toArray()
    return allProducts.filter(
      (product) => product.id !== ignoreId && normalize(product.name).includes(query),
    )
  }

  async create(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    await ensureDexieSeeded()
    const now = new Date().toISOString()
    const product: Product = {
      ...input,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }
    await db.products.add(product)
    return product
  }

  async update(id: string, input: Partial<Product>): Promise<Product> {
    await ensureDexieSeeded()
    const current = await db.products.get(id)
    if (!current) {
      throw new Error(`Product ${id} not found`)
    }

    const next: Product = {
      ...current,
      ...input,
      id,
      updatedAt: new Date().toISOString(),
    }

    await db.products.put(next)
    return next
  }

  async duplicate(id: string): Promise<Product> {
    const source = await this.getById(id)
    if (!source) {
      throw new Error('Product not found for duplication')
    }

    return this.create({
      ...source,
      name: `${source.name} Copy`,
      sku: source.sku ? `${source.sku}-COPY` : '',
    })
  }

  async archive(id: string): Promise<Product> {
    return this.update(id, { isActive: false })
  }

  async reactivate(id: string): Promise<Product> {
    return this.update(id, { isActive: true })
  }

  async bulkUpsert(products: Product[]): Promise<{ created: number; updated: number }> {
    await ensureDexieSeeded()
    let created = 0
    let updated = 0

    for (const row of products) {
      const existing = await db.products.get(row.id)
      if (existing) {
        updated += 1
      } else {
        created += 1
      }
      await db.products.put(row)
    }

    return { created, updated }
  }

  async deleteAll(): Promise<void> {
    await ensureDexieSeeded()
    await db.products.clear()
  }

  async putMany(products: Product[]): Promise<void> {
    await ensureDexieSeeded()
    await db.products.clear()
    await db.products.bulkPut(products)
  }
}
