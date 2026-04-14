'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatDate } from '../utils'
import SectionTitle from '../components/SectionTitle'

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
                setProject(await res.json())
            } catch {
                alert('Lỗi tải dữ liệu')
            }
            setLoading(false)
        }
        fetchData()
    }, [id])

    if (loading) return <div className="max-w-[1100px] mx-auto px-5 pt-[100px]">Đang tải...</div>
    if (!project) return <div className="max-w-[1100px] mx-auto px-5 pt-[100px]">Không tìm thấy dự án</div>

    const images = project.images || []
    const mainImage =
        currentImage === 0 && project.thumbnail?.url
            ? project.thumbnail.url
            : images[currentImage - 1]?.image?.url || project.thumbnail?.url

    return (
        <div className="bg-white min-h-screen text-black">
            <div className="max-w-[1100px] mx-auto px-5 pt-[100px] pb-10">
                <Link href="/projects" className="inline-block mb-5 text-sm font-semibold border-b border-black pb-0.5 text-black no-underline">
                    ← Quay lại danh sách
                </Link>

                {/* HERO IMAGE */}
                {mainImage ? (
                    <img src={mainImage} alt={project.name} className="w-full h-[400px] object-cover border border-black block bg-gray-100" />
                ) : (
                    <div className="w-full h-[400px] border border-black bg-gray-100 flex items-center justify-center text-gray-400">
                        Chưa có ảnh
                    </div>
                )}

                {/* THUMBNAILS */}
                {(project.thumbnail || images.length > 0) && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                        {project.thumbnail?.url && (
                            <img
                                src={project.thumbnail.url}
                                alt="thumb"
                                className={`w-20 h-[60px] object-cover border cursor-pointer ${currentImage === 0 ? 'border-2 border-black opacity-100' : 'border-black opacity-60'}`}
                                onClick={() => setCurrentImage(0)}
                            />
                        )}
                        {images.map((img: any, i: number) => (
                            <img
                                key={i}
                                src={img.image?.url}
                                alt={`thumb-${i}`}
                                className={`w-20 h-[60px] object-cover border cursor-pointer ${currentImage === i + 1 ? 'border-2 border-black opacity-100' : 'border-black opacity-60'}`}
                                onClick={() => setCurrentImage(i + 1)}
                            />
                        ))}
                    </div>
                )}

                <h1 className="text-[32px] font-bold mt-6 mb-2">{project.name}</h1>
                {project.address && <div className="text-gray-500 text-[15px] mb-4">📍 {project.address}</div>}

                {/* PRICE BOX */}
                <div className="border border-black p-5 my-5 grid grid-cols-3 gap-5">
                    {[
                        { label: 'Giá từ', value: formatPrice(project.priceFrom) || '-' },
                        { label: 'Giá đến', value: formatPrice(project.priceTo) || '-' },
                        { label: 'Tổng số căn', value: project.totalUnits || '-' },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <div className="text-xs text-gray-500 mb-1">{label}</div>
                            <div className="text-lg font-bold">{value}</div>
                        </div>
                    ))}
                </div>

                {/* THÔNG TIN CHUNG */}
                <div className="mt-8">
                    <SectionTitle>Thông tin chung</SectionTitle>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Chủ đầu tư', value: project.investor?.name || '-' },
                            { label: 'Tổng diện tích', value: project.totalArea ? `${project.totalArea} ha` : '-' },
                            { label: 'Ngày khởi công', value: formatDate(project.startDate) },
                            { label: 'Ngày bàn giao', value: formatDate(project.completionDate) },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between py-2.5 border-b border-gray-200 text-sm">
                                <span className="text-gray-500">{label}</span>
                                <span className="font-semibold">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MÔ TẢ */}
                {project.description && (
                    <div className="mt-8">
                        <SectionTitle>Mô tả dự án</SectionTitle>
                        <div
                            className="leading-relaxed text-[15px]"
                            dangerouslySetInnerHTML={{
                                __html: typeof project.description === 'string'
                                    ? project.description
                                    : JSON.stringify(project.description),
                            }}
                        />
                    </div>
                )}

                {/* PHÂN KHU */}
                {project.zones?.length > 0 && (
                    <div className="mt-8">
                        <SectionTitle>Phân khu ({project.zones.length})</SectionTitle>
                        {project.zones.map((z: any, i: number) => (
                            <div key={i} className="border border-black p-4 mb-3">
                                <div className="font-bold text-base mb-1.5">{z.name}</div>
                                {z.description && <div className="text-gray-500 text-sm mb-2">{z.description}</div>}
                                <div className="text-xs text-gray-400">
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
