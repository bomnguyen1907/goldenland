'use client'

type PaginationProps = {
    page: number
    totalPages: number
    onPageChange: (n: number) => void
}

const btnCls = 'min-w-[36px] h-9 border border-black bg-white cursor-pointer text-sm font-semibold disabled:opacity-40'

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null

    return (
        <div className="flex justify-center gap-1.5 mt-8 mb-10">
            <button className={btnCls} disabled={page === 1} onClick={() => onPageChange(page - 1)}>
                ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                    key={n}
                    className={`${btnCls} ${n === page ? 'bg-black text-white' : ''}`}
                    onClick={() => onPageChange(n)}
                >
                    {n}
                </button>
            ))}
            <button className={btnCls} disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
                ›
            </button>
        </div>
    )
}
