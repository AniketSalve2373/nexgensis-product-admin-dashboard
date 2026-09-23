import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProductCategories } from '../api/productApi'
import {
  getTotalPages,
  needsProductListParamSync,
  parseProductListParams,
  toProductListSearchParams,
} from '../utils/productListParams'
import { isRequestCanceled, loadProductList } from '../utils/loadProductList'

export function useProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { page, limit, search, category, sort, delay } = parseProductListParams(searchParams)

  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState([])
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
          search,
          category,
          sort,
          delay,
          ...updates,
        }),
      )
    },
    [page, limit, search, category, sort, delay, setSearchParams],
  )

  useEffect(() => {
    const controller = new AbortController()

    async function loadCategories() {
      try {
        const response = await getProductCategories({ signal: controller.signal })
        const rawCategories = Array.isArray(response.data) ? response.data : []
        const formatted = rawCategories.map((item) => {
          if (typeof item === 'string') {
            return { slug: item, name: item.replace(/-/g, ' ') }
          }
          return { slug: item.slug || item.name, name: item.name || item.slug }
        })
        setCategories(formatted)
      } catch (error) {
        if (!isRequestCanceled(error)) {
          setCategories([])
        }
      }
    }

    loadCategories()

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    const parsed = { page, limit, search, category, sort, delay }

    if (needsProductListParamSync(searchParams, parsed)) {
      replaceParams(parsed)
    }
  }, [searchParams, page, limit, search, category, sort, delay, replaceParams])

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
          search,
          category,
          sort,
          delay,
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
            search,
            category,
            sort,
            delay,
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
  }, [page, limit, search, category, sort, delay, reloadCount, replaceParams])

  const setSearch = useCallback(
    (nextSearch) => {
      pushParams({ page: 1, search: nextSearch })
    },
    [pushParams],
  )

  const setCategory = useCallback(
    (nextCategory) => {
      pushParams({ page: 1, category: nextCategory })
    },
    [pushParams],
  )

  const setSort = useCallback(
    (nextSort) => {
      pushParams({ page: 1, sort: nextSort })
    },
    [pushParams],
  )

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

  const clearFilters = useCallback(() => {
    pushParams({ page: 1, search: '', category: '', sort: '' })
  }, [pushParams])

  const retry = useCallback(() => {
    setReloadCount((count) => count + 1)
  }, [])

  return {
    products,
    total,
    categories,
    page,
    limit,
    search,
    category,
    sort,
    isLoading,
    hasError,
    setSearch,
    setCategory,
    setSort,
    setPage,
    setLimit,
    clearFilters,
    retry,
  }
}

