export const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-asc', label: 'Rating: Low to High' },
  { value: 'rating-desc', label: 'Rating: High to Low' },
  { value: 'title-asc', label: 'Title: A to Z' },
  { value: 'title-desc', label: 'Title: Z to A' },
]

const ALLOWED_SORTS = new Set(SORT_OPTIONS.map((option) => option.value))

export function parseSort(value) {
  if (ALLOWED_SORTS.has(value)) {
    return value
  }

  return ''
}

export function getSortQuery(sort) {
  if (!sort) {
    return {}
  }

  const [sortBy, order] = sort.split('-')
  return { sortBy, order }
}

export function sortProducts(products, sort) {
  if (!sort || !Array.isArray(products)) {
    return Array.isArray(products) ? products : []
  }

  const [field, order] = sort.split('-')
  const direction = order === 'desc' ? -1 : 1

  return products.slice().sort((left, right) => {
    if (field === 'title') {
      return String(left.title || '').localeCompare(String(right.title || '')) * direction
    }

    const leftValue = Number(left[field]) || 0
    const rightValue = Number(right[field]) || 0
    return (leftValue - rightValue) * direction
  })
}
