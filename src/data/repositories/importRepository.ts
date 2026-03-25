import Papa from 'papaparse'
import { z } from 'zod'
import { importRowSchema } from '../../domain/schemas'
import type {
  ImportExecutionResult,
  ImportMode,
  ImportPreviewResult,
  ImportRow,
} from '../../domain/models'
import type { ImportRepository, ProductRepository } from '../../domain/repositories'
import { parseBoolean, parseNumber } from './repositoryUtils'

const REQUIRED_HEADERS = [
  'name',
  'category',
  'unit',
  'location',
  'minStock',
  'defaultOrderQty',
  'supplier',
  'sku',
  'notes',
  'isActive',
]

function normalizeInputRow(raw: Record<string, unknown>): ImportRow {
  return {
    name: String(raw.name ?? '').trim(),
    category: String(raw.category ?? '').trim() as ImportRow['category'],
    unit: String(raw.unit ?? '').trim() as ImportRow['unit'],
    location: String(raw.location ?? '').trim(),
    minStock: parseNumber(raw.minStock, 0),
    defaultOrderQty: parseNumber(raw.defaultOrderQty, 0),
    supplier: String(raw.supplier ?? '').trim(),
    sku: String(raw.sku ?? '').trim(),
    notes: String(raw.notes ?? '').trim(),
    isActive: parseBoolean(raw.isActive),
  }
}

function schemaErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => issue.message)
}

export class ImportRepositoryImpl implements ImportRepository {
  private readonly products: ProductRepository

  constructor(products: ProductRepository) {
    this.products = products
  }

  async preview(file: File): Promise<ImportPreviewResult> {
    const lowerName = file.name.toLowerCase()
    const sourceType = lowerName.endsWith('.json') ? 'json' : 'csv'
    const text = await file.text()

    const rows =
      sourceType === 'json' ? this.parseJsonRows(text) : this.parseCsvRows(text)

    let validCount = 0
    const parsedRows = rows.map((raw, idx) => {
      const normalized = normalizeInputRow(raw)
      const parsed = importRowSchema.safeParse(normalized)
      const errors = parsed.success ? [] : schemaErrors(parsed.error)

      if (parsed.success) {
        validCount += 1
      }

      return {
        line: idx + 1,
        raw,
        parsed: parsed.success ? parsed.data : undefined,
        errors,
      }
    })

    return {
      sourceType,
      rows: parsedRows,
      validCount,
      invalidCount: parsedRows.length - validCount,
    }
  }

  async execute(mode: ImportMode, preview: ImportPreviewResult): Promise<ImportExecutionResult> {
    const result: ImportExecutionResult = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    }

    const seen = new Set<string>()

    for (const row of preview.rows) {
      if (!row.parsed) {
        result.skipped += 1
        continue
      }

      const dedupeKey = `${row.parsed.sku.toLowerCase()}|${row.parsed.name.toLowerCase()}`
      if (mode === 'skip-duplicates' && seen.has(dedupeKey)) {
        result.skipped += 1
        continue
      }
      seen.add(dedupeKey)

      try {
        const existing = await this.products.findBySkuOrName(row.parsed.sku, row.parsed.name)

        if (mode === 'add-new-only') {
          if (existing) {
            result.skipped += 1
            continue
          }
          await this.products.create(row.parsed)
          result.created += 1
          continue
        }

        if (mode === 'skip-duplicates') {
          if (existing) {
            result.skipped += 1
            continue
          }
          await this.products.create(row.parsed)
          result.created += 1
          continue
        }

        if (existing) {
          await this.products.update(existing.id, row.parsed)
          result.updated += 1
        } else {
          await this.products.create(row.parsed)
          result.created += 1
        }
      } catch (error) {
        result.errors.push(
          `Row ${row.line}: ${error instanceof Error ? error.message : 'Unknown import error'}`,
        )
      }
    }

    return result
  }

  private parseCsvRows(text: string): Record<string, unknown>[] {
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    })

    const headers = parsed.meta.fields ?? []
    const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header))
    if (missingHeaders.length > 0) {
      throw new Error(`Missing CSV headers: ${missingHeaders.join(', ')}`)
    }

    return parsed.data
  }

  private parseJsonRows(text: string): Record<string, unknown>[] {
    const parsed = JSON.parse(text) as unknown
    if (!Array.isArray(parsed)) {
      throw new Error('JSON import expects an array of product objects')
    }

    return parsed.map((item) => {
      if (typeof item !== 'object' || item === null) {
        throw new Error('JSON import contains non-object row')
      }
      return item as Record<string, unknown>
    })
  }
}
