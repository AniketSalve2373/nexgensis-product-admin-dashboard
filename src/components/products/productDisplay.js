export function getProductImage(product) {
  return product.thumbnail || product.images?.[0] || ''
}

export function formatPrice(price) {
  const amount = Number(price)

  if (Number.isNaN(amount)) {
    return '—'
  }

  return `$${amount.toFixed(2)}`
}

export function formatRating(rating) {
  const value = Number(rating)

  if (Number.isNaN(value)) {
    return '—'
  }

  return value.toFixed(2)
}
