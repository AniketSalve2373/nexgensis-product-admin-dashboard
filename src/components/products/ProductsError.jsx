export default function ProductsError({ onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-medium text-slate-900">Something went wrong.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Retry
      </button>
    </div>
  )
}
