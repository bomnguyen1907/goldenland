'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatDate, lexicalToHtml } from '../utils'
import SectionTitle from '../components/SectionTitle'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    active: { label: 'Đang mở bán', cls: 'bg-emerald-500 text-white' },
    upcoming: { label: 'Sắp mở bán', cls: 'bg-amber-500 text-white' },
    completed: { label: 'Đã bàn giao', cls: 'bg-gray-500 text-white' },
}

export default function ProjectDetailPage() {
    const { id } = useParams() as { id: string }
    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentImage, setCurrentImage] = useState(0)

    useEffect(() => {
        if (!id) return
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/projects/${id}?depth=2`)
                const data = await res.json()
                setProject(data)
                fetch(`/api/projects/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ views: (data.views || 0) + 1 }),
                }).catch(() => {})
            } catch {
                alert('Lỗi tải dữ liệu')
            }
            setLoading(false)
        }
        fetchData()
    }, [id])

    if (loading) return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-[1100px] mx-auto px-5 pt-[120px]">
                <div className="animate-pulse space-y-4">
                    <div className="h-[480px] bg-gray-200 rounded-xl" />
                    <div className="h-8 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
            </div>
        </div>
    )

    if (!project) return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="text-center text-gray-400">
                <div className="text-5xl mb-4">🏗️</div>
                <div className="font-semibold text-lg">Không tìm thấy dự án</div>
            </div>
        </div>
    )

    const images = project.images || []
    const mainImage =
        currentImage === 0 && project.thumbnail?.url
            ? project.thumbnail.url
            : images[currentImage - 1]?.image?.url || project.thumbnail?.url

    const badge = project.status ? STATUS_MAP[project.status] : null

    return (
        <div className="bg-gray-50 min-h-screen text-gray-900">
            <div className="max-w-[1100px] mx-auto px-5 pt-[100px] pb-12">
                {/* BACK LINK */}
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-1.5 mb-6 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors no-underline"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại danh sách
                </Link>

                {/* HERO IMAGE */}
                <div className="relative rounded-xl overflow-hidden shadow-lg mb-4">
                    {mainImage ? (
                        <img src={mainImage} alt={project.name} className="w-full h-[480px] object-cover block bg-gray-200" />
                    ) : (
                        <div className="w-full h-[480px] bg-gray-200 flex items-center justify-center text-gray-400">
                            Chưa có ảnh
                        </div>
                    )}
                    {badge && (
                        <span className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-semibold ${badge.cls}`}>
                            {badge.label}
                        </span>
                    )}
                </div>

                {/* THUMBNAILS */}
                {(project.thumbnail || images.length > 0) && (
                    <div className="flex gap-2 mb-6 overflow-x-auto">
                        {project.thumbnail?.url && (
                            <img
                                src={project.thumbnail.url}
                                alt="thumb"
                                className={`w-20 h-[60px] object-cover rounded-lg cursor-pointer transition-all ${currentImage === 0 ? 'ring-2 ring-emerald-500 opacity-100' : 'opacity-60 hover:opacity-90'}`}
                                onClick={() => setCurrentImage(0)}
                            />
                        )}
                        {images.map((img: any, i: number) => (
                            <img
                                key={i}
                                src={img.image?.url}
                                alt={`thumb-${i}`}
                                className={`w-20 h-[60px] object-cover rounded-lg cursor-pointer transition-all ${currentImage === i + 1 ? 'ring-2 ring-emerald-500 opacity-100' : 'opacity-60 hover:opacity-90'}`}
                                onClick={() => setCurrentImage(i + 1)}
                            />
                        ))}
                    </div>
                )}

                <h1 className="text-[30px] font-bold mb-2 text-gray-900">{project.name}</h1>
                {project.address && (
                    <div className="text-gray-500 text-[15px] mb-5 flex items-center gap-1">
                        📍 {project.address}
                    </div>
                )}

                {/* PRICE BOX */}
                <div className="bg-white rounded-xl shadow-sm p-5 mb-8 grid grid-cols-3 gap-5">
                    {[
                        { label: 'Giá từ', value: formatPrice(project.priceFrom), accent: true },
                        { label: 'Giá đến', value: formatPrice(project.priceTo), accent: true },
                        { label: 'Tổng số căn', value: project.totalUnits || '-', accent: false },
                    ].map(({ label, value, accent }) => (
                        <div key={label}>
                            <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">{label}</div>
                            <div className={`text-lg font-bold ${accent && value ? 'text-emerald-600' : 'text-gray-900'}`}>
                                {value || '-'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* THÔNG TIN CHUNG */}
                <div className="mb-8">
                    <SectionTitle>Thông tin chung</SectionTitle>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {[
                            { label: 'Chủ đầu tư', value: project.investor?.name || '-' },
                            { label: 'Tổng diện tích', value: project.totalArea ? `${project.totalArea} ha` : '-' },
                            { label: 'Ngày khởi công', value: formatDate(project.startDate) },
                            { label: 'Ngày bàn giao', value: formatDate(project.completionDate) },
                        ].map(({ label, value }, i, arr) => (
                            <div
                                key={label}
                                className={`flex justify-between items-center px-5 py-3.5 text-sm ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <span className="text-gray-500">{label}</span>
                                <span className="font-semibold text-gray-900">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MÔ TẢ */}
                {project.description && (
                    <div className="mb-8">
                        <SectionTitle>Mô tả dự án</SectionTitle>
                        <div
                            className="bg-white rounded-xl shadow-sm p-5 leading-relaxed text-[15px] text-gray-700"
                            dangerouslySetInnerHTML={{
                                __html: typeof project.description === 'string'
                                    ? project.description
                                    : lexicalToHtml(project.description),
                            }}
                        />
                    </div>
                )}

                {/* PHÂN KHU */}
                {project.zones?.length > 0 && (
                    <div className="mb-8">
                        <SectionTitle>Phân khu ({project.zones.length})</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {project.zones.map((z: any, i: number) => (
                                <div key={i} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                                    <div className="font-bold text-base mb-1 text-gray-900">{z.name}</div>
                                    {z.description && (
                                        <div className="text-gray-500 text-sm mb-3">{z.description}</div>
                                    )}
                                    <div className="flex gap-3 text-xs text-gray-400 pt-3 border-t border-gray-100">
                                        {z.totalUnits && <span>🏢 {z.totalUnits} căn</span>}
                                        {z.status && <span>• {z.status}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
