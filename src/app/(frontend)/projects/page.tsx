'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Project = {
    id: number
    name: string
    slug?: string
    address?: string
    priceFrom?: number
    priceTo?: number
    totalArea?: number
    totalUnits?: number
    status?: string
    propertyTypes?: string[]
    thumbnail?: { url?: string; filename?: string } | null
    investor?: { name?: string } | null
}

const PROPERTY_TYPES = [
    { label: 'Tất cả loại', value: '' },
    { label: 'Chung cư', value: 'apartment' },
    { label: 'Nhà riêng', value: 'house' },
    { label: 'Biệt thự', value: 'villa' },
    { label: 'Đất nền', value: 'land' },
    { label: 'Shophouse', value: 'shophouse' },
    { label: 'Condotel', value: 'condotel' },
]

const STATUS_OPTIONS = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đang hiển thị', value: 'active' },
    { label: 'Nháp', value: 'draft' },
    { label: 'Tạm ẩn', value: 'hidden' },
]

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalDocs, setTotalDocs] = useState(0)

    // Filters
    const [keyword, setKeyword] = useState('')
    const [propertyType, setPropertyType] = useState('')
    const [status, setStatus] = useState('')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')

    const loadProjects = async () => {
        setLoading(true)
        try {
            const where: any = { and: [] }
            if (keyword) where.and.push({ name: { like: keyword } })
            if (propertyType) where.and.push({ propertyTypes: { contains: propertyType } })
            if (status) where.and.push({ status: { equals: status } })
            if (minPrice) where.and.push({ priceFrom: { greater_than_equal: Number(minPrice) } })
            if (maxPrice) where.and.push({ priceTo: { less_than_equal: Number(maxPrice) } })

            const whereParam = where.and.length > 0 ? `&where=${encodeURIComponent(JSON.stringify(where))}` : ''
            const res = await fetch(
                `/api/projects?limit=10&page=${page}&depth=2&sort=-createdAt${whereParam}`,
            )
            const data = await res.json()
            setProjects(data.docs || [])
            setTotalPages(data.totalPages || 1)
            setTotalDocs(data.totalDocs || 0)
        } catch {
            alert('Lỗi tải dữ liệu')
        }
        setLoading(false)
    }

    useEffect(() => {
        loadProjects()
    }, [page])

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        loadProjects()
    }

    const resetFilter = () => {
        setKeyword('')
        setPropertyType('')
        setStatus('')
        setMinPrice('')
        setMaxPrice('')
        setPage(1)
        setTimeout(loadProjects, 0)
    }

    const formatPrice = (p?: number) => {
        if (!p) return ''
        if (p >= 1000) return `${(p / 1000).toFixed(1)} tỷ`
        return `${p} triệu`
    }

    const getImageUrl = (thumb: Project['thumbnail']) => {
        if (!thumb?.url) return null
        return thumb.url.startsWith('http') ? thumb.url : `${thumb.url}`
    }

    const s = {
        page: {
            background: '#fff',
            minHeight: '100vh',
            color: '#000',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        } as React.CSSProperties,
        header: {
            borderBottom: '1px solid #000',
            padding: '20px 0',
            marginBottom: 32,
        } as React.CSSProperties,
        container: {
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 20px',
        } as React.CSSProperties,
        title: {
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            letterSpacing: -0.5,
        } as React.CSSProperties,
        subtitle: {
            color: '#666',
            fontSize: 14,
            marginTop: 4,
        } as React.CSSProperties,
        filterBar: {
            border: '1px solid #000',
            padding: 20,
            marginBottom: 24,
            display: 'grid',
            gap: 12,
        } as React.CSSProperties,
        filterGrid: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: 10,
        } as React.CSSProperties,
        input: {
            padding: '10px 12px',
            border: '1px solid #000',
            background: '#fff',
            fontSize: 14,
            color: '#000',
            borderRadius: 0,
            outline: 'none',
        } as React.CSSProperties,
        btnBar: { display: 'flex', gap: 8 } as React.CSSProperties,
        btn: {
            padding: '10px 20px',
            border: '1px solid #000',
            background: '#000',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
        } as React.CSSProperties,
        btnOutline: {
            padding: '10px 20px',
            border: '1px solid #000',
            background: '#fff',
            color: '#000',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
        } as React.CSSProperties,
        card: {
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: 20,
            border: '1px solid #000',
            marginBottom: 16,
            textDecoration: 'none',
            color: '#000',
            background: '#fff',
            transition: 'background 0.15s',
        } as React.CSSProperties,
        cardImage: {
            width: '100%',
            height: 200,
            objectFit: 'cover' as const,
            display: 'block',
            background: '#f0f0f0',
        } as React.CSSProperties,
        cardImagePlaceholder: {
            width: '100%',
            height: 200,
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: 13,
        } as React.CSSProperties,
        cardBody: {
            padding: '16px 20px 16px 0',
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'space-between',
        } as React.CSSProperties,
        cardTitle: {
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 6,
            lineHeight: 1.3,
        } as React.CSSProperties,
        cardMeta: {
            fontSize: 13,
            color: '#555',
            marginBottom: 4,
        } as React.CSSProperties,
        cardPrice: {
            fontSize: 16,
            fontWeight: 700,
            marginTop: 12,
        } as React.CSSProperties,
        cardFooter: {
            display: 'flex',
            gap: 16,
            fontSize: 12,
            color: '#666',
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid #e5e5e5',
        } as React.CSSProperties,
        badge: {
            display: 'inline-block',
            padding: '2px 8px',
            border: '1px solid #000',
            fontSize: 11,
            fontWeight: 600,
            marginRight: 6,
            textTransform: 'uppercase' as const,
        } as React.CSSProperties,
        pagination: {
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            marginTop: 32,
            marginBottom: 40,
        } as React.CSSProperties,
        pageBtn: {
            minWidth: 36,
            height: 36,
            border: '1px solid #000',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
        } as React.CSSProperties,
        pageBtnActive: {
            background: '#000',
            color: '#fff',
        } as React.CSSProperties,
        empty: {
            textAlign: 'center' as const,
            padding: 60,
            border: '1px solid #000',
            color: '#666',
        } as React.CSSProperties,
    }

    return (
        <div style={s.page}>
            <div style={s.header}>
                <div style={s.container}>
                    <h1 style={s.title}>Dự án Bất động sản</h1>
                    <div style={s.subtitle}>
                        {totalDocs > 0 ? `${totalDocs} dự án` : 'Danh sách dự án'}
                    </div>
                </div>
            </div>

            <div style={s.container}>
                {/* FILTER BAR */}
                <form onSubmit={handleFilter} style={s.filterBar}>
                    <div style={s.filterGrid}>
                        <input
                            style={s.input}
                            placeholder="Tìm theo tên dự án..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <select
                            style={s.input}
                            value={propertyType}
                            onChange={(e) => setPropertyType(e.target.value)}
                        >
                            {PROPERTY_TYPES.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                        <select style={s.input} value={status} onChange={(e) => setStatus(e.target.value)}>
                            {STATUS_OPTIONS.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                        <input
                            style={s.input}
                            type="number"
                            placeholder="Giá từ (triệu)"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <input
                            style={s.input}
                            type="number"
                            placeholder="Giá đến (triệu)"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                    <div style={s.btnBar}>
                        <button type="submit" style={s.btn}>
                            Lọc kết quả
                        </button>
                        <button type="button" style={s.btnOutline} onClick={resetFilter}>
                            Đặt lại
                        </button>
                    </div>
                </form>

                {/* LIST */}
                {loading ? (
                    <div style={s.empty}>Đang tải...</div>
                ) : projects.length === 0 ? (
                    <div style={s.empty}>Không tìm thấy dự án nào</div>
                ) : (
                    projects.map((p) => {
                        const img = getImageUrl(p.thumbnail)
                        return (
                            <Link
                                key={p.id}
                                href={`/projects/${p.id}`}
                                style={s.card}
                                onMouseOver={(e) => (e.currentTarget.style.background = '#fafafa')}
                                onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
                            >
                                {img ? (
                                    <img src={img} alt={p.name} style={s.cardImage} />
                                ) : (
                                    <div style={s.cardImagePlaceholder}>Chưa có ảnh</div>
                                )}
                                <div style={s.cardBody}>
                                    <div>
                                        <div style={{ marginBottom: 8 }}>
                                            {p.status === 'active' && <span style={s.badge}>Đang mở bán</span>}
                                            {p.propertyTypes?.slice(0, 2).map((t) => (
                                                <span key={t} style={s.badge}>
                                                    {PROPERTY_TYPES.find((x) => x.value === t)?.label || t}
                                                </span>
                                            ))}
                                        </div>
                                        <div style={s.cardTitle}>{p.name}</div>
                                        {p.address && <div style={s.cardMeta}>📍 {p.address}</div>}
                                        {p.investor?.name && (
                                            <div style={s.cardMeta}>Chủ đầu tư: {p.investor.name}</div>
                                        )}
                                    </div>
                                    {(p.priceFrom || p.priceTo) && (
                                        <div style={s.cardPrice}>
                                            {p.priceFrom && p.priceTo
                                                ? `${formatPrice(p.priceFrom)} - ${formatPrice(p.priceTo)}`
                                                : formatPrice(p.priceFrom || p.priceTo)}
                                        </div>
                                    )}
                                    <div style={s.cardFooter}>
                                        {p.totalArea && <div>Diện tích: {p.totalArea} ha</div>}
                                        {p.totalUnits && <div>Số căn: {p.totalUnits}</div>}
                                    </div>
                                </div>
                            </Link>
                        )
                    })
                )}

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div style={s.pagination}>
                        <button
                            style={s.pageBtn}
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                            <button
                                key={n}
                                style={{
                                    ...s.pageBtn,
                                    ...(n === page ? s.pageBtnActive : {}),
                                }}
                                onClick={() => setPage(n)}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            style={s.pageBtn}
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}