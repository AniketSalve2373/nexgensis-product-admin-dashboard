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
  const [isCollapsed, setIsCollapsed] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden shrink-0 bg-slate-900 transition-all duration-300 ease-in-out md:block ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <Sidebar
          onLogout={handleLogout}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        />
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative z-50 h-full w-64 bg-slate-900 shadow-2xl">
            <Sidebar
              onLogout={handleLogout}
              onNavigate={() => setIsMobileMenuOpen(false)}
              isCollapsed={false}
            />
          </aside>
        </div>
      ) : null}

      {/* Main Content Viewport */}
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
