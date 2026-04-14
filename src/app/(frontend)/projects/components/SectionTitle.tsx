export default function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-xl font-bold border-b-2 border-black pb-2 mb-4">
            {children}
        </div>
    )
}
