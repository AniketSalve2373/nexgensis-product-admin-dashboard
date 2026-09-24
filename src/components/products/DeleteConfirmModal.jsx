import { useState } from 'react'
import { deleteProduct } from '../../api/productApi'
import { deleteStoredProduct } from '../../utils/localProductStorage'

export default function DeleteConfirmModal({ product, onClose, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  if (!product) return null

  async function handleDelete() {
    if (isDeleting) return

    setIsDeleting(true)
    setError(null)

    try {
      // 1. Call DummyJSON simulated API delete
      await deleteProduct(product.id)

      // 2. Remove locally so it persists across refreshes
      deleteStoredProduct(product.id)

      // 3. Notify parent to refresh list & show success message
      onSuccess(`Product "${product.title}" has been deleted.`)
    } catch (err) {
      // Even if API fails (e.g., local mock ID), ensure local deletion happens gracefully
      try {
        deleteStoredProduct(product.id)
        onSuccess(`Product "${product.title}" has been deleted.`)
      } catch {
        setError(err.message || 'Failed to delete product. Please try again.')
        setIsDeleting(false)
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </div>
          <div>
            <h3 id="delete-modal-title" className="text-lg font-semibold text-slate-900">
              Delete Product
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-800">"{product.title}"</span>? This action cannot be undone.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
