import { Link } from 'react-router-dom'

export default function ProductActions({ product, onDelete }) {
  const productId = product?.id != null ? product.id : product

  return (
    <div className="flex flex-wrap items-center gap-2">
      {productId != null ? (
        <Link
          to={`/products/${productId}`}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          aria-label={`View details for product ${productId}`}
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

      {productId != null ? (
        <Link
          to={`/products/${productId}/edit`}
          className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 shadow-xs hover:bg-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          aria-label={`Edit product ${productId}`}
        >
          Edit
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-400"
        >
          Edit
        </button>
      )}

      {productId != null && onDelete ? (
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 shadow-xs hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
          aria-label={`Delete product ${productId}`}
        >
          Delete
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-400"
        >
          Delete
        </button>
      )}
    </div>
  )
}
