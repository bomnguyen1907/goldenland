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
            const res = await fetch(`/api/projects?limit=10&page=${page}&depth=2&sort=-createdAt${whereParam}`)
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
        <div className="bg-white min-h-screen text-black">
            <div className="border-b border-black py-5 mb-8">
                <div className="max-w-[1100px] mx-auto px-5 pt-[50px]">
                    <h1 className="text-[28px] font-bold tracking-tight">Dự án Bất động sản</h1>
                    <div className="text-sm text-gray-500 mt-1">
                        {totalDocs > 0 ? `${totalDocs} dự án` : 'Danh sách dự án'}
                    </div>
                </div>
            </div>

            <div className="max-w-[1100px] mx-auto px-5 pb-5">
                <ProjectFilters
                    keyword={keyword} propertyType={propertyType} status={status}
                    minPrice={minPrice} maxPrice={maxPrice}
                    onKeywordChange={setKeyword} onPropertyTypeChange={setPropertyType}
                    onStatusChange={setStatus} onMinPriceChange={setMinPrice} onMaxPriceChange={setMaxPrice}
                    onSubmit={handleFilter} onReset={resetFilter}
                />

                {loading ? (
                    <div className="text-center py-16 border border-black text-gray-500">Đang tải...</div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-16 border border-black text-gray-500">Không tìm thấy dự án nào</div>
                ) : (
                    projects.map((p) => <ProjectCard key={p.id} project={p} />)
                )}

                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </div>
    )
}
