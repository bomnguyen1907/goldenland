'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

type User = {
    id: number
    email: string
    fullName?: string
}

export default function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/users/me', { credentials: 'include' })
                const data = await res.json()
                setUser(data.user || null)
            } catch {
                setUser(null)
            }
            setLoading(false)
        }
        fetchUser()
    }, [pathname])

    const handleLogout = async () => {
        await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
        setUser(null)
        router.push('/login')
    }

    const navItems = [
        { label: 'Trang chủ', href: '/' },
        { label: 'Nhà đất bán', href: '/listings?type=sale' },
        { label: 'Nhà đất cho thuê', href: '/listings?type=rent' },
        { label: 'Dự án', href: '/projects' },
        { label: 'Tin tức', href: '/articles' },
    ]

    const s = {
        header: {
            borderBottom: '1px solid #000',
            background: '#fff',
            position: 'sticky' as const,
            top: 0,
            zIndex: 100,
        },
        container: {
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
        } as React.CSSProperties,
        logo: {
            fontSize: 20,
            fontWeight: 800,
            color: '#000',
            textDecoration: 'none',
            letterSpacing: -0.5,
        } as React.CSSProperties,
        nav: {
            display: 'flex',
            gap: 24,
            alignItems: 'center',
        } as React.CSSProperties,
        navLink: (active: boolean) =>
            ({
                color: '#000',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                borderBottom: active ? '2px solid #000' : '2px solid transparent',
                paddingBottom: 4,
            }) as React.CSSProperties,
        right: { display: 'flex', gap: 8, alignItems: 'center' } as React.CSSProperties,
        btn: {
            padding: '8px 14px',
            border: '1px solid #000',
            background: '#000',
            color: '#fff',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
        } as React.CSSProperties,
        btnOutline: {
            padding: '8px 14px',
            border: '1px solid #000',
            background: '#fff',
            color: '#000',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
        } as React.CSSProperties,
        userName: { fontSize: 13, fontWeight: 600 } as React.CSSProperties,
    }

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href.split('?')[0])
    }

    return (
        <header style={s.header}>
            <div style={s.container}>
                <Link href="/" style={s.logo}>
                    GOLDEN LAND
                </Link>

                <nav style={s.nav}>
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} style={s.navLink(isActive(item.href))}>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div style={s.right}>
                    {loading ? null : user ? (
                        <>
                            <Link href="/dashboard" style={s.userName}>
                                {user.fullName || user.email}
                            </Link>
                            <button onClick={handleLogout} style={s.btnOutline}>
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" style={s.btnOutline}>
                                Đăng nhập
                            </Link>
                            <Link href="/login" style={s.btn}>
                                Đăng tin
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}