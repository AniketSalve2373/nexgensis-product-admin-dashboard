import { Link } from 'react-router-dom'
import ProductActions from './ProductActions'
import { formatPrice, formatRating, getProductImage } from './productDisplay'

export default function ProductTable({ products, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold text-slate-600">
              Image
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-slate-600">
              Title
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-slate-600">
              Category
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-600">
              Price
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-600">
              Rating
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-slate-600">
              Stock
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-slate-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3">
                <Link to={`/products/${product.id}`} className="block shrink-0">
                  <img
                    src={getProductImage(product)}
                    alt=""
                    className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Img'
                    }}
                  />
                </Link>
              </td>
              <td className="max-w-xs px-4 py-3 font-medium break-words text-slate-900">
                <Link
                  to={`/products/${product.id}`}
                  className="hover:text-indigo-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {product.title}
                </Link>
              </td>
              <td className="px-4 py-3 capitalize text-slate-600">{product.category}</td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-900 font-medium">
                {formatPrice(product.price)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                {formatRating(product.rating)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-600">{product.stock}</td>
              <td className="px-4 py-3">
                <ProductActions product={product} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
