import ProductCard from '../components/products/ProductCard'
import ProductPagination from '../components/products/ProductPagination'
import ProductsEmpty from '../components/products/ProductsEmpty'
import ProductsError from '../components/products/ProductsError'
import ProductsLoading from '../components/products/ProductsLoading'
import ProductTable from '../components/products/ProductTable'
import { useProductList } from '../hooks/useProductList'

export default function ProductsPage() {
  const {
    products,
    total,
    page,
    limit,
    isLoading,
    hasError,
    setPage,
    setLimit,
    retry,
  } = useProductList()

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Products</h2>
        <p className="mt-1 text-sm text-slate-500">Manage and review catalog products.</p>
      </div>

      {isLoading ? <ProductsLoading /> : null}

      {!isLoading && hasError ? <ProductsError onRetry={retry} /> : null}

      {!isLoading && !hasError && products.length === 0 ? <ProductsEmpty /> : null}

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

