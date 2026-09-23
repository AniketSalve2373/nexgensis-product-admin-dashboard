import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  [
    'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-200 hover:bg-slate-800 hover:text-white',
  ].join(' ')

export default function Sidebar({ onNavigate, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-800 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
          Nexgensis
        </p>
        <p className="mt-1 text-lg font-semibold text-white">Product Admin</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Dashboard">
        <NavLink to="/products" className={linkClass} onClick={onNavigate} end>
          Products
        </NavLink>
        <NavLink to="/products/new" className={linkClass} onClick={onNavigate}>
          Add Product
        </NavLink>
      </nav>

      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
