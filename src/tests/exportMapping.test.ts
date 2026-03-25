import { describe, expect, it } from 'vitest'
import type { Order } from '../domain/models'
import { mapOrderRowsForExport } from '../features/export/exportService'

describe('mapOrderRowsForExport', () => {
  it('maps order items and skips zero quantities', () => {
    const order: Order = {
      id: 'o1',
      title: 'Monthly order',
      period: '2026-03',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: 'i1',
          productId: 'p1',
          snapshotName: 'Degreaser 001',
          snapshotUnit: 'bottle',
          snapshotCategory: 'Cleaning Chemicals',
          snapshotLocation: 'Basement Storage',
          currentStock: 1,
          orderQty: 4,
          notes: 'priority',
          checked: true,
        },
        {
          id: 'i2',
          productId: 'p2',
          snapshotName: 'Wrench Kit',
          snapshotUnit: 'pcs',
          snapshotCategory: 'Maintenance Materials',
          snapshotLocation: 'Workshop Shelf A',
          currentStock: 2,
          orderQty: 0,
          notes: '',
          checked: false,
        },
      ],
    }

    const rows = mapOrderRowsForExport(order)

    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({
      category: 'Cleaning Chemicals',
      productName: 'Degreaser 001',
      location: 'Basement Storage',
      unit: 'bottle',
      currentStock: 1,
      orderQty: 4,
      notes: 'priority',
    })
  })
})
