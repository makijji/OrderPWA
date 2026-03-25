import type { OrderItem } from '../../../domain/models'

interface OrderItemRowProps {
  item: OrderItem
  onChange: (item: OrderItem) => void
  onRemove: () => void
}

export function OrderItemRow({ item, onChange, onRemove }: OrderItemRowProps) {
  return (
    <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-[1.7fr_0.75fr_0.75fr_1fr_auto]">
      <div>
        <p className="text-sm font-semibold">{item.snapshotName}</p>
        <p className="text-xs text-slate-500">
          {item.snapshotLocation} · {item.snapshotUnit}
        </p>
      </div>

      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
        Current
        <input
          type="number"
          min={0}
          value={item.currentStock}
          onChange={(event) =>
            onChange({
              ...item,
              currentStock: Number(event.target.value),
            })
          }
          className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-2 dark:border-slate-600 dark:bg-slate-800"
        />
      </label>

      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
        Order qty
        <input
          type="number"
          min={0}
          value={item.orderQty}
          onChange={(event) =>
            onChange({
              ...item,
              orderQty: Number(event.target.value),
            })
          }
          className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-2 dark:border-slate-600 dark:bg-slate-800"
        />
      </label>

      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
        Notes
        <input
          value={item.notes}
          onChange={(event) => onChange({ ...item, notes: event.target.value })}
          className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-2 dark:border-slate-600 dark:bg-slate-800"
        />
      </label>

      <div className="flex flex-col items-end justify-between gap-2">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(event) => onChange({ ...item, checked: event.target.checked })}
          />
          Checked
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-200"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
