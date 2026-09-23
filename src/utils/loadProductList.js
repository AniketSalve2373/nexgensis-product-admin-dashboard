import { getProducts } from '../api/productApi'
import { getSkip } from './productListParams'

export async function loadProductList({ page, limit, signal }) {
  const skip = getSkip(page, limit)
  const { data } = await getProducts({ limit, skip, signal })

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

