import { NavLink, Outlet } from 'react-router-dom'
import { OfflineBadge } from '../shared/components/OfflineBadge'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/orders/new', label: 'Order' },
  { to: '/products', label: 'Products' },
  { to: '/import', label: 'Import' },
  { to: '/orders/history', label: 'History' },
  { to: '/settings', label: 'Settings' },
]

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-3 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold sm:text-lg">OrderPWA</h1>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Private offline monthly replenishment planner
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-3 py-3 pb-28 sm:px-4">
        <OfflineBadge />
        <div className="mt-3">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-2 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:hidden">
        <ul className="grid grid-cols-3 gap-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex min-h-11 items-center justify-center rounded-lg px-1 text-xs font-medium ${
                    isActive
                      ? 'bg-cyan-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <nav className="hidden border-t border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900 sm:block">
        <ul className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium ${
                    isActive
                      ? 'bg-cyan-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
