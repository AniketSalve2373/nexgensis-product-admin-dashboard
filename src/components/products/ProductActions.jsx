import { Link } from 'react-router-dom'

export default function ProductActions({ productId }) {
  return (
    <div className="flex flex-wrap gap-2">
      {productId != null ? (
        <Link
          to={`/products/${productId}`}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          View
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-400"
        >
          View
        </button>
      )}
      <button
        type="button"
        disabled
        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-400"
      >
        Edit
      </button>
      <button
        type="button"
        disabled
        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-400"
      >
        Delete
      </button>
    </div>
  )
}
