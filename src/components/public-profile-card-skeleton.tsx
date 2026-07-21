export function PublicProfileCardSkeleton() {
  return (
    <div className="w-full max-w-[470px] animate-pulse rounded-[30px] border border-white/10 bg-white/6 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="h-[82px] w-[82px] shrink-0 rounded-[22px] bg-white/10 sm:h-[92px] sm:w-[92px]" />

        <div className="min-w-0 flex-1 pt-1 sm:pt-2">
          <div className="h-8 w-3/4 rounded-xl bg-white/12 sm:h-9" />
          <div className="mt-3 h-4 w-2/3 rounded-lg bg-white/10" />
          <div className="mt-2 h-4 w-1/2 rounded-lg bg-white/8" />
        </div>

        <div className="h-14 w-14 shrink-0 rounded-[20px] bg-white/10 sm:h-16 sm:w-16" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="h-12 rounded-xl bg-white/10" />
        <div className="h-12 rounded-xl bg-white/8" />
      </div>

      <div className="mt-5 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10" />
              <div className="min-w-0">
                <div className="h-3 w-16 rounded bg-white/8" />
                <div className="mt-2 h-4 w-36 rounded bg-white/12" />
              </div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-white/8" />
          </div>
        ))}
      </div>
    </div>
  );
}
