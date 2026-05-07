'use client'

type Props = {
  listingType: 'sale' | 'rent' | ''
  propertyType: string
  onChange: (field: 'listingType' | 'propertyType', value: string) => void
}

const LISTING_TYPES = [
  { value: 'sale', label: 'Bán', icon: '🏷️', desc: 'Đăng tin bán bất động sản' },
  { value: 'rent', label: 'Cho thuê', icon: '🔑', desc: 'Đăng tin cho thuê bất động sản' },
]

const PROPERTY_TYPES = [
  { value: 'house', label: 'Nhà riêng', icon: '🏠' },
  { value: 'apartment', label: 'Căn hộ', icon: '🏢' },
  { value: 'land', label: 'Đất', icon: '🗺️' },
  { value: 'villa', label: 'Biệt thự', icon: '🏡' },
  { value: 'townhouse', label: 'Nhà phố', icon: '🏘️' },
  { value: 'shophouse', label: 'Shophouse', icon: '🏪' },
  { value: 'penthouse', label: 'Penthouse', icon: '🌇' },
  { value: 'condotel', label: 'Condotel', icon: '🏨' },
  { value: 'warehouse', label: 'Kho xưởng', icon: '🏭' },
  { value: 'commercial', label: 'Thương mại', icon: '🏬' },
]

export default function Step1Type({ listingType, propertyType, onChange }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Loại giao dịch</h2>
        <div className="grid grid-cols-2 gap-3">
          {LISTING_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange('listingType', t.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 transition ${
                listingType === t.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="font-semibold text-sm">{t.label}</span>
              <span className="text-xs text-gray-400">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Loại bất động sản</h2>
        <div className="grid grid-cols-5 gap-2">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange('propertyType', t.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition ${
                propertyType === t.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
