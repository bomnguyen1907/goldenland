import { PropertyGridItem, type PropertyItem } from '../../../components/PropertyGridItem'

export function ForYouSection({ properties }: { properties: PropertyItem[] }) {
  if (properties.length === 0) {
    return null
  }

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-headline font-semibold tracking-tight text-on-background">
          Bất động sản dành cho bạn
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((item) => (
          <PropertyGridItem key={item.id} property={item} />
        ))}
      </div>
    </section>
  )
}
