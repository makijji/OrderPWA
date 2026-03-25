import type { AppSettings } from '../../../domain/models'
import type { SettingsRepository } from '../../../domain/repositories'
import { db } from '../../db/appDb'
import { ensureDexieSeeded } from '../../db/seedDexie'
import { createDefaultSettings } from '../../seed/mockData'

export class SettingsRepositoryIndexedDb implements SettingsRepository {
  async get(): Promise<AppSettings> {
    await ensureDexieSeeded()
    const settings = await db.settings.get('app-settings')
    if (!settings) {
      const fallback = createDefaultSettings()
      await db.settings.put(fallback)
      return fallback
    }
    return settings
  }

  async update(input: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.get()
    const next: AppSettings = {
      ...current,
      ...input,
      id: 'app-settings',
      updatedAt: new Date().toISOString(),
    }

    await db.settings.put(next)
    return next
  }

  async save(settings: AppSettings): Promise<AppSettings> {
    await ensureDexieSeeded()
    await db.settings.put(settings)
    return settings
  }
}
