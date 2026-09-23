import { parseSort } from './productSort'

export const ALLOWED_LIMITS = [10, 20, 50]
export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 10


export function parseLimit(value) {
  const limit = Number(value)

  if (ALLOWED_LIMITS.includes(limit)) {
    return limit
  }

  return DEFAULT_LIMIT
}

export function parsePage(value) {
  const page = Number(value)

  if (!Number.isInteger(page) || page < 1) {
    return DEFAULT_PAGE
  }

  return page
}

export function parseProductListParams(searchParams) {
  return {
    page: parsePage(searchParams.get('page')),
    limit: parseLimit(searchParams.get('limit')),
    search: searchParams.get('search')?.trim() || '',
    category: searchParams.get('category')?.trim() || '',
    sort: parseSort(searchParams.get('sort')),
    delay: searchParams.get('delay')?.trim() || '',
  }
}

export function toProductListSearchParams({ page, limit, search, category, sort, delay }) {
  const params = {}

  if (search) {
    params.search = search
  }

  if (category) {
    params.category = category
  }

  if (sort) {
    params.sort = sort
  }

  params.page = String(page)
  params.limit = String(limit)

  if (delay) {
    params.delay = delay
  }

  return params
}

export function needsProductListParamSync(searchParams, parsed) {
  const normalized = toProductListSearchParams(parsed)
  const keys = ['search', 'category', 'sort', 'page', 'limit', 'delay']

  return keys.some((key) => (searchParams.get(key) || '') !== (normalized[key] || ''))
}

export function getSkip(page, limit) {
  return (page - 1) * limit
}

export function getTotalPages(total, limit) {
  if (total <= 0) {
    return 1
  }

  return Math.ceil(total / limit)
}

export function getPageRange(page, limit, total) {
  if (total <= 0) {
    return { from: 0, to: 0 }
  }

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return { from, to }
}

export function getVisiblePageNumbers(currentPage, totalPages, windowSize = 5) {
  if (totalPages <= windowSize) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const halfWindow = Math.floor(windowSize / 2)
  let start = Math.max(1, currentPage - halfWindow)
  let end = start + windowSize - 1

  if (end > totalPages) {
    end = totalPages
    start = end - windowSize + 1
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

