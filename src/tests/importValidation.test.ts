import { describe, expect, it } from 'vitest'
import type { Product, ProductFilters, ProductSort } from '../domain/models'
import type { ProductRepository } from '../domain/repositories'
import { ImportRepositoryImpl } from '../data/repositories/importRepository'

class ProductRepositoryStub implements ProductRepository {
  products: Product[] = []

  async list(_filters?: ProductFilters, _sort?: ProductSort): Promise<Product[]> {
    return this.products
  }

  async getById(id: string): Promise<Product | undefined> {
    return this.products.find((item) => item.id === id)
  }

  async findBySkuOrName(sku: string, name: string): Promise<Product | undefined> {
    return this.products.find(
      (item) => item.sku.toLowerCase() === sku.toLowerCase() || item.name.toLowerCase() === name.toLowerCase(),
    )
  }

  async potentialNameDuplicates(): Promise<Product[]> {
    return []
  }

  async create(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const product: Product = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.products.push(product)
    return product
  }

  async update(id: string, input: Partial<Product>): Promise<Product> {
    const index = this.products.findIndex((item) => item.id === id)
    if (index < 0) {
      throw new Error('Product missing')
    }

    const next = {
      ...this.products[index],
      ...input,
      updatedAt: new Date().toISOString(),
    }
    this.products[index] = next
    return next
  }

  async duplicate(): Promise<Product> {
    throw new Error('Not needed in tests')
  }

  async archive(): Promise<Product> {
    throw new Error('Not needed in tests')
  }

  async reactivate(): Promise<Product> {
    throw new Error('Not needed in tests')
  }

  async bulkUpsert(): Promise<{ created: number; updated: number }> {
    return { created: 0, updated: 0 }
  }

  async deleteAll(): Promise<void> {
    this.products = []
  }

  async putMany(products: Product[]): Promise<void> {
    this.products = products
  }
}

describe('ImportRepository validation and execution', () => {
  it('parses preview and flags invalid rows', async () => {
    const repository = new ImportRepositoryImpl(new ProductRepositoryStub())

    const file = new File(
      [[
        'name,category,unit,location,minStock,defaultOrderQty,supplier,sku,notes,isActive',
        'Floor Cleaner,Cleaning Chemicals,bottle,Basement Storage,2,8,CleanCo,SKU-001,normal,true',
        ',Cleaning Chemicals,bottle,Basement Storage,2,8,CleanCo,SKU-002,missing-name,true',
      ].join('\n')],
      'products.csv',
      { type: 'text/csv' },
    )

    const preview = await repository.preview(file)

    expect(preview.validCount).toBe(1)
    expect(preview.invalidCount).toBe(1)
    expect(preview.rows[1].errors.length).toBeGreaterThan(0)
  })

  it('updates existing products in update-existing mode', async () => {
    const products = new ProductRepositoryStub()

    await products.create({
      name: 'Floor Cleaner',
      category: 'Cleaning Chemicals',
      unit: 'bottle',
      location: 'Basement Storage',
      minStock: 1,
      defaultOrderQty: 5,
      supplier: 'CleanCo',
      sku: 'SKU-777',
      notes: '',
      isActive: true,
    })

    const repository = new ImportRepositoryImpl(products)
    const file = new File(
      [[
        'name,category,unit,location,minStock,defaultOrderQty,supplier,sku,notes,isActive',
        'Floor Cleaner,Cleaning Chemicals,bottle,Basement Storage,3,10,CleanCo,SKU-777,updated,false',
      ].join('\n')],
      'products.csv',
      { type: 'text/csv' },
    )

    const preview = await repository.preview(file)
    const execution = await repository.execute('update-existing', preview)

    expect(execution.created).toBe(0)
    expect(execution.updated).toBe(1)

    const updated = await products.findBySkuOrName('SKU-777', 'Floor Cleaner')
    expect(updated?.defaultOrderQty).toBe(10)
    expect(updated?.isActive).toBe(false)
  })
})
