export default function ProductFilters({ categories, value, onChange }) {
  return (
    <label className="block min-w-0 sm:w-56">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">Category</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      >
        <option value="">All categories</option>
        {value && !categories.some((item) => item.slug === value) ? (
          <option value={value}>{value}</option>
        ) : null}
        {categories.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  )
}
