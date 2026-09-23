import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Header from './Header'
import Sidebar from './Sidebar'

function getPageTitle(pathname) {
  if (pathname.startsWith('/products/new')) {
    return 'Add Product'
  }
  if (pathname.endsWith('/edit')) {
    return 'Edit Product'
  }
  if (pathname.startsWith('/products/') && pathname !== '/products') {
    return 'Product Details'
  }
  return 'Products'
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="hidden w-64 shrink-0 bg-slate-900 md:block">
        <Sidebar onLogout={handleLogout} />
      </aside>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative z-50 h-full w-64 bg-slate-900 shadow-xl">
            <Sidebar
              onLogout={handleLogout}
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header
          title={getPageTitle(pathname)}
          user={user}
          onLogout={handleLogout}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
