/**
 * Pulse skeleton primitives for loading states (dark glass UI).
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/10 ${className}`.trim()}
      {...props}
    />
  );
}

/** Single catalog-style book card placeholder */
export function BookCardSkeleton({ className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_12px_30px_rgba(0,0,0,0.34)] backdrop-blur-xl ${className}`.trim()}
    >
      <Skeleton className="aspect-[2/3] w-full rounded-none bg-white/[0.08]" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-[85%] max-w-[14rem]" />
        <Skeleton className="h-4 w-[60%] max-w-[10rem]" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function BookCardSkeletonGrid({ count = 8, className = '' }) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`.trim()}
      role="status"
      aria-label="Loading books"
    >
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Featured section on landing (taller cover) */
export function FeaturedBookCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_12px_35px_rgba(0,0,0,0.36)] backdrop-blur-xl">
      <Skeleton className="aspect-[3/4] w-full rounded-none bg-white/[0.08]" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-6 w-[85%]" />
        <Skeleton className="h-4 w-[60%]" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-2 h-10 w-36 rounded-lg" />
      </div>
    </div>
  );
}

export function FeaturedBookSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5" role="status" aria-label="Loading featured books">
      {Array.from({ length: count }).map((_, i) => (
        <FeaturedBookCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function DashboardBookCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <Skeleton className="aspect-[3/4] w-full rounded-none bg-white/[0.08]" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-[90%]" />
        <Skeleton className="h-4 w-[70%]" />
        <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
      </div>
    </div>
  );
}

/** Admin dashboard summary strip */
export function AdminSummaryCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-orange-500/[0.06] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 bg-white/[0.12]" />
        <Skeleton className="h-4 w-4 rounded bg-white/[0.12]" />
      </div>
      <Skeleton className="mt-3 h-9 w-16 bg-white/[0.12]" />
      <Skeleton className="mt-2 h-3 w-20 bg-white/[0.08]" />
    </div>
  );
}

export function AdminListRowSkeleton() {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-14 rounded-full" />
        <Skeleton className="h-7 w-12 rounded-lg" />
      </div>
    </li>
  );
}

export function AdminBookListRowSkeleton() {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-8 rounded-md" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Skeleton className="h-3 w-10" />
    </li>
  );
}

export function ChartAreaSkeleton() {
  return (
    <div className="h-56 w-full rounded-xl bg-white/[0.03] p-4">
      <Skeleton className="h-full w-full rounded-lg bg-white/[0.06]" />
    </div>
  );
}

/** Full route guard placeholder */
export function AuthLoadingSkeleton() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>
      <Skeleton className="h-10 w-48 rounded-xl" />
      <Skeleton className="h-4 w-64 max-w-full" />
      <Skeleton className="h-4 w-40 max-w-full" />
    </div>
  );
}

/** Manage users table rows */
export function TableRowSkeleton() {
  return (
    <tr className="border-t border-white/10">
      <td className="px-3 py-3">
        <Skeleton className="h-4 w-4" />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-6 w-16 rounded-full" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>
      <td className="px-3 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-3 py-3 text-right">
        <div className="ml-auto flex w-fit gap-1">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

export function ManageUsersTableSkeleton({ rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </>
  );
}

export function ManageBooksTableSkeleton({ rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-t border-white/10">
          <td className="px-3 py-3">
            <Skeleton className="h-4 w-4" />
          </td>
          <td className="px-3 py-3">
            <Skeleton className="h-16 w-12 rounded-md" />
          </td>
          <td className="px-3 py-3">
            <Skeleton className="mb-2 h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </td>
          <td className="px-3 py-3">
            <Skeleton className="h-4 w-32" />
          </td>
          <td className="px-3 py-3">
            <Skeleton className="h-4 w-16" />
          </td>
          <td className="px-3 py-3">
            <Skeleton className="h-4 w-10" />
          </td>
          <td className="px-3 py-3 text-right">
            <Skeleton className="ml-auto h-8 w-28" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function ProfilePageSkeleton() {
  return (
    <section className="mx-auto w-full max-w-[78rem] px-2 sm:px-3 md:px-4" aria-hidden="true">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-full max-w-sm" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function AdminUserDetailSkeleton() {
  return (
    <div className="admin-panel space-y-3">
      <div className="admin-panel-head">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="admin-panel-body space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
