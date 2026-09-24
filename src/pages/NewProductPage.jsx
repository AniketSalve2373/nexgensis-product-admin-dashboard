import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addProduct, getProductCategories } from '../api/productApi'
import { saveStoredProduct } from '../utils/localProductStorage'

export default function NewProductPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)

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

    async function loadCategories() {
      try {
        const response = await getProductCategories({ signal: controller.signal })
        const raw = Array.isArray(response.data) ? response.data : []
        const formatted = raw.map((item) => {
          if (typeof item === 'string') {
            return { slug: item, name: item.replace(/-/g, ' ') }
          }
          return { slug: item.slug || item.name, name: item.name || item.slug }
        })
        setCategories(formatted)
      } catch (err) {
        if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
          setCategories([])
        }
      } finally {
        setIsCategoriesLoading(false)
      }
    }

    loadCategories()

    return () => {
      controller.abort()
    }
  }, [])

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

    // Price validation: required, number, > 0
    if (!formData.price.toString().trim()) {
      newErrors.price = 'Price is required.'
    } else {
      const priceNum = Number(formData.price)
      if (Number.isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be a positive number greater than 0.'
      }
    }

    // Stock validation: required, integer, >= 0
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

    // Prevent duplicate POST requests
    if (isSubmitting) {
      return
    }

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        stock: Number(formData.stock),
        thumbnail:
          formData.thumbnail.trim() ||
          'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
      }

      // 1. Post to DummyJSON simulated endpoint
      const response = await addProduct(payload)

      // 2. Persist locally so it survives refresh & appears in the app
      const saved = saveStoredProduct({
        ...response.data,
        ...payload,
      })

      // 3. Navigate back to product list with success state
      navigate('/products', {
        state: {
          successMessage: `Product "${saved.title}" added successfully!`,
        },
      })
    } catch (err) {
      setSubmitError(err.message || 'Failed to add product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Add New Product</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create a new product entry for the catalog.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Cancel
        </Link>
      </div>

      {/* Form Container */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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
              <p className="font-semibold">Submission Error</p>
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
              placeholder="e.g. Wireless Noise-Canceling Headphones"
              className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
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
                className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm capitalize shadow-sm transition focus:outline-none focus:ring-2 ${
                  errors.category
                    ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              >
                <option value="">-- Select Category --</option>
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
                className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
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
                className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
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
              className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
                errors.thumbnail
                  ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.thumbnail ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.thumbnail}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Provide an HTTP/HTTPS image link or leave blank for default image.
              </p>
            )}
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
              placeholder="Detailed description of the product..."
              className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
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
            <Link
              to="/products"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                  Adding Product...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
