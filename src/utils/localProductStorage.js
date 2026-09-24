import { getProductById } from '../api/productApi'

const STORAGE_KEY = 'nexgensis_added_products'

export function getStoredProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to read products from localStorage:', err)
    return []
  }
}

export function saveStoredProduct(product) {
  try {
    const existing = getStoredProducts()

    let uniqueId = product.id
    const existingIds = new Set(existing.map((p) => String(p.id)))

    if (!uniqueId || existingIds.has(String(uniqueId))) {
      const maxId = existing.reduce((max, p) => {
        const num = Number(p.id)
        return !Number.isNaN(num) ? Math.max(max, num) : max
      }, 194)
      uniqueId = maxId + 1
    }

    const formattedProduct = {
      id: uniqueId,
      title: product.title || '',
      description: product.description || '',
      price: Number(product.price) || 0,
      category: product.category || 'general',
      stock: Number(product.stock) || 0,
      thumbnail: product.thumbnail || product.image || '',
      images:
        Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : product.thumbnail || product.image
            ? [product.thumbnail || product.image]
            : [],
      rating: Number(product.rating) || 5.0,
      reviews: Array.isArray(product.reviews) ? product.reviews : [],
      brand: product.brand || 'Custom',
      isLocal: true,
      createdAt: product.createdAt || new Date().toISOString(),
    }

    const updated = [formattedProduct, ...existing]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return formattedProduct
  } catch (err) {
    console.error('Failed to save product to localStorage:', err)
    throw err
  }
}

export function getStoredProductById(id) {
  const products = getStoredProducts()
  return products.find((p) => String(p.id) === String(id)) || null
}

export function filterLocalProducts(products, { search, category }) {
  let result = [...products]

  if (category) {
    const catLower = category.toLowerCase()
    result = result.filter(
      (p) => String(p.category || '').toLowerCase() === catLower,
    )
  }

  if (search) {
    const qLower = search.toLowerCase()
    result = result.filter(
      (p) =>
        String(p.title || '').toLowerCase().includes(qLower) ||
        String(p.description || '').toLowerCase().includes(qLower) ||
        String(p.category || '').toLowerCase().includes(qLower),
    )
  }

  return result
}

export async function getProductDetails(id, { signal } = {}) {
  const localProduct = getStoredProductById(id)
  if (localProduct) {
    return localProduct
  }

  const { data } = await getProductById(id, { signal })
  return data
}
