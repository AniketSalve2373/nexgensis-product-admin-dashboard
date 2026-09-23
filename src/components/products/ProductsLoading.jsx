export default function ProductsLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading products</p>

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white lg:block">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="divide-y divide-slate-200">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-4 py-3">
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-4 flex-1 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex gap-3">
              <div className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
            <div className="mt-4 h-12 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
