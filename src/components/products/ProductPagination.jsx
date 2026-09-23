import {
  ALLOWED_LIMITS,
  getPageRange,
  getTotalPages,
  getVisiblePageNumbers,
} from '../../utils/productListParams'

export default function ProductPagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}) {
  const totalPages = getTotalPages(total, limit)
  const { from, to } = getPageRange(page, limit, total)
  const pageNumbers = getVisiblePageNumbers(page, totalPages)
  const isFirstPage = page <= 1
  const isLastPage = page >= totalPages

  return (
    <div className="mt-4 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Showing <span className="font-medium text-slate-900">{from}–{to}</span> of{' '}
        <span className="font-medium text-slate-900">{total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Page size
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {ALLOWED_LIMITS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <nav className="flex flex-wrap items-center gap-1" aria-label="Product pagination">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={isFirstPage}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white"
          >
            Previous
          </button>

          {pageNumbers.map((pageNumber) => {
            const isCurrent = pageNumber === page

            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                aria-current={isCurrent ? 'page' : undefined}
                className={
                  isCurrent
                    ? 'rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white'
                    : 'rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50'
                }
              >
                {pageNumber}
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={isLastPage}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  )
}
