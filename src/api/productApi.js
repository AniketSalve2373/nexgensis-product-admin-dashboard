import api from './axios'

function listParams({ limit, skip, sortBy, order, delay }) {
  const params = {}

  if (limit != null) {
    params.limit = limit
  }

  if (skip != null) {
    params.skip = skip
  }

  if (sortBy) {
    params.sortBy = sortBy
  }

  if (order) {
    params.order = order
  }

  // DummyJSON supports ?delay=ms so we can test stale-response cancellation.
  if (delay) {
    params.delay = delay
  }

  return params
}

export function getProducts({ limit, skip, sortBy, order, delay, signal } = {}) {
  return api.get('/products', {
    params: listParams({ limit, skip, sortBy, order, delay }),
    signal,
  })
}

export function searchProducts({ q, limit, skip, sortBy, order, delay, signal } = {}) {
  return api.get('/products/search', {
    params: {
      q,
      ...listParams({ limit, skip, sortBy, order, delay }),
    },
    signal,
  })
}

export function getProductsByCategory({
  category,
  limit,
  skip,
  sortBy,
  order,
  delay,
  signal,
} = {}) {
  return api.get(`/products/category/${encodeURIComponent(category)}`, {
    params: listParams({ limit, skip, sortBy, order, delay }),
    signal,
  })
}

export function getProductCategories({ signal } = {}) {
  return api.get('/products/categories', { signal })
}

export function getProductById(id, { signal } = {}) {
  return api.get(`/products/${encodeURIComponent(id)}`, { signal })
}

export function addProduct(productData) {
  return api.post('/products/add', productData)
}

