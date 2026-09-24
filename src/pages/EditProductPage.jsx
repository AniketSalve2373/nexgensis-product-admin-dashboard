import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate as useRouterNavigate, useParams as useReactParams } from 'react-router-dom'
import { getProductCategories, updateProduct } from '../api/productApi'
import { isRequestCanceled } from '../utils/loadProductList'
import { getProductDetails, saveEditedProduct } from '../utils/localProductStorage'

export default function EditProductPage() {
  const { id } = useReactParams()
  const navigate = useRouterNavigate()

  const [categories, setCategories] = useState([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)

  const [isLoading, setIsLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)
  const [loadError, setLoadError] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    stock: '',
    thumbnail: '',
    description: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadData() {
      setIsLoading(true)
      setIsNotFound(false)
      setLoadError(null)

      try {
        // Load categories
        const catRes = await getProductCategories({ signal: controller.signal })
        const rawCats = Array.isArray(catRes.data) ? catRes.data : []
        const formattedCats = rawCats.map((item) => {
          if (typeof item === 'string') {
            return { slug: item, name: item.replace(/-/g, ' ') }
          }
          return { slug: item.slug || item.name, name: item.name || item.slug }
        })
        setCategories(formattedCats)
        setIsCategoriesLoading(false)

        // Load product details (checks local edits & added products first)
        const product = await getProductDetails(id, { signal: controller.signal })

        if (!product) {
          setIsNotFound(true)
          return
        }

        setFormData({
          title: product.title || '',
          category: product.category || '',
          price: product.price != null ? String(product.price) : '',
          stock: product.stock != null ? String(product.stock) : '',
          thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
          description: product.description || '',
        })
      } catch (err) {
        if (isRequestCanceled(err)) {
          return
        }

        if (err.response?.status === 404 || err.status === 404) {
          setIsNotFound(true)
        } else {
          setLoadError(err.message || 'Failed to load product details.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    return () => {
      controller.abort()
    }
  }, [id])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (submitError) {
      setSubmitError(null)
    }
  }

  function validate() {
    const newErrors = {}

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required.'
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category.'
    }

    // Price validation: required, positive number > 0
    if (!formData.price.toString().trim()) {
      newErrors.price = 'Price is required.'
    } else {
      const priceNum = Number(formData.price)
      if (Number.isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be a positive number greater than 0.'
      }
    }

    // Stock validation: required, integer >= 0
    if (!formData.stock.toString().trim()) {
      newErrors.stock = 'Stock is required.'
    } else {
      const stockNum = Number(formData.stock)
      if (Number.isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
        newErrors.stock = 'Stock must be a non-negative integer (0 or greater).'
      }
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.'
    }

    // Image URL optional validation
    if (formData.thumbnail.trim()) {
      const url = formData.thumbnail.trim().toLowerCase()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        newErrors.thumbnail = 'Image URL must start with http:// or https://'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Prevent duplicate submission
    if (isSubmitting) {
      return
    }

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category,
      stock: Number(formData.stock),
      thumbnail: formData.thumbnail.trim(),
    }

    try {
      // 1. Send PUT request to DummyJSON simulated endpoint
      await updateProduct(id, payload)

      // 2. Persist edited product in local storage so changes survive browser refresh
      saveEditedProduct(id, payload)

      // 3. Navigate back to products list with success message
      navigate('/products', {
        state: {
          successMessage: `Product "${payload.title}" updated successfully!`,
        },
      })
    } catch (err) {
      // If server simulated endpoint fails or returns error, save locally and notify gracefully
      try {
        saveEditedProduct(id, payload)
        navigate('/products', {
          state: {
            successMessage: `Product "${payload.title}" updated successfully!`,
          },
        })
      } catch {
        setSubmitError(err.message || 'Failed to update product. Please try again.')
        setIsSubmitting(false)
      }
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
          <div className="h-32 w-full animate-pulse rounded-lg bg-slate-200" />
        </div>
      </section>
    )
  }

  if (isNotFound) {
    return (
      <section className="mx-auto max-w-2xl text-center py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs sm:p-12">
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
            The product you are trying to edit (ID: <code className="font-mono text-slate-800">{id}</code>) does not exist or may have been deleted.
          </p>
          <div className="mt-6">
            <RouterLink
              to="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
            </RouterLink>
          </div>
        </div>
      </section>
    )
  }

  if (loadError) {
    return (
      <section className="mx-auto max-w-2xl text-center py-12">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 shadow-xs sm:p-12">
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
          <p className="mt-2 text-sm text-slate-600">{loadError}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <RouterLink
              to="/products"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              Back to Products
            </RouterLink>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Edit Product</h2>
          <p className="mt-1 text-sm text-slate-500">
            Update details for product ID: <code className="font-mono font-medium text-slate-700">#{id}</code>
          </p>
        </div>
        <RouterLink
          to="/products"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Cancel
        </RouterLink>
      </div>

      {/* Form Container */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        {submitError ? (
          <div className="mb-6 rounded-lg bg-rose-50 p-4 border border-rose-200 text-sm text-rose-700 flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-rose-500 shrink-0 mt-0.5"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold">Update Error</p>
              <p className="mt-0.5">{submitError}</p>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">
              Product Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Wireless Headphones"
              className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-xs transition focus:outline-hidden focus:ring-2 ${
                errors.title
                  ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.title ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.title}</p>
            ) : null}
          </div>

          {/* Category & Price & Stock Row */}
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isCategoriesLoading}
                className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm capitalize shadow-xs transition focus:outline-hidden focus:ring-2 ${
                  errors.category
                    ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              >
                <option value="">-- Select Category --</option>
                {formData.category && !categories.some((c) => c.slug === formData.category) ? (
                  <option value={formData.category}>{formData.category}</option>
                ) : null}
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category ? (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.category}</p>
              ) : null}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700">
                Price ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-xs transition focus:outline-hidden focus:ring-2 ${
                  errors.price
                    ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.price ? (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.price}</p>
              ) : null}
            </div>

            {/* Stock */}
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-slate-700">
                Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-xs transition focus:outline-hidden focus:ring-2 ${
                  errors.stock
                    ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.stock ? (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.stock}</p>
              ) : null}
            </div>
          </div>

          {/* Thumbnail Image URL */}
          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-slate-700">
              Image URL <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              id="thumbnail"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-xs transition focus:outline-hidden focus:ring-2 ${
                errors.thumbnail
                  ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.thumbnail ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.thumbnail}</p>
            ) : null}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Product description..."
              className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-xs transition focus:outline-hidden focus:ring-2 ${
                errors.description
                  ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.description ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.description}</p>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
            <RouterLink
              to="/products"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              Cancel
            </RouterLink>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
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
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
