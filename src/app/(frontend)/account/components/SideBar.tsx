'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BriefcaseBusiness,
  FileText,
  Grid2X2,
  Plus,
  Settings,
  User,
} from 'lucide-react'

const navLinks = [
  { href: '/account', label: 'Tổng quan', icon: Grid2X2 },
  { href: '/account/management', label: 'Tin đăng', icon: FileText },
  { href: '/account/membership', label: 'Gói Hội viên', icon: BriefcaseBusiness, badge: '-39%' },
  { href: '/account/profile', label: 'Tài khoản', icon: User },
  { href: '/account/setting', label: 'Cài đặt', icon: Settings },
]

export default function SideBar({ onCreatePostClick }: { onCreatePostClick?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 z-50 hidden h-screen w-20 shrink-0 flex-col items-center border-r border-zinc-200 bg-white py-6 sm:flex lg:w-24">
      <Link href="/" className="mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-[#2c2c2c] text-white">
        <span className="material-symbols-outlined text-[22px]">apartment</span>
      </Link>

      <nav className="flex w-full flex-1 flex-col items-center gap-7">
        <button
          type="button"
          onClick={onCreatePostClick}
          className="group flex w-full flex-col items-center text-[#e03c31]"
          aria-label="Đăng tin"
          title="Đăng tin"
        >
          <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#e03c31] text-white shadow-md transition group-hover:bg-[#c92f26]">
            <Plus className="h-6 w-6" />
          </span>
          <span className="text-center text-[10px] font-semibold leading-tight">Đăng tin</span>
        </button>

        {navLinks.map((link) => {
          const Icon = link.icon
          const isActive =
            link.href === '/account'
              ? pathname === '/account'
              : pathname === link.href || pathname.startsWith(`${link.href}/`)

          const itemClassName = `flex w-full flex-col items-center border-r-[3px] py-1 transition ${
            isActive
              ? 'border-[#e03c31] text-[#e03c31]'
              : 'border-transparent text-[#727272] hover:text-[#e03c31]'
          }`

          return (
            <div key={link.label} className="relative w-full">
              {link.badge ? (
                <span className="absolute right-2 top-[-10px] rounded-sm bg-[#e03c31] px-1 text-[8px] font-bold text-white lg:right-3">
                  {link.badge}
                </span>
              ) : null}
              <Link href={link.href} className={itemClassName} title={link.label}>
                <Icon className="mb-1 h-6 w-6" />
                <span className={`text-center text-[10px] leading-tight ${isActive ? 'font-bold' : ''}`}>
                  {link.label}
                </span>
              </Link>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
