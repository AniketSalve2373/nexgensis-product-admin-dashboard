import { useState } from 'react'

function UserAvatar({ user }) {
  const [imageError, setImageError] = useState(false)

  const firstName = user?.firstName || 'Emily'
  const lastName = user?.lastName || 'Johnson'
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'EJ'

  const showImage = Boolean(
    user?.image && !imageError && !user.image.includes('dummyjson.com')
  )

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 shadow-2xs select-none">
      {showImage ? (
        <img
          src={user.image}
          alt={`${firstName} ${lastName}`}
          onError={() => setImageError(true)}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

export default function Header({ title, user, onLogout, onOpenMenu }) {
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username
    : 'Emily Johnson'

  const displayEmail = user?.email || 'emily.johnson@x.dummyjson.com'

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
        <div className="flex items-center gap-2.5">
          <UserAvatar user={user} />
          <div className="hidden sm:flex sm:flex-col justify-center text-left">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {displayName}
            </span>
            {displayEmail ? (
              <span className="text-xs text-slate-500 leading-tight">
                {displayEmail}
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

