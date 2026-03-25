import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './AppShell'
import { AppDataProvider } from './data-context'
import { FeedbackProvider } from './feedback-context'
import { PwaUpdatePrompt } from './PwaUpdatePrompt'
import { ThemeBootstrap } from './ThemeBootstrap'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { ProductsPage } from '../features/products/ProductsPage'
import { OrderEditorPage } from '../features/orders/OrderEditorPage'
import { OrderHistoryPage } from '../features/orders/OrderHistoryPage'
import { ImportPage } from '../features/import/ImportPage'
import { SettingsPage } from '../features/settings/SettingsPage'

function NotFoundPage() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/40">
      <h2 className="text-lg font-semibold">Page not found</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        The requested route does not exist.
      </p>
    </div>
  )
}

export default function App() {
  const Router = import.meta.env.VITE_ROUTER_MODE === 'hash' ? HashRouter : BrowserRouter
  const basename = import.meta.env.BASE_URL

  return (
    <AppDataProvider>
      <FeedbackProvider>
        <ThemeBootstrap />
        <Router basename={basename}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/orders/new" element={<OrderEditorPage />} />
              <Route path="/orders/:orderId" element={<OrderEditorPage />} />
              <Route path="/orders/history" element={<OrderHistoryPage />} />
              <Route path="/import" element={<ImportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          <PwaUpdatePrompt />
        </Router>
      </FeedbackProvider>
    </AppDataProvider>
  )
}
