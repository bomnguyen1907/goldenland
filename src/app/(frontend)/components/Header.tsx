type TopAppBarUser = {
  email?: string | null
  id?: number | string
  name?: string | null
}

const navLinks = [
  { href: '#', label: 'Nhà đất bán' },
  { href: '#', label: 'Nhà đất cho thuê' },
  { href: '/projects', label: 'Dự án' },
  { href: '#', label: 'Tin tức' },
  { href: '#', label: 'Yêu thích' },
]

export default function TopAppBar({ user }: { user?: TopAppBarUser | null }) {
  const isLoggedIn = Boolean(user?.id)

  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 shadow-[0px_12px_32px_rgba(27,28,28,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4 font-headline tracking-tighter md:px-8">
        <div className="flex items-center gap-4 md:gap-8">
          <span className="text-sm font-bold uppercase tracking-widest text-zinc-900 sm:text-base lg:text-xl">
            <a href="/">
            GOLDENLAND
            </a>
          </span>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link, index) => (
              <a
                key={link.label}
                className={
                  index === 0
                    ? 'scale-95 border-b-2 border-red-700 pb-1 font-semibold text-red-700 transition-all duration-300 active:scale-100'
                    : 'scale-95 text-zinc-600 transition-all duration-300 active:scale-100 hover:text-zinc-900'
                }
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <a
                className="scale-95 text-sm font-semibold text-zinc-700 transition-all duration-300 active:scale-100 hover:text-zinc-900"
                href="#"
              >
                Profile
              </a>
            </>
          ) : (
            <>
              <a
                className="scale-95 text-sm font-semibold text-zinc-700 transition-all duration-300 active:scale-100 hover:text-zinc-900"
                href="#"
              >
                Đăng nhập
              </a>
              <a
                className="scale-95 rounded-md border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition-all duration-300 active:scale-100 hover:border-zinc-400 hover:text-zinc-900"
                href="#"
              >
                Đăng ký
              </a>
            </>
          )}
          <button className="editorial-gradient scale-95 rounded-md px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-100 sm:px-6">
                Đăng tin
          </button>
        </div>
      </div>
    </header>
  )
}
