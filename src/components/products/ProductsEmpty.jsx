export default function ProductsEmpty({ hasActiveFilters, actionLabel, onClear }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-medium text-slate-900">No products found.</p>
      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
