import type {
  AppSettings,
  DashboardSummary,
  ImportExecutionResult,
  ImportMode,
  ImportPreviewResult,
  Order,
  Product,
  ProductFilters,
  ProductSort,
} from './models'

export interface ProductRepository {
  list(filters?: ProductFilters, sort?: ProductSort): Promise<Product[]>
  getById(id: string): Promise<Product | undefined>
  findBySkuOrName(sku: string, name: string): Promise<Product | undefined>
  potentialNameDuplicates(name: string, ignoreId?: string): Promise<Product[]>
  create(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>
  update(id: string, input: Partial<Product>): Promise<Product>
  duplicate(id: string): Promise<Product>
  archive(id: string): Promise<Product>
  reactivate(id: string): Promise<Product>
  bulkUpsert(products: Product[]): Promise<{ created: number; updated: number }>
  deleteAll(): Promise<void>
  putMany(products: Product[]): Promise<void>
}

export interface OrderRepository {
  list(): Promise<Order[]>
  getById(id: string): Promise<Order | undefined>
  createDraft(title?: string): Promise<Order>
  save(order: Order): Promise<Order>
  duplicateAsDraft(id: string): Promise<Order>
  delete(id: string): Promise<void>
  getLastDraft(): Promise<Order | undefined>
  quickAddProducts(limit?: number): Promise<string[]>
  deleteAll(): Promise<void>
  putMany(orders: Order[]): Promise<void>
}

export interface SettingsRepository {
  get(): Promise<AppSettings>
  update(input: Partial<AppSettings>): Promise<AppSettings>
  save(settings: AppSettings): Promise<AppSettings>
}

export interface ImportRepository {
  preview(file: File): Promise<ImportPreviewResult>
  execute(mode: ImportMode, preview: ImportPreviewResult): Promise<ImportExecutionResult>
}

export interface DataContext {
  products: ProductRepository
  orders: OrderRepository
  settings: SettingsRepository
  imports: ImportRepository
  getSummary: () => Promise<DashboardSummary>
  backup: () => Promise<string>
  restore: (payload: string) => Promise<void>
}
