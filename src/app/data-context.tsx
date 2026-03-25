import { createContext, useContext } from 'react'
import type { DataContext } from '../domain/repositories'
import { dataContext } from '../data/repositories/factory'

const AppDataContext = createContext<DataContext>(dataContext)

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  return <AppDataContext.Provider value={dataContext}>{children}</AppDataContext.Provider>
}

export function useAppData(): DataContext {
  return useContext(AppDataContext)
}
