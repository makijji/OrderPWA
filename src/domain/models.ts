export type ProductCategory =
  | 'Books & Records'
  | 'Cleaning Accessories'
  | 'Cleaning Chemicals'
  | 'Electrical & Electronics'
  | 'Galley Supplies'
  | 'General Stores'
  | 'Maintenance Materials'
  | 'Office Supplies'
  | 'PPE'
  | 'Spare Parts'
  | 'Tools'
  | 'NN'

export type Unit =
  | 'book'
  | 'bottle'
  | 'box'
  | 'kit'
  | 'kg'
  | 'l'
  | 'pack'
  | 'pair'
  | 'pcs'
  | 'roll'
  | 'tube'
  | 'NN'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  unit: Unit
  location: string
  minStock: number
  defaultOrderQty: number
  supplier: string
  sku: string
  notes: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  search: string
  category: ProductCategory | 'all'
  location: string | 'all'
  supplier: string | 'all'
  status: 'all' | 'active' | 'inactive'
}

export type ProductSort = 'name' | 'category' | 'location'

export interface OrderItem {
  id: string
  productId: string
  snapshotName: string
  snapshotUnit: Unit
  snapshotCategory: ProductCategory
  snapshotLocation: string
  currentStock: number
  orderQty: number
  notes: string
  checked: boolean
}

export type OrderStatus = 'draft' | 'ready'

export interface Order {
  id: string
  title: string
  period: string
  status: OrderStatus
  items: OrderItem[]
  createdAt: string
  updatedAt: string
  exportedAt?: string
}

export type ImportMode = 'add-new-only' | 'update-existing' | 'skip-duplicates'

export interface ImportRow {
  name: string
  category: ProductCategory
  unit: Unit
  location: string
  minStock: number
  defaultOrderQty: number
  supplier: string
  sku: string
  notes: string
  isActive: boolean
}

export interface ImportPreviewRow {
  line: number
  raw: Record<string, unknown>
  parsed?: ImportRow
  errors: string[]
}

export interface ImportPreviewResult {
  sourceType: 'csv' | 'json'
  rows: ImportPreviewRow[]
  validCount: number
  invalidCount: number
}

export interface ImportExecutionResult {
  created: number
  updated: number
  skipped: number
  errors: string[]
}

export type PreferredExportFormat = 'xlsx' | 'csv' | 'pdf'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppSettings {
  id: 'app-settings'
  organizationLabel: string
  departmentLabel: string
  preferredExportFormat: PreferredExportFormat
  defaultEmailRecipient: string
  theme: ThemeMode
  fileNamePattern: string
  lastExportAt?: string
  updatedAt: string
}

export interface DashboardSummary {
  activeProducts: number
  belowMinStock: number
  lastExportAt?: string
  draftCount: number
}

export interface DatabaseBackup {
  version: 1
  exportedAt: string
  products: Product[]
  orders: Order[]
  settings: AppSettings
}

export interface ExportRow {
  category: string
  productName: string
  location: string
  unit: string
  currentStock: number
  orderQty: number
  notes: string
}
