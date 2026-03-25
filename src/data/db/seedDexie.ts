import { db } from './appDb'
import { createDefaultSettings, createSeedOrders, createSeedProducts } from '../seed/mockData'

let seeded = false
let seedPromise: Promise<void> | null = null

function dedupeKey(name: string, sku: string): string {
  return `${name.trim().toLowerCase()}|${sku.trim().toLowerCase()}`
}

async function repairDuplicateProducts(): Promise<void> {
  const allProducts = await db.products.toArray()
  const keeperByKey = new Map<string, string>()
  const replaceProductId = new Map<string, string>()

  for (const product of allProducts) {
    const key = dedupeKey(product.name, product.sku)
    const keeperId = keeperByKey.get(key)
    if (!keeperId) {
      keeperByKey.set(key, product.id)
      continue
    }
    replaceProductId.set(product.id, keeperId)
  }

  if (replaceProductId.size === 0) {
    return
  }

  await db.transaction('rw', db.products, db.orders, async () => {
    await db.products.bulkDelete([...replaceProductId.keys()])

    const orders = await db.orders.toArray()
    const updatedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        const productId = replaceProductId.get(item.productId)
        return productId ? { ...item, productId } : item
      }),
    }))

    await db.orders.bulkPut(updatedOrders)
  })
}

export async function ensureDexieSeeded(): Promise<void> {
  if (seeded) {
    return
  }

  if (!seedPromise) {
    seedPromise = (async () => {
      const productCount = await db.products.count()

      if (productCount === 0) {
        const products = createSeedProducts()
        await db.products.bulkPut(products)
        await db.orders.bulkPut(createSeedOrders(products))
        await db.settings.put(createDefaultSettings())
      }

      await repairDuplicateProducts()
      seeded = true
    })().finally(() => {
      seedPromise = null
    })
  }

  await seedPromise
}
