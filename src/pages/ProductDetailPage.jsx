import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatPrice, formatRating, getProductImage } from '../components/products/productDisplay'
import { isRequestCanceled } from '../utils/loadProductList'
import { getProductDetails } from '../utils/localProductStorage'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadProduct() {
      setIsLoading(true)
      setIsNotFound(false)
      setError(null)
      setSelectedImage(null)

      try {
        const data = await getProductDetails(id, { signal: controller.signal })
        setProduct(data)
        const mainImg = getProductImage(data)
        setSelectedImage(mainImg)
      } catch (err) {
        if (isRequestCanceled(err)) {
          return
        }

        if (err.response?.status === 404 || err.status === 404) {
          setIsNotFound(true)
        } else {
          setError(err.message || 'Failed to fetch product details')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()

    return () => {
      controller.abort()
    }
  }, [id])

  if (isLoading) {
    return (
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-xl bg-slate-200" />
            <div className="space-y-4">
              <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-6 w-1/3 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-24 animate-pulse rounded-lg bg-slate-200" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (isNotFound) {
    return (
      <section className="mx-auto max-w-2xl text-center py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-8 w-8"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Product Not Found
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            The product you are looking for (ID: <code className="font-mono text-slate-800">{id}</code>) does not exist or may have been removed.
          </p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Products
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto max-w-2xl text-center py-12">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-8 w-8"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Failed to Load Product</h2>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/products"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Back to Products
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (!product) return null

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [getProductImage(product)]
  const displayImage = selectedImage || getProductImage(product)
  const reviews = Array.isArray(product.reviews) ? product.reviews : []
  const isInStock = product.stock > 0

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Products
        </Link>
        {product.isLocal ? (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
            Locally Added Product
          </span>
        ) : null}
      </div>

      {/* Main Details Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img
                src={displayImage}
                alt={product.title}
                className="h-full w-full object-contain p-4"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = 'https://via.placeholder.com/400?text=No+Image'
                }}
              />
            </div>

            {images.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {images.map((imgUrl, index) => (
                  <button
                    key={`${imgUrl}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border bg-slate-50 transition ${
                      selectedImage === imgUrl
                        ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-1'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = 'https://via.placeholder.com/80?text=No+Image'
                      }}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Right Column: Product Information */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
                  {product.category}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                    isInStock
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {isInStock ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {product.title}
              </h1>

              {/* Price & Rating Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-100 py-3">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {formatPrice(product.price)}
                  </p>
                  {product.discountPercentage ? (
                    <p className="mt-0.5 text-xs font-medium text-emerald-600">
                      {product.discountPercentage}% OFF
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 border border-amber-200 text-amber-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-amber-500"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-semibold">{formatRating(product.rating)}</span>
                  <span className="text-xs text-amber-600">/ 5.0</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Description
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {product.description || 'No description provided.'}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/60">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Product Overview
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="text-slate-500">Brand</dt>
                    <dd className="font-medium text-slate-900">{product.brand || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Category</dt>
                    <dd className="font-medium text-slate-900 capitalize">{product.category}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">SKU</dt>
                    <dd className="font-medium text-slate-900">{product.sku || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Stock Status</dt>
                    <dd className="font-medium text-slate-900">{product.stock} available</dd>
                  </div>
                  {product.warrantyInformation ? (
                    <div>
                      <dt className="text-slate-500">Warranty</dt>
                      <dd className="font-medium text-slate-900">{product.warrantyInformation}</dd>
                    </div>
                  ) : null}
                  {product.shippingInformation ? (
                    <div>
                      <dt className="text-slate-500">Shipping</dt>
                      <dd className="font-medium text-slate-900">{product.shippingInformation}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Customer Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No customer reviews yet for this product.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((rev, idx) => (
                <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-900">
                      {rev.reviewerName || 'Anonymous Reviewer'}
                    </span>
                    <span className="flex items-center text-xs font-semibold text-amber-600">
                      ★ {rev.rating}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">{rev.comment}</p>
                  {rev.date ? (
                    <p className="mt-2 text-[11px] text-slate-400">
                      {new Date(rev.date).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
