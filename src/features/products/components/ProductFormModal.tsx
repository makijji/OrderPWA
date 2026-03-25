import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CATEGORIES, LOCATIONS, SUPPLIERS, UNITS } from '../../../domain/constants'
import { productFormSchema, type ProductFormInput } from '../../../domain/schemas'
import type { Product } from '../../../domain/models'
import { useAppData } from '../../../app/data-context'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { Select } from '../../../shared/components/Select'

interface ProductFormModalProps {
  open: boolean
  product?: Product
  onClose: () => void
  onSaved: (product: Product) => void
}

const defaultValues: ProductFormInput = {
  name: '',
  category: CATEGORIES[0],
  unit: UNITS[0],
  location: LOCATIONS[0],
  minStock: 0,
  defaultOrderQty: 0,
  supplier: SUPPLIERS[0],
  sku: '',
  notes: '',
  isActive: true,
}

export function ProductFormModal({ open, product, onClose, onSaved }: ProductFormModalProps) {
  const data = useAppData()
  const [duplicateNames, setDuplicateNames] = useState<Product[]>([])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  })

  const watchedName = watch('name')

  useEffect(() => {
    if (!open) return

    if (product) {
      reset({
        name: product.name,
        category: product.category,
        unit: product.unit,
        location: product.location,
        minStock: product.minStock,
        defaultOrderQty: product.defaultOrderQty,
        supplier: product.supplier,
        sku: product.sku,
        notes: product.notes,
        isActive: product.isActive,
      })
    } else {
      reset(defaultValues)
    }
  }, [open, product, reset])

  useEffect(() => {
    if (!open || !watchedName?.trim()) {
      setDuplicateNames([])
      return
    }

    const timeout = window.setTimeout(() => {
      void data.products
        .potentialNameDuplicates(watchedName, product?.id)
        .then((duplicates) => setDuplicateNames(duplicates.slice(0, 4)))
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [data.products, open, product?.id, watchedName])

  const title = useMemo(() => (product ? 'Edit Product' : 'Add Product'), [product])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-3">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-4 shadow-xl dark:bg-slate-900">
        <h2 className="text-lg font-semibold">{title}</h2>

        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={handleSubmit(async (values) => {
            const saved = product
              ? await data.products.update(product.id, values)
              : await data.products.create(values)

            onSaved(saved)
            onClose()
          })}
        >
          <Input label="Name" error={errors.name?.message} {...register('name')} />

          <Select
            label="Category"
            options={CATEGORIES.map((value) => ({ value, label: value }))}
            error={errors.category?.message}
            {...register('category')}
          />

          <Select
            label="Unit"
            options={UNITS.map((value) => ({ value, label: value }))}
            error={errors.unit?.message}
            {...register('unit')}
          />

          <Select
            label="Location"
            options={LOCATIONS.map((value) => ({ value, label: value }))}
            error={errors.location?.message}
            {...register('location')}
          />

          <Input
            type="number"
            label="Minimum stock"
            error={errors.minStock?.message}
            {...register('minStock', { valueAsNumber: true })}
          />

          <Input
            type="number"
            label="Default order quantity"
            error={errors.defaultOrderQty?.message}
            {...register('defaultOrderQty', { valueAsNumber: true })}
          />

          <Select
            label="Supplier"
            options={SUPPLIERS.map((value) => ({ value, label: value }))}
            error={errors.supplier?.message}
            {...register('supplier')}
          />

          <Input label="SKU" error={errors.sku?.message} {...register('sku')} />

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">Notes</span>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              {...register('notes')}
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
            <input type="checkbox" className="h-4 w-4" {...register('isActive')} />
            Active product
          </label>

          {duplicateNames.length > 0 ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/70 dark:bg-amber-500/10 dark:text-amber-200 sm:col-span-2">
              Potential duplicates: {duplicateNames.map((item) => item.name).join(', ')}
            </div>
          ) : null}

          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {product ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
