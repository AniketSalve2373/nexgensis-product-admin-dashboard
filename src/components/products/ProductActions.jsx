export default function ProductActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled
        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-400"
      >
        View
      </button>
      <button
        type="button"
        disabled
        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-400"
      >
        Edit
      </button>
      <button
        type="button"
        disabled
        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-400"
      >
        Delete
      </button>
    </div>
  )
}
