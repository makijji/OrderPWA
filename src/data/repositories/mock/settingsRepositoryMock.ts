import type { AppSettings } from '../../../domain/models'
import type { SettingsRepository } from '../../../domain/repositories'
import { createDefaultSettings } from '../../seed/mockData'
import { loadStore, saveStore } from './mockStore'

export class SettingsRepositoryMock implements SettingsRepository {
  async get(): Promise<AppSettings> {
    const store = loadStore()
    if (!store.settings) {
      store.settings = createDefaultSettings()
      saveStore(store)
    }
    return store.settings
  }

  async update(input: Partial<AppSettings>): Promise<AppSettings> {
    const store = loadStore()
    store.settings = {
      ...store.settings,
      ...input,
      id: 'app-settings',
      updatedAt: new Date().toISOString(),
    }
    saveStore(store)
    return store.settings
  }

  async save(settings: AppSettings): Promise<AppSettings> {
    const store = loadStore()
    store.settings = settings
    saveStore(store)
    return settings
  }
}
