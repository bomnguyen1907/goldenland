'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ProjectDetailPage() {
    const params = useParams()
    const id = params?.id as string
    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentImage, setCurrentImage] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/projects/${id}?depth=2`)
                const data = await res.json()
                setProject(data)
            } catch {
                alert('Lỗi tải dữ liệu')
            }
            setLoading(false)
        }
        if (id) fetchData()
    }, [id])

    const formatPrice = (p?: number) => {
        if (!p) return '-'
        if (p >= 1000) return `${(p / 1000).toFixed(1)} tỷ`
        return `${p} triệu`
    }

    const formatDate = (d?: string) => {
        if (!d) return '-'
        return new Date(d).toLocaleDateString('vi-VN')
    }

    const s = {
        page: {
            background: '#fff',
            minHeight: '100vh',
            color: '#000',
            fontFamily: 'system-ui, sans-serif',
        } as React.CSSProperties,
        container: { maxWidth: 1100, margin: '0 auto', padding: '20px' } as React.CSSProperties,
        back: {
            display: 'inline-block',
            marginBottom: 20,
            color: '#000',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            borderBottom: '1px solid #000',
            paddingBottom: 2,
        } as React.CSSProperties,
        heroImage: {
            width: '100%',
            height: 400,
            objectFit: 'cover' as const,
            border: '1px solid #000',
            background: '#f0f0f0',
            display: 'block',
        } as React.CSSProperties,
        thumbs: {
            display: 'flex',
            gap: 8,
            marginTop: 12,
            overflowX: 'auto' as const,
        } as React.CSSProperties,
        thumb: {
            width: 80,
            height: 60,
            objectFit: 'cover' as const,
            border: '1px solid #000',
            cursor: 'pointer',
            opacity: 0.6,
        } as React.CSSProperties,
        thumbActive: { opacity: 1, border: '2px solid #000' } as React.CSSProperties,
        title: { fontSize: 32, fontWeight: 700, margin: '24px 0 8px 0' } as React.CSSProperties,
        meta: { color: '#555', fontSize: 15, marginBottom: 16 } as React.CSSProperties,
        priceBox: {
            border: '1px solid #000',
            padding: 20,
            margin: '20px 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
        } as React.CSSProperties,
        priceLabel: { fontSize: 12, color: '#666', marginBottom: 4 } as React.CSSProperties,
        priceValue: { fontSize: 18, fontWeight: 700 } as React.CSSProperties,
        section: { marginTop: 32 } as React.CSSProperties,
        sectionTitle: {
            fontSize: 20,
            fontWeight: 700,
            paddingBottom: 8,
            borderBottom: '2px solid #000',
            marginBottom: 16,
        } as React.CSSProperties,
        infoGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
        } as React.CSSProperties,
        infoRow: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid #e5e5e5',
            fontSize: 14,
        } as React.CSSProperties,
        infoLabel: { color: '#666' } as React.CSSProperties,
        infoValue: { fontWeight: 600 } as React.CSSProperties,
        zoneCard: {
            border: '1px solid #000',
            padding: 16,
            marginBottom: 12,
        } as React.CSSProperties,
    }

    if (loading) return <div style={s.container}>Đang tải...</div>
    if (!project) return <div style={s.container}>Không tìm thấy dự án</div>

    const images = project.images || []
    const mainImage =
        currentImage === 0 && project.thumbnail?.url
            ? project.thumbnail.url
            : images[currentImage - 1]?.image?.url || project.thumbnail?.url

    return (
        <div style={s.page}>
            <div style={s.container}>
                <Link href="/projects" style={s.back}>
                    ← Quay lại danh sách
                </Link>

                {/* HERO IMAGE */}
                {mainImage ? (
                    <img src={mainImage} alt={project.name} style={s.heroImage} />
                ) : (
                    <div style={{ ...s.heroImage, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Chưa có ảnh
                    </div>
                )}

                {/* THUMBNAILS */}
                {(project.thumbnail || images.length > 0) && (
                    <div style={s.thumbs}>
                        {project.thumbnail?.url && (
                            <img
                                src={project.thumbnail.url}
                                style={{ ...s.thumb, ...(currentImage === 0 ? s.thumbActive : {}) }}
                                onClick={() => setCurrentImage(0)}
                            />
                        )}
                        {images.map((img: any, i: number) => (
                            <img
                                key={i}
                                src={img.image?.url}
                                style={{ ...s.thumb, ...(currentImage === i + 1 ? s.thumbActive : {}) }}
                                onClick={() => setCurrentImage(i + 1)}
                            />
                        ))}
                    </div>
                )}

                <h1 style={s.title}>{project.name}</h1>
                {project.address && <div style={s.meta}>📍 {project.address}</div>}

                {/* PRICE BOX */}
                <div style={s.priceBox}>
                    <div>
                        <div style={s.priceLabel}>Giá từ</div>
                        <div style={s.priceValue}>{formatPrice(project.priceFrom)}</div>
                    </div>
                    <div>
                        <div style={s.priceLabel}>Giá đến</div>
                        <div style={s.priceValue}>{formatPrice(project.priceTo)}</div>
                    </div>
                    <div>
                        <div style={s.priceLabel}>Tổng số căn</div>
                        <div style={s.priceValue}>{project.totalUnits || '-'}</div>
                    </div>
                </div>

                {/* THÔNG TIN CHUNG */}
                <div style={s.section}>
                    <div style={s.sectionTitle}>Thông tin chung</div>
                    <div style={s.infoGrid}>
                        <div style={s.infoRow}>
                            <span style={s.infoLabel}>Chủ đầu tư</span>
                            <span style={s.infoValue}>{project.investor?.name || '-'}</span>
                        </div>
                        <div style={s.infoRow}>
                            <span style={s.infoLabel}>Tổng diện tích</span>
                            <span style={s.infoValue}>{project.totalArea ? `${project.totalArea} ha` : '-'}</span>
                        </div>
                        <div style={s.infoRow}>
                            <span style={s.infoLabel}>Ngày khởi công</span>
                            <span style={s.infoValue}>{formatDate(project.startDate)}</span>
                        </div>
                        <div style={s.infoRow}>
                            <span style={s.infoLabel}>Ngày bàn giao</span>
                            <span style={s.infoValue}>{formatDate(project.completionDate)}</span>
                        </div>
                    </div>
                </div>

                {/* MÔ TẢ */}
                {project.description && (
                    <div style={s.section}>
                        <div style={s.sectionTitle}>Mô tả dự án</div>
                        <div
                            style={{ lineHeight: 1.7, fontSize: 15 }}
                            dangerouslySetInnerHTML={{
                                __html:
                                    typeof project.description === 'string'
                                        ? project.description
                                        : JSON.stringify(project.description),
                            }}
                        />
                    </div>
                )}

                {/* PHÂN KHU */}
                {project.zones?.length > 0 && (
                    <div style={s.section}>
                        <div style={s.sectionTitle}>Phân khu ({project.zones.length})</div>
                        {project.zones.map((z: any, i: number) => (
                            <div key={i} style={s.zoneCard}>
                                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{z.name}</div>
                                {z.description && (
                                    <div style={{ color: '#555', fontSize: 14, marginBottom: 8 }}>{z.description}</div>
                                )}
                                <div style={{ fontSize: 13, color: '#666' }}>
                                    Số căn: {z.totalUnits || '-'} · Trạng thái: {z.status || '-'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}