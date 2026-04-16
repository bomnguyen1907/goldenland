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

const inputCls = 'px-3 py-2.5 border border-gray-200 bg-white text-sm text-gray-900 rounded-lg outline-none w-full focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition'
const selectCls = 'px-3 py-2.5 border border-gray-200 bg-white text-sm text-gray-900 rounded-lg outline-none w-full focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition appearance-none cursor-pointer'

export default function ProjectFilters({
    keyword, propertyType, status, minPrice, maxPrice,
    onKeywordChange, onPropertyTypeChange, onStatusChange,
    onMinPriceChange, onMaxPriceChange,
    onSubmit, onReset,
}: FiltersProps) {
    return (
        <form
            onSubmit={(e) => { e.preventDefault(); onSubmit() }}
            className="bg-white rounded-2xl shadow-lg p-5 mb-8"
        >
            <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3">
                {/* Search with icon */}
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        className="pl-9 pr-3 py-2.5 border border-gray-200 bg-white text-sm text-gray-900 rounded-lg outline-none w-full focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                        placeholder="Tìm theo tên dự án..."
                        value={keyword}
                        onChange={(e) => onKeywordChange(e.target.value)}
                    />
                </div>

                <select className={selectCls} value={propertyType} onChange={(e) => onPropertyTypeChange(e.target.value)}>
                    {PROPERTY_TYPES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                </select>

                <select className={selectCls} value={status} onChange={(e) => onStatusChange(e.target.value)}>
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

            <div className="flex gap-2 mt-4">
                <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
                >
                    Tìm kiếm
                </button>
                <button
                    type="button"
                    onClick={onReset}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition cursor-pointer"
                >
                    Đặt lại
                </button>
            </div>
        </form>
    )
}
