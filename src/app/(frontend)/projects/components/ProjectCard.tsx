import Link from 'next/link'
import { formatPrice, PROPERTY_TYPES } from '../utils'

type Project = {
    id: number
    name: string
    address?: string
    priceFrom?: number
    priceTo?: number
    totalArea?: number
    totalUnits?: number
    status?: string
    propertyTypes?: string[]
    thumbnail?: { url?: string } | null
    investor?: { name?: string } | null
}

export default function ProjectCard({ project: p }: { project: Project }) {
    const imgUrl = p.thumbnail?.url || null

    return (
        <Link
            href={`/projects/${p.id}`}
            className="grid grid-cols-[280px_1fr] gap-5 border border-black mb-4 no-underline text-black bg-white hover:bg-gray-50 transition-colors"
        >
            {imgUrl ? (
                <img src={imgUrl} alt={p.name} className="w-full h-[200px] object-cover block bg-gray-100" />
            ) : (
                <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    Chưa có ảnh
                </div>
            )}
            <div className="py-4 pr-5 flex flex-col justify-between">
                <div>
                    <div className="mb-2">
                        {p.status === 'active' && (
                            <span className="inline-block px-2 py-0.5 border border-black text-[11px] font-semibold uppercase mr-1.5">
                                Đang mở bán
                            </span>
                        )}
                        {p.propertyTypes?.slice(0, 2).map((t) => (
                            <span key={t} className="inline-block px-2 py-0.5 border border-black text-[11px] font-semibold uppercase mr-1.5">
                                {PROPERTY_TYPES.find((x) => x.value === t)?.label || t}
                            </span>
                        ))}
                    </div>
                    <div className="text-lg font-bold mb-1.5 leading-snug">{p.name}</div>
                    {p.address && <div className="text-sm text-gray-500 mb-1">📍 {p.address}</div>}
                    {p.investor?.name && (
                        <div className="text-sm text-gray-500">Chủ đầu tư: {p.investor.name}</div>
                    )}
                </div>
                {(p.priceFrom || p.priceTo) && (
                    <div className="text-base font-bold mt-3">
                        {p.priceFrom && p.priceTo
                            ? `${formatPrice(p.priceFrom)} - ${formatPrice(p.priceTo)}`
                            : formatPrice(p.priceFrom || p.priceTo)}
                    </div>
                )}
                <div className="flex gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                    {p.totalArea && <div>Diện tích: {p.totalArea} ha</div>}
                    {p.totalUnits && <div>Số căn: {p.totalUnits}</div>}
                </div>
            </div>
        </Link>
    )
}
