// Shimmer skeleton — premium feel without heavy animation libraries

interface SkeletonProps {
  rows?: number
}

export const TableSkeleton = ({ rows = 5 }: SkeletonProps) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-3.5 rounded-xl bg-slate-50/60">
        <div className="flex items-center gap-3 w-1/4">
          <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
          <div className="h-3.5 bg-slate-200 rounded-full w-24 animate-pulse" />
        </div>
        <div className="h-3.5 bg-slate-200 rounded-full w-1/4 animate-pulse self-center" />
        <div className="h-6 bg-slate-200 rounded-lg w-20 animate-pulse self-center" />
        <div className="h-5 bg-slate-200 rounded-full w-16 animate-pulse self-center" />
        <div className="h-3 bg-slate-200 rounded-full w-16 animate-pulse self-center" />
        <div className="h-7 bg-slate-200 rounded-lg w-24 animate-pulse self-center" />
      </div>
    ))}
  </div>
)

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="flex items-start justify-between">
      <div className="space-y-2.5">
        <div className="h-3 bg-slate-200 rounded-full w-20 animate-pulse" />
        <div className="h-8 bg-slate-200 rounded-xl w-12 animate-pulse" />
      </div>
      <div className="w-11 h-11 bg-slate-200 rounded-xl animate-pulse" />
    </div>
  </div>
)
