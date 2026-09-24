import { getProducts, getProductsByCategory, searchProducts } from '../api/productApi'
import {
  applyLocalCrudToList,
  filterLocalProducts,
  getStoredProducts,
} from './localProductStorage'
import { getSkip } from './productListParams'
import { getSortQuery, sortProducts } from './productSort'

async function fetchAllApiProducts({ search, category, delay, signal }) {
  let products
  if (search) {
    const { data } = await searchProducts({ q: search, limit: 0, delay, signal })
    products = Array.isArray(data?.products) ? data.products : []
  } else if (category) {
    const { data } = await getProductsByCategory({ category, limit: 0, delay, signal })
    products = Array.isArray(data?.products) ? data.products : []
  } else {
    const { data } = await getProducts({ limit: 0, delay, signal })
    products = Array.isArray(data?.products) ? data.products : []
  }

  return applyLocalCrudToList(products)
}

async function fetchApiPage({ search, category, limit, skip, sortBy, order, delay, signal }) {
  if (search) {
    const { data } = await searchProducts({ q: search, limit, skip, sortBy, order, delay, signal })
    const rawList = Array.isArray(data?.products) ? data.products : []
    const processed = applyLocalCrudToList(rawList)
    const rawTotal = Number(data?.total) || 0
    const deletedDiff = rawList.length - processed.length
    return {
      products: processed,
      total: Math.max(0, rawTotal - deletedDiff),
    }
  }

  if (category) {
    const { data } = await getProductsByCategory({
      category,
      limit,
      skip,
      sortBy,
      order,
      delay,
      signal,
    })
    const rawList = Array.isArray(data?.products) ? data.products : []
    const processed = applyLocalCrudToList(rawList)
    const rawTotal = Number(data?.total) || 0
    const deletedDiff = rawList.length - processed.length
    return {
      products: processed,
      total: Math.max(0, rawTotal - deletedDiff),
    }
  }

  const { data } = await getProducts({ limit, skip, sortBy, order, delay, signal })
  const rawList = Array.isArray(data?.products) ? data.products : []
  const processed = applyLocalCrudToList(rawList)
  const rawTotal = Number(data?.total) || 0
  const deletedDiff = rawList.length - processed.length
  return {
    products: processed,
    total: Math.max(0, rawTotal - deletedDiff),
  }
}

export async function loadProductList({ page, limit, search, category, sort, delay, signal }) {
  const skip = getSkip(page, limit)
  const { sortBy, order } = getSortQuery(sort)

  const localProducts = getStoredProducts()
  const filteredLocal = filterLocalProducts(localProducts, { search, category })

  // Search + Category combination handling
  if (search && category) {
    const { data } = await searchProducts({ q: search, limit: 0, delay, signal })
    const rawSearchProducts = Array.isArray(data?.products) ? data.products : []
    const apiProcessed = applyLocalCrudToList(rawSearchProducts)
    const categoryMatches = apiProcessed.filter(
      (item) => String(item.category || '').toLowerCase() === category.toLowerCase(),
    )
    const combined = [...filteredLocal, ...categoryMatches]
    const sorted = sort ? sortProducts(combined, sort) : combined
    const total = sorted.length
    const paginated = sorted.slice(skip, skip + limit)

    return { products: paginated, total }
  }

  // If client-side sorting is active
  if (sort) {
    const apiProducts = await fetchAllApiProducts({ search, category, delay, signal })
    const combined = [...filteredLocal, ...apiProducts]
    const sorted = sortProducts(combined, sort)
    const total = sorted.length
    const paginated = sorted.slice(skip, skip + limit)

    return { products: paginated, total }
  }

  const L = filteredLocal.length

  if (skip < L) {
    const localSlice = filteredLocal.slice(skip, skip + limit)
    const neededFromApi = limit - localSlice.length

    if (neededFromApi > 0) {
      const apiRes = await fetchApiPage({
        search,
        category,
        limit: neededFromApi,
        skip: 0,
        delay,
        signal,
      })
      return {
        products: [...localSlice, ...apiRes.products],
        total: L + apiRes.total,
      }
    }

    const apiRes = await fetchApiPage({ search, category, limit: 1, skip: 0, delay, signal })
    return {
      products: localSlice,
      total: L + apiRes.total,
    }
  }

  const apiSkip = skip - L
  const apiRes = await fetchApiPage({
    search,
    category,
    limit,
    skip: apiSkip,
    sortBy,
    order,
    delay,
    signal,
  })

  return {
    products: apiRes.products,
    total: L + apiRes.total,
  }
}

export function isRequestCanceled(error) {
  return (
    error?.code === 'ERR_CANCELED' ||
    error?.name === 'CanceledError' ||
    error?.name === 'AbortError'
  )
}
