import { getProductById } from '../api/productApi'

const ADDED_KEY = 'nexgensis_added_products'
const EDITED_KEY = 'nexgensis_edited_products'
const DELETED_KEY = 'nexgensis_deleted_products'

export function getStoredProducts() {
  try {
    const raw = localStorage.getItem(ADDED_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to read added products from localStorage:', err)
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
    localStorage.setItem(ADDED_KEY, JSON.stringify(updated))
    return formattedProduct
  } catch (err) {
    console.error('Failed to save product to localStorage:', err)
    throw err
  }
}

export function getEditedProducts() {
  try {
    const raw = localStorage.getItem(EDITED_KEY)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch (err) {
    console.error('Failed to read edited products from localStorage:', err)
    return {}
  }
}

export function saveEditedProduct(id, updatedFields) {
  try {
    const stringId = String(id)

    // 1. If it's a locally added product, update it in added products array
    const addedProducts = getStoredProducts()
    const addedIndex = addedProducts.findIndex((p) => String(p.id) === stringId)

    if (addedIndex !== -1) {
      const existingProduct = addedProducts[addedIndex]
      const updatedProduct = {
        ...existingProduct,
        ...updatedFields,
        price: Number(updatedFields.price ?? existingProduct.price),
        stock: Number(updatedFields.stock ?? existingProduct.stock),
        thumbnail: updatedFields.thumbnail || existingProduct.thumbnail,
        images: updatedFields.thumbnail
          ? [updatedFields.thumbnail]
          : existingProduct.images,
      }
      addedProducts[addedIndex] = updatedProduct
      localStorage.setItem(ADDED_KEY, JSON.stringify(addedProducts))
    }

    // 2. Always store in EDITED_KEY map for both API & local products
    const editedMap = getEditedProducts()
    const previousEdit = editedMap[stringId] || {}
    editedMap[stringId] = {
      ...previousEdit,
      ...updatedFields,
      price: Number(updatedFields.price ?? previousEdit.price ?? 0),
      stock: Number(updatedFields.stock ?? previousEdit.stock ?? 0),
      isEditedLocally: true,
    }

    localStorage.setItem(EDITED_KEY, JSON.stringify(editedMap))

    return editedMap[stringId]
  } catch (err) {
    console.error('Failed to save edited product to localStorage:', err)
    throw err
  }
}

export function getDeletedProductIds() {
  try {
    const raw = localStorage.getItem(DELETED_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch (err) {
    console.error('Failed to read deleted products from localStorage:', err)
    return []
  }
}

export function isProductDeleted(id) {
  if (id == null) return false
  const deleted = getDeletedProductIds()
  return deleted.includes(String(id))
}

export function deleteStoredProduct(id) {
  try {
    const stringId = String(id)

    // 1. Add to deleted IDs set
    const deleted = getDeletedProductIds()
    if (!deleted.includes(stringId)) {
      deleted.push(stringId)
      localStorage.setItem(DELETED_KEY, JSON.stringify(deleted))
    }

    // 2. Remove from added products array if present
    const added = getStoredProducts().filter((p) => String(p.id) !== stringId)
    localStorage.setItem(ADDED_KEY, JSON.stringify(added))

    // 3. Remove from edited products map if present
    const edited = getEditedProducts()
    if (edited[stringId]) {
      delete edited[stringId]
      localStorage.setItem(EDITED_KEY, JSON.stringify(edited))
    }
  } catch (err) {
    console.error('Failed to delete product from localStorage:', err)
    throw err
  }
}

export function applyLocalCrudToProduct(product) {
  if (!product || isProductDeleted(product.id)) {
    return null
  }

  const stringId = String(product.id)
  const editedMap = getEditedProducts()
  const edited = editedMap[stringId]

  if (!edited) {
    return product
  }

  return {
    ...product,
    ...edited,
    thumbnail: edited.thumbnail || product.thumbnail || product.images?.[0] || '',
    images: edited.thumbnail
      ? [edited.thumbnail]
      : Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [edited.thumbnail || product.thumbnail || ''],
  }
}

export function applyLocalCrudToList(products) {
  if (!Array.isArray(products)) {
    return []
  }

  return products
    .filter((p) => p && !isProductDeleted(p.id))
    .map((p) => applyLocalCrudToProduct(p))
}

export function getStoredProductById(id) {
  if (isProductDeleted(id)) {
    return null
  }
  const products = getStoredProducts()
  const localProduct = products.find((p) => String(p.id) === String(id))
  return localProduct ? applyLocalCrudToProduct(localProduct) : null
}

export function filterLocalProducts(products, { search, category }) {
  const crudProcessed = applyLocalCrudToList(products)
  let result = [...crudProcessed]

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
  if (isProductDeleted(id)) {
    const notFoundError = new Error('Product not found')
    notFoundError.status = 404
    notFoundError.response = { status: 404 }
    throw notFoundError
  }

  const localProduct = getStoredProductById(id)
  if (localProduct) {
    return localProduct
  }

  const { data } = await getProductById(id, { signal })
  const merged = applyLocalCrudToProduct(data)
  if (!merged) {
    const notFoundError = new Error('Product not found')
    notFoundError.status = 404
    notFoundError.response = { status: 404 }
    throw notFoundError
  }

  return merged
}
