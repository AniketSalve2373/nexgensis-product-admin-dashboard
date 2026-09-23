import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getTotalPages,
  needsProductListParamSync,
  parseProductListParams,
  toProductListSearchParams,
} from '../utils/productListParams'
import { isRequestCanceled, loadProductList } from '../utils/loadProductList'

export function useProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { page, limit } = parseProductListParams(searchParams)

  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  const replaceParams = useCallback(
    (next) => {
      setSearchParams(toProductListSearchParams(next), { replace: true })
    },
    [setSearchParams],
  )

  const pushParams = useCallback(
    (updates) => {
      setSearchParams(
        toProductListSearchParams({
          page,
          limit,
          ...updates,
        }),
      )
    },
    [page, limit, setSearchParams],
  )

  useEffect(() => {
    const parsed = { page, limit }

    if (needsProductListParamSync(searchParams, parsed)) {
      replaceParams(parsed)
    }
  }, [searchParams, page, limit, replaceParams])

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false
    let keepLoading = false

    async function loadProducts() {
      setIsLoading(true)
      setHasError(false)

      try {
        const result = await loadProductList({
          page,
          limit,
          signal: controller.signal,
        })

        if (ignore) {
          return
        }

        const lastPage = getTotalPages(result.total, limit)
        if (page > lastPage) {
          keepLoading = true
          replaceParams({
            page: lastPage,
            limit,
          })
          return
        }

        setProducts(result.products)
        setTotal(result.total)
      } catch (error) {
        if (ignore || isRequestCanceled(error)) {
          return
        }

        setHasError(true)
        setProducts([])
        setTotal(0)
      } finally {
        if (!ignore && !keepLoading) {
          setIsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [page, limit, reloadCount, replaceParams])

  const setPage = useCallback(
    (nextPage) => {
      pushParams({ page: nextPage })
    },
    [pushParams],
  )

  const setLimit = useCallback(
    (nextLimit) => {
      pushParams({ page: 1, limit: nextLimit })
    },
    [pushParams],
  )

  const retry = useCallback(() => {
    setReloadCount((count) => count + 1)
  }, [])

  return {
    products,
    total,
    page,
    limit,
    isLoading,
    hasError,
    setPage,
    setLimit,
    retry,
  }
}

