export function HeroSection() {
  return (
    <section className="editorial-gradient relative flex min-h-[600px] items-center overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-screen-2xl gap-12 px-8 flex items-center justify-center">
          <div className="w-1/2 rounded-xl bg-white/90 p-8 shadow-[0px_24px_48px_rgba(0,0,0,0.15)] backdrop-blur-2xl">
            <div className="mb-6 flex gap-4 border-b border-zinc-100">
              <button className="border-b-2 border-primary pb-3 text-sm font-bold text-primary">
                Mua bán
              </button>
              <button className="pb-3 text-sm font-medium text-secondary transition-colors hover:text-on-surface">
                Dự án
              </button>
              <button className="pb-3 text-sm font-medium text-secondary transition-colors hover:text-on-surface">
                Tin tức
              </button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-4 text-zinc-400">
                  location_on
                </span>
                <input
                  className="w-full rounded-lg border border-zinc-100 bg-surface-container-lowest py-4 pl-12 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Thành phố, Quận, Tên dự án..."
                  type="text"
                />
              </div>
             
              <button className="editorial-gradient flex w-full items-center justify-center gap-2 rounded-lg py-4 font-bold text-white shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined">search</span>
                Tìm kiếm ngay
              </button>
            </div>
          </div>
      </div>
    </section>
  )
}
