export function Loader() {
  return (
    <div className="flex justify-center py-16" role="status" aria-label="Loading">
      <div className="h-10 w-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden animate-pulse">
      <div className="h-40 bg-slate-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-5 bg-slate-200 rounded w-1/3 mt-3" />
      </div>
    </div>
  );
}
