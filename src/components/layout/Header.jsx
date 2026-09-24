import { useState } from 'react'

export default function Header({ title, user, onLogout, onOpenMenu }) {
  const [imageError, setImageError] = useState(false)

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username
    : 'Emily Johnson'

  const userEmail = user?.email || 'emily.johnson@x.dummyjson.com'

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'EJ'

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:hidden"
          aria-label="Open navigation menu"
        >
          <span className="sr-only">Open menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="text-xs text-slate-500">{userEmail}</p>
        </div>

        {user?.image && !imageError ? (
          <img
            src={user.image}
            alt={displayName}
            onError={() => setImageError(true)}
            className="h-9 w-9 rounded-full border border-slate-200 bg-slate-100 object-cover shadow-xs"
          />
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-xs ring-2 ring-indigo-100"
            aria-label={displayName}
          >
            {initials}
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
