import { format } from 'date-fns'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import type { AppSettings, ExportRow, Order, PreferredExportFormat } from '../../domain/models'
import { mapOrderExportRows, buildFileName } from '../../data/repositories/repositoryUtils'
import { downloadBlob, shareFile } from '../../shared/utils/files'

function buildRows(order: Order): ExportRow[] {
  return mapOrderExportRows(order)
}

function createCsvBlob(rows: ExportRow[]): Blob {
  const header = [
    'category',
    'product name',
    'location',
    'unit',
    'current stock',
    'order quantity',
    'notes',
  ]

  const lines = rows.map((row) =>
    [
      row.category,
      row.productName,
      row.location,
      row.unit,
      row.currentStock,
      row.orderQty,
      row.notes,
    ]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(','),
  )

  return new Blob([[header.join(','), ...lines].join('\n')], {
    type: 'text/csv;charset=utf-8',
  })
}

function createXlsxBlob(order: Order, rows: ExportRow[]): Blob {
  const workbook = XLSX.utils.book_new()
  const rowsSheet = XLSX.utils.json_to_sheet(
    rows.map((row) => ({
      category: row.category,
      product_name: row.productName,
      location: row.location,
      unit: row.unit,
      current_stock: row.currentStock,
      order_quantity: row.orderQty,
      notes: row.notes,
    })),
  )

  const totalQty = rows.reduce((sum, row) => sum + row.orderQty, 0)
  const metadataSheet = XLSX.utils.json_to_sheet([
    { key: 'Order title', value: order.title },
    { key: 'Created date', value: order.createdAt },
    { key: 'Updated date', value: order.updatedAt },
    { key: 'Period', value: order.period },
    { key: 'Line items', value: rows.length },
    { key: 'Total quantity', value: totalQty },
  ])

  XLSX.utils.book_append_sheet(workbook, rowsSheet, 'Order Rows')
  XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata')

  const bytes = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

function createPdfBlob(order: Order, rows: ExportRow[]): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  doc.setFontSize(16)
  doc.text(order.title, 14, 16)

  doc.setFontSize(10)
  doc.text(`Date: ${format(new Date(order.updatedAt), 'yyyy-MM-dd')}`, 14, 23)

  let y = 30
  const grouped = new Map<string, ExportRow[]>()
  rows.forEach((row) => {
    const entries = grouped.get(row.category) ?? []
    entries.push(row)
    grouped.set(row.category, entries)
  })

  const ensurePageSpace = (requiredHeight: number) => {
    if (y + requiredHeight <= 280) return
    doc.addPage('a4')
    y = 16
  }

  grouped.forEach((categoryRows, category) => {
    ensurePageSpace(10)
    doc.setFontSize(12)
    doc.text(category, 14, y)
    y += 5

    doc.setFontSize(9)
    doc.text('Product', 14, y)
    doc.text('Loc', 85, y)
    doc.text('Unit', 117, y)
    doc.text('Stock', 136, y)
    doc.text('Qty', 156, y)
    doc.text('Notes', 173, y)
    y += 4

    categoryRows.forEach((row) => {
      ensurePageSpace(6)
      doc.text(row.productName.slice(0, 38), 14, y)
      doc.text(row.location.slice(0, 17), 85, y)
      doc.text(row.unit, 117, y)
      doc.text(String(row.currentStock), 136, y)
      doc.text(String(row.orderQty), 156, y)
      doc.text(row.notes.slice(0, 18), 173, y)
      y += 5
    })

    y += 3
  })

  const totalQty = rows.reduce((sum, row) => sum + row.orderQty, 0)
  ensurePageSpace(20)
  doc.setFontSize(10)
  doc.text(`Total lines: ${rows.length}`, 14, y)
  y += 6
  doc.text(`Total quantity: ${totalQty}`, 14, y)
  y += 10
  doc.text('Signature: ____________________', 14, y)

  return doc.output('blob')
}

function createBlob(order: Order, formatType: PreferredExportFormat): Blob {
  const rows = buildRows(order)
  if (formatType === 'csv') return createCsvBlob(rows)
  if (formatType === 'pdf') return createPdfBlob(order, rows)
  return createXlsxBlob(order, rows)
}

function extension(formatType: PreferredExportFormat): string {
  if (formatType === 'csv') return 'csv'
  if (formatType === 'pdf') return 'pdf'
  return 'xlsx'
}

export async function exportOrder(
  order: Order,
  settings: AppSettings,
  formatType: PreferredExportFormat,
  preferShare: boolean,
): Promise<{ shared: boolean; fileName: string }> {
  const fileName = `${buildFileName(settings.fileNamePattern, order.title, order.period)}.${extension(formatType)}`
  const blob = createBlob(order, formatType)

  if (preferShare) {
    const shared = await shareFile(blob, fileName, order.title)
    if (shared) {
      return { shared: true, fileName }
    }
  }

  downloadBlob(blob, fileName)
  return { shared: false, fileName }
}

export function buildOrderEmailSubject(order: Order): string {
  return `Order Request ${order.period} - ${order.title}`
}

export function buildOrderSummaryText(order: Order): string {
  const rows = buildRows(order)
  const totalQty = rows.reduce((sum, row) => sum + row.orderQty, 0)
  return [
    `Order: ${order.title}`,
    `Period: ${order.period}`,
    `Lines: ${rows.length}`,
    `Total quantity: ${totalQty}`,
  ].join('\n')
}

export function mapOrderRowsForExport(order: Order): ExportRow[] {
  return buildRows(order)
}
