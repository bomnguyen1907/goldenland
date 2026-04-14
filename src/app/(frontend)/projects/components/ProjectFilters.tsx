'use client'

import { PROPERTY_TYPES, STATUS_OPTIONS } from '../utils'

type FiltersProps = {
    keyword: string
    propertyType: string
    status: string
    minPrice: string
    maxPrice: string
    onKeywordChange: (v: string) => void
    onPropertyTypeChange: (v: string) => void
    onStatusChange: (v: string) => void
    onMinPriceChange: (v: string) => void
    onMaxPriceChange: (v: string) => void
    onSubmit: () => void
    onReset: () => void
}

const inputCls = 'px-3 py-2.5 border border-black bg-white text-sm text-black rounded-none outline-none w-full'

export default function ProjectFilters({
    keyword, propertyType, status, minPrice, maxPrice,
    onKeywordChange, onPropertyTypeChange, onStatusChange,
    onMinPriceChange, onMaxPriceChange,
    onSubmit, onReset,
}: FiltersProps) {
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="border border-black p-5 mb-6 grid gap-3">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2.5">
                <input
                    className={inputCls}
                    placeholder="Tìm theo tên dự án..."
                    value={keyword}
                    onChange={(e) => onKeywordChange(e.target.value)}
                />
                <select className={inputCls} value={propertyType} onChange={(e) => onPropertyTypeChange(e.target.value)}>
                    {PROPERTY_TYPES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>
                <select className={inputCls} value={status} onChange={(e) => onStatusChange(e.target.value)}>
                    {STATUS_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>
                <input
                    className={inputCls}
                    type="number"
                    placeholder="Giá từ (triệu)"
                    value={minPrice}
                    onChange={(e) => onMinPriceChange(e.target.value)}
                />
                <input
                    className={inputCls}
                    type="number"
                    placeholder="Giá đến (triệu)"
                    value={maxPrice}
                    onChange={(e) => onMaxPriceChange(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <button type="submit" className="px-5 py-2.5 border border-black bg-black text-white text-sm font-semibold cursor-pointer">
                    Lọc kết quả
                </button>
                <button type="button" onClick={onReset} className="px-5 py-2.5 border border-black bg-white text-black text-sm font-semibold cursor-pointer">
                    Đặt lại
                </button>
            </div>
        </form>
    )
}
