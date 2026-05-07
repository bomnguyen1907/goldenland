'use client'

import { useEffect, useState } from 'react'
import type { FormData } from '../page'

type Province = { code: string; name: string }
type Ward = { code: string; name: string }

type Props = {
  data: FormData
  onChange: (field: keyof FormData, value: string) => void
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
    />
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
    />
  )
}

export default function Step3Location({ data, onChange }: Props) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadingWards, setLoadingWards] = useState(false)

  useEffect(() => {
    fetch('/api/divisions/provinces')
      .then((r) => r.json())
      .then(setProvinces)
      .catch(() => {})
      .finally(() => setLoadingProvinces(false))
  }, [])

  useEffect(() => {
    if (!data.provinceCode) {
      setWards([])
      return
    }
    setLoadingWards(true)
    fetch(`/api/divisions/wards/${data.provinceCode}`)
      .then((r) => r.json())
      .then(setWards)
      .catch(() => setWards([]))
      .finally(() => setLoadingWards(false))
  }, [data.provinceCode])

  const handleProvinceChange = (code: string) => {
    onChange('provinceCode', code)
    onChange('wardCode', '')
    updateAddress({ provinceCode: code, wardCode: '' })
  }

  const handleWardChange = (code: string) => {
    onChange('wardCode', code)
    updateAddress({ wardCode: code })
  }

  const updateAddress = (overrides: Partial<FormData>) => {
    const provinceName = provinces.find(
      (p) => p.code === (overrides.provinceCode ?? data.provinceCode),
    )?.name || ''
    const wardName = wards.find(
      (w) => w.code === (overrides.wardCode ?? data.wardCode),
    )?.name || ''
    const street = data.street || ''

    const parts = [street, wardName, provinceName].filter(Boolean)
    onChange('address', parts.join(', '))
  }

  const handleStreetChange = (value: string) => {
    onChange('street', value)
    const provinceName = provinces.find((p) => p.code === data.provinceCode)?.name || ''
    const wardName = wards.find((w) => w.code === data.wardCode)?.name || ''
    const parts = [value, wardName, provinceName].filter(Boolean)
    onChange('address', parts.join(', '))
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Tỉnh / Thành phố</Label>
          <Select
            value={data.provinceCode}
            onChange={(e) => handleProvinceChange(e.target.value)}
            disabled={loadingProvinces}
          >
            <option value="">{loadingProvinces ? 'Đang tải...' : '-- Chọn tỉnh/thành --'}</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Phường / Xã</Label>
          <Select
            value={data.wardCode}
            onChange={(e) => handleWardChange(e.target.value)}
            disabled={!data.provinceCode || loadingWards}
          >
            <option value="">
              {loadingWards ? 'Đang tải...' : !data.provinceCode ? '-- Chọn tỉnh trước --' : '-- Chọn phường/xã --'}
            </option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label>Tên đường / Số nhà</Label>
        <Input
          type="text"
          maxLength={255}
          placeholder="VD: 123 Nguyễn Trãi"
          value={data.street}
          onChange={(e) => handleStreetChange(e.target.value)}
        />
      </div>

      <div>
        <Label>Địa chỉ đầy đủ</Label>
        <Input
          type="text"
          maxLength={500}
          placeholder="Tự động điền hoặc nhập thủ công"
          value={data.address}
          onChange={(e) => onChange('address', e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1">Địa chỉ này sẽ hiển thị công khai trong tin đăng</p>
      </div>
    </div>
  )
}
