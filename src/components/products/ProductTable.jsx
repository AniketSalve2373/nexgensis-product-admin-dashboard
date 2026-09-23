import ProductActions from './ProductActions'
import { formatPrice, formatRating, getProductImage } from './productDisplay'

export default function ProductTable({ products }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
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
            <tr key={product.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <img
                  src={getProductImage(product)}
                  alt=""
                  className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                />
              </td>
              <td className="max-w-xs px-4 py-3 font-medium break-words text-slate-900">
                {product.title}
              </td>
              <td className="px-4 py-3 capitalize text-slate-600">{product.category}</td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-900">
                {formatPrice(product.price)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                {formatRating(product.rating)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-600">{product.stock}</td>
              <td className="px-4 py-3">
                <ProductActions />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
