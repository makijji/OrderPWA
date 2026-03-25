import { useState } from 'react'
import { useAppData } from '../../app/data-context'
import { useFeedback } from '../../app/feedback-context'
import type { ImportMode, ImportPreviewResult } from '../../domain/models'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { LoadingState } from '../../shared/components/State'

export function ImportPage() {
  const data = useAppData()
  const { showToast } = useFeedback()

  const [mode, setMode] = useState<ImportMode>('add-new-only')
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleFile = async (file: File) => {
    setIsParsing(true)
    setFileName(file.name)
    try {
      const result = await data.imports.preview(file)
      setPreview(result)
      showToast('Import preview generated', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to parse import file', 'error')
      setPreview(null)
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Import Product Database</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Supported formats: CSV and JSON. Validate rows before applying updates.
        </p>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Select CSV or JSON file</span>
          <input
            type="file"
            accept=".csv,.json,application/json,text/csv"
            className="block w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                void handleFile(file)
              }
            }}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Import mode</span>
          <select
            className="min-h-11 w-full rounded-xl border border-slate-300 px-3 dark:border-slate-600 dark:bg-slate-800"
            value={mode}
            onChange={(event) => setMode(event.target.value as ImportMode)}
          >
            <option value="add-new-only">Add new only</option>
            <option value="update-existing">Update existing by SKU or name</option>
            <option value="skip-duplicates">Skip duplicates</option>
          </select>
        </label>

        {isParsing ? <LoadingState text="Reading import file" /> : null}
      </Card>

      {preview ? (
        <Card className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">Preview: {fileName}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Source: {preview.sourceType.toUpperCase()} · Valid rows: {preview.validCount} · Invalid rows:{' '}
                {preview.invalidCount}
              </p>
            </div>

            <Button
              disabled={isImporting || preview.validCount === 0}
              onClick={async () => {
                setIsImporting(true)
                const result = await data.imports.execute(mode, preview)
                setIsImporting(false)
                showToast(
                  `Import done: +${result.created} created, ${result.updated} updated, ${result.skipped} skipped`,
                  'success',
                )
              }}
            >
              {isImporting ? 'Importing...' : 'Import Valid Rows'}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-2 py-2">Line</th>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">SKU</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 200).map((row) => (
                  <tr key={row.line} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-2">{row.line}</td>
                    <td className="px-2 py-2">{String(row.raw.name ?? '')}</td>
                    <td className="px-2 py-2">{String(row.raw.category ?? '')}</td>
                    <td className="px-2 py-2">{String(row.raw.sku ?? '')}</td>
                    <td className="px-2 py-2">
                      {row.errors.length === 0 ? (
                        <span className="font-medium text-emerald-700 dark:text-emerald-300">Valid</span>
                      ) : (
                        <span className="font-medium text-rose-700 dark:text-rose-300">
                          {row.errors.join(', ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
