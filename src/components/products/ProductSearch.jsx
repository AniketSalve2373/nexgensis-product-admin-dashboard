import { useEffect, useState } from 'react'

const SEARCH_DEBOUNCE_MS = 450

export default function ProductSearch({ value, onSearch }) {
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (inputValue === value) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      onSearch(inputValue)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [inputValue, value, onSearch])

  return (
    <label className="block min-w-0 flex-1">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">Search</span>
      <input
        type="search"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder="Search products"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      />
    </label>
  )
}
