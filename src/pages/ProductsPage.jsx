import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import ProductCard from '../components/products/ProductCard'
import ProductFilters from '../components/products/ProductFilters'
import ProductPagination from '../components/products/ProductPagination'
import ProductSearch from '../components/products/ProductSearch'
import ProductSort from '../components/products/ProductSort'
import ProductsEmpty from '../components/products/ProductsEmpty'
import ProductsError from '../components/products/ProductsError'
import ProductsLoading from '../components/products/ProductsLoading'
import ProductTable from '../components/products/ProductTable'
import { useProductList } from '../hooks/useProductList'

export default function ProductsPage() {
  const location = useLocation()
  const [dismissedMessage, setDismissedMessage] = useState(null)

  const successBanner =
    location.state?.successMessage && location.state.successMessage !== dismissedMessage
      ? location.state.successMessage
      : null

  const {
    products,
    total,
    categories,
    page,
    limit,
    search,
    category,
    sort,
    isLoading,
    hasError,
    setSearch,
    setCategory,
    setSort,
    setPage,
    setLimit,
    clearFilters,
    retry,
  } = useProductList()

  const hasActiveFilters = Boolean(search || category || sort)

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Products</h2>
        <p className="mt-1 text-sm text-slate-500">Manage and review catalog products.</p>
      </div>

      {successBanner ? (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-emerald-600 shrink-0"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l4-5.625z"
                clipRule="evenodd"
              />
            </svg>
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setDismissedMessage(location.state?.successMessage)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <ProductSearch value={search} onSearch={setSearch} />
        <ProductFilters categories={categories} value={category} onChange={setCategory} />
        <ProductSort value={sort} onChange={setSort} />
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {isLoading ? <ProductsLoading /> : null}

      {!isLoading && hasError ? <ProductsError onRetry={retry} /> : null}

      {!isLoading && !hasError && products.length === 0 ? (
        <ProductsEmpty
          hasActiveFilters={hasActiveFilters}
          actionLabel="Clear filters"
          onClear={clearFilters}
        />
      ) : null}

      {!isLoading && !hasError && products.length > 0 ? (
        <>
          <div className="hidden lg:block">
            <ProductTable products={products} />
          </div>
          <div className="grid gap-4 lg:hidden">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <ProductPagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </>
      ) : null}
    </section>
  )
}
