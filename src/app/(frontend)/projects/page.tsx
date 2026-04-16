'use client'

import { useEffect, useState } from 'react'
import ProjectCard from './components/ProjectCard'
import ProjectFilters from './components/ProjectFilters'
import Pagination from './components/Pagination'

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
    thumbnail?: { url?: string; filename?: string } | null
    investor?: { name?: string } | null
}

function SkeletonCard() {
    return (
        <div className="rounded-xl overflow-hidden shadow-md bg-white animate-pulse">
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-4/5" />
                <div className="h-3 bg-gray-200 rounded w-3/5" />
                <div className="h-3 bg-gray-200 rounded w-2/5 mt-4" />
            </div>
        </div>
    )
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalDocs, setTotalDocs] = useState(0)

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
            const res = await fetch(`/api/projects?limit=9&page=${page}&depth=2&sort=-createdAt${whereParam}`)
            const data = await res.json()
            setProjects(data.docs || [])
            setTotalPages(data.totalPages || 1)
            setTotalDocs(data.totalDocs || 0)
        } catch {
            alert('Lỗi tải dữ liệu')
        }
        setLoading(false)
    }

    useEffect(() => { loadProjects() }, [page])

    const handleFilter = () => {
        setPage(1)
        loadProjects()
    }

    const resetFilter = () => {
        setKeyword(''); setPropertyType(''); setStatus(''); setMinPrice(''); setMaxPrice('')
        setPage(1)
        setTimeout(loadProjects, 0)
    }

    return (
        <div className="bg-gray-50 min-h-screen text-gray-900">
            {/* HERO */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 pt-[100px] pb-12">
                <div className="max-w-[1100px] mx-auto px-5">
                    <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-2">
                        Goldenland
                    </p>
                    <h1 className="text-4xl font-bold text-white mb-2">Dự án Bất động sản</h1>
                    <p className="text-gray-400 text-base">
                        Khám phá {totalDocs > 0 ? totalDocs : ''} dự án bất động sản uy tín trên toàn quốc
                    </p>
                </div>
            </div>

            <div className="max-w-[1100px] mx-auto px-5 pb-10">
                {/* FILTER — pulled up to overlap hero */}
                <div className="-mt-6">
                    <ProjectFilters
                        keyword={keyword} propertyType={propertyType} status={status}
                        minPrice={minPrice} maxPrice={maxPrice}
                        onKeywordChange={setKeyword} onPropertyTypeChange={setPropertyType}
                        onStatusChange={setStatus} onMinPriceChange={setMinPrice} onMaxPriceChange={setMaxPrice}
                        onSubmit={handleFilter} onReset={resetFilter}
                    />
                </div>

                {/* RESULT BAR */}
                {!loading && (
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-sm text-gray-500">
                            {totalDocs > 0 ? (
                                <><span className="font-semibold text-gray-900">{totalDocs}</span> dự án được tìm thấy</>
                            ) : 'Không có dự án nào'}
                        </p>
                    </div>
                )}

                {/* GRID */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm text-gray-400">
                        <div className="text-5xl mb-4">🏗️</div>
                        <div className="font-semibold text-lg">Không tìm thấy dự án nào</div>
                        <div className="text-sm mt-1">Thử thay đổi bộ lọc để xem thêm kết quả</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
                    </div>
                )}

                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </div>
    )
}
