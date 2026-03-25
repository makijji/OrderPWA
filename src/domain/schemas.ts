import { z } from 'zod'
import { CATEGORIES, UNITS } from './constants'

const nonEmptyText = z.string().trim().min(1, 'Required')
const categorySchema = z.enum(CATEGORIES)
const unitSchema = z.enum(UNITS)

export const productFormSchema = z.object({
  name: nonEmptyText,
  category: categorySchema,
  unit: unitSchema,
  location: nonEmptyText,
  minStock: z.number().min(0, 'Must be >= 0'),
  defaultOrderQty: z.number().min(0, 'Must be >= 0'),
  supplier: z.string().trim(),
  sku: z.string().trim(),
  notes: z.string().trim(),
  isActive: z.boolean(),
})

export const orderItemSchema = z.object({
  currentStock: z.coerce.number().min(0),
  orderQty: z.coerce.number().min(0),
  notes: z.string().default(''),
  checked: z.boolean(),
})

export const settingsSchema = z.object({
  organizationLabel: nonEmptyText,
  departmentLabel: nonEmptyText,
  preferredExportFormat: z.enum(['xlsx', 'csv', 'pdf']),
  defaultEmailRecipient: z.string().email('Invalid email').or(z.literal('')),
  theme: z.enum(['light', 'dark', 'system']),
  fileNamePattern: nonEmptyText,
})

export const importRowSchema = z.object({
  name: nonEmptyText,
  category: categorySchema,
  unit: unitSchema,
  location: nonEmptyText,
  minStock: z.number().min(0),
  defaultOrderQty: z.number().min(0),
  supplier: z.string().trim(),
  sku: z.string().trim(),
  notes: z.string().trim(),
  isActive: z.boolean(),
})

export type ProductFormInput = z.infer<typeof productFormSchema>
export type SettingsFormInput = z.infer<typeof settingsSchema>
