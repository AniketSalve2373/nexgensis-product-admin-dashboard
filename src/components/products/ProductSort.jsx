import { SORT_OPTIONS } from '../../utils/productSort'

export default function ProductSort({ value, onChange }) {
  return (
    <label className="block min-w-0 sm:w-56">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">Sort</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      >
        <option value="">Default</option>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
