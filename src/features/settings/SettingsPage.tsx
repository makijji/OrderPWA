import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useAppData } from '../../app/data-context'
import { useFeedback } from '../../app/feedback-context'
import { activeProvider } from '../../data/repositories/factory'
import { settingsSchema, type SettingsFormInput } from '../../domain/schemas'
import { downloadBlob } from '../../shared/utils/files'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { Input } from '../../shared/components/Input'
import { Select } from '../../shared/components/Select'
import { LoadingState } from '../../shared/components/State'
import { useTheme } from '../../shared/hooks/useTheme'

export function SettingsPage() {
  const data = useAppData()
  const { showToast } = useFeedback()
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      organizationLabel: '',
      departmentLabel: '',
      preferredExportFormat: 'xlsx',
      defaultEmailRecipient: '',
      theme: 'system',
      fileNamePattern: '{period}_{title}',
    },
  })

  const watchedTheme = watch('theme')
  useTheme(watchedTheme)

  useEffect(() => {
    void (async () => {
      const settings = await data.settings.get()
      reset(settings)
      setLoading(false)
    })()
  }, [data.settings, reset])

  if (loading) {
    return <LoadingState text="Loading settings" />
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Data provider: <strong>{activeProvider}</strong>
        </p>
      </Card>

      <Card>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={handleSubmit(async (values) => {
            await data.settings.update(values)
            showToast('Settings saved', 'success')
          })}
        >
          <Input
            label="Organization / Company label"
            error={errors.organizationLabel?.message}
            {...register('organizationLabel')}
          />

          <Input
            label="Department / Storage label"
            error={errors.departmentLabel?.message}
            {...register('departmentLabel')}
          />

          <Select
            label="Preferred export format"
            options={[
              { value: 'xlsx', label: 'XLSX' },
              { value: 'csv', label: 'CSV' },
              { value: 'pdf', label: 'PDF' },
            ]}
            error={errors.preferredExportFormat?.message}
            {...register('preferredExportFormat')}
          />

          <Input
            label="Default email recipient"
            error={errors.defaultEmailRecipient?.message}
            placeholder="teammate@example.com"
            {...register('defaultEmailRecipient')}
          />

          <Select
            label="Theme"
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
            error={errors.theme?.message}
            {...register('theme')}
          />

          <Input
            label="File naming pattern"
            error={errors.fileNamePattern?.message}
            placeholder="{period}_{title}_{date}"
            {...register('fileNamePattern')}
          />

          <div className="sm:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              Save Settings
            </Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-base font-semibold">Backup and Restore</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Backup includes products, orders, and settings as JSON.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              const json = await data.backup()
              const fileName = `orderpwa_backup_${new Date().toISOString().slice(0, 10)}.json`
              downloadBlob(new Blob([json], { type: 'application/json' }), fileName)
              showToast('Backup downloaded', 'success')
            }}
          >
            Download Backup JSON
          </Button>

          <label className="inline-flex cursor-pointer items-center rounded-xl bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-800">
            Restore Backup
            <input
              type="file"
              className="hidden"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                void (async () => {
                  try {
                    await data.restore(await file.text())
                    showToast('Backup restored', 'success')
                  } catch (error) {
                    showToast(
                      error instanceof Error ? error.message : 'Restore failed',
                      'error',
                    )
                  }
                })()
              }}
            />
          </label>
        </div>
      </Card>
    </div>
  )
}
