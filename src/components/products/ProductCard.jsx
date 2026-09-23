import ProductActions from './ProductActions'
import { formatPrice, formatRating, getProductImage } from './productDisplay'

export default function ProductCard({ product }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <img
          src={getProductImage(product)}
          alt=""
          className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-semibold text-slate-900">{product.title}</h3>
          <p className="mt-1 text-xs capitalize text-slate-500">{product.category}</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-slate-50 px-2 py-2">
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Price</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-900">{formatPrice(product.price)}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-2">
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Rating</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-900">
            {formatRating(product.rating)}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-2">
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Stock</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-900">{product.stock}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <ProductActions />
      </div>
    </article>
  )
}
