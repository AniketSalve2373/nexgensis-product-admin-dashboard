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

