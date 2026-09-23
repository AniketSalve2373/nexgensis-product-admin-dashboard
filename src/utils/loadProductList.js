import { getProducts, getProductsByCategory, searchProducts } from '../api/productApi'
import { getSkip } from './productListParams'
import { getSortQuery, sortProducts } from './productSort'

export async function loadProductList({ page, limit, search, category, sort, delay, signal }) {
  const skip = getSkip(page, limit)
  const { sortBy, order } = getSortQuery(sort)

  // DummyJSON cannot apply search and category combined on a single endpoint.
  // Strategy: Fetch search results from server with limit: 0, filter by category client-side,
  // apply client-side sorting if needed, and apply pagination.
  if (search && category) {
    const { data } = await searchProducts({ q: search, limit: 0, delay, signal })
    const allSearchProducts = Array.isArray(data?.products) ? data.products : []
    const categoryMatches = allSearchProducts.filter(
      (item) => String(item.category || '').toLowerCase() === category.toLowerCase(),
    )
    const sorted = sort ? sortProducts(categoryMatches, sort) : categoryMatches
    const total = sorted.length
    const paginated = sorted.slice(skip, skip + limit)

    return { products: paginated, total }
  }

  if (search) {
    const { data } = await searchProducts({ q: search, limit, skip, sortBy, order, delay, signal })
    return {
      products: Array.isArray(data?.products) ? data.products : [],
      total: Number(data?.total) || 0,
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
    return {
      products: Array.isArray(data?.products) ? data.products : [],
      total: Number(data?.total) || 0,
    }
  }

  const { data } = await getProducts({ limit, skip, sortBy, order, delay, signal })

  return {
    products: Array.isArray(data?.products) ? data.products : [],
    total: Number(data?.total) || 0,
  }
}

export function isRequestCanceled(error) {
  return (
    error?.code === 'ERR_CANCELED' ||
    error?.name === 'CanceledError' ||
    error?.name === 'AbortError'
  )
}

