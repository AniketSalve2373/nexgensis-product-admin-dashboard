import { NavLink } from 'react-router-dom'

export default function Sidebar({ onNavigate, onLogout, isCollapsed, onToggleCollapse }) {
  const linkClass = ({ isActive }) =>
    [
      'flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors',
      isCollapsed ? 'justify-center px-2' : 'px-3',
      isActive
        ? 'bg-indigo-600 text-white shadow-xs'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
    ].join(' ')

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100 select-none">
      {/* Brand Header */}
      <div
        className={`flex h-16 items-center border-b border-slate-800 ${
          isCollapsed ? 'justify-between px-2' : 'justify-between px-4'
        }`}
      >
        {!isCollapsed ? (
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Nexgensis
            </p>
            <p className="truncate text-base font-bold text-white">Product Admin</p>
          </div>
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-extrabold text-white">
            NX
          </div>
        )}

        {/* Desktop Collapse Toggle Button */}
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 md:flex"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            )}
          </button>
        ) : null}
      </div>

      {/* Navigation items */}
      <nav className="flex flex-1 flex-col gap-1.5 p-3" aria-label="Dashboard navigation">
        <NavLink
          to="/products"
          className={linkClass}
          onClick={onNavigate}
          end
          title={isCollapsed ? 'Products' : undefined}
          aria-label={isCollapsed ? 'Products' : undefined}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.75"
            stroke="currentColor"
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
          {!isCollapsed ? <span>Products</span> : null}
        </NavLink>

        <NavLink
          to="/products/new"
          className={linkClass}
          onClick={onNavigate}
          title={isCollapsed ? 'Add Product' : undefined}
          aria-label={isCollapsed ? 'Add Product' : undefined}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.75"
            stroke="currentColor"
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {!isCollapsed ? <span>Add Product</span> : null}
        </NavLink>
      </nav>

      {/* Logout Footer */}
      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={onLogout}
          title={isCollapsed ? 'Logout' : undefined}
          aria-label={isCollapsed ? 'Logout' : undefined}
          className={`flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
            isCollapsed ? 'justify-center px-2' : 'px-3'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.75"
            stroke="currentColor"
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25"
            />
          </svg>
          {!isCollapsed ? <span>Logout</span> : null}
        </button>
      </div>
    </div>
  )
}

