'use client'

import Image from 'next/image'
import { RotateCcw, Upload } from 'lucide-react'

type FieldProps = {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  action?: React.ReactNode
  className?: string
}

function Field({ label, type = 'text', value, onChange, action, className = '' }: FieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="font-headline text-sm font-semibold text-on-surface">{label}</label>
      <div className="relative">
        <input
          className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          onChange={(event) => onChange(event.target.value)}
          type={type}
          value={value}
        />
        {action}
      </div>
    </div>
  )
}

export type ProfileInfoValues = {
  fullName: string
  phone: string
  email: string
  taxCode: string
  invoiceName: string
  invoiceEmail: string
  companyName: string
  invoiceTaxCode: string
  budgetUnitCode: string
  citizenId: string
  passport: string
  address: string
}

type Props = {
  avatarInitial: string
  avatarUrl: string
  displayName: string
  fileInputRef: React.RefObject<HTMLInputElement | null>
  isUploadingAvatar: boolean
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onAvatarClick: () => void
  onValueChange: <TKey extends keyof ProfileInfoValues>(key: TKey, value: ProfileInfoValues[TKey]) => void
  userId?: string | number
  values: ProfileInfoValues
}

export function ProfileInfoTab({
  avatarInitial,
  avatarUrl,
  displayName,
  fileInputRef,
  isUploadingAvatar,
  onAvatarChange,
  onAvatarClick,
  onValueChange,
  userId,
  values,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <section className="rounded-xl bg-surface-container-lowest p-8 text-center md:col-span-12">
        <input
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={onAvatarChange}
          type="file"
        />
        <button
          aria-label="Tải ảnh đại diện"
          className="group relative inline-flex disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isUploadingAvatar}
          onClick={onAvatarClick}
          type="button"
        >
          <span className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[9999px] border-2 border-dashed border-outline-variant bg-surface-container-low transition group-hover:bg-surface-container">
            {avatarUrl ? (
              <Image
                alt={displayName}
                className="object-cover"
                fill
                sizes="128px"
                src={avatarUrl}
                unoptimized
              />
            ) : (
              <span className="text-4xl font-bold text-primary">{avatarInitial}</span>
            )}
          </span>
          <span className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-[9999px] border-2 border-white bg-primary text-white shadow-lg">
            {isUploadingAvatar ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </span>
        </button>
      </section>

      <section className="space-y-10 rounded-xl bg-surface-container-lowest p-8 md:col-span-12">
        <div className="space-y-6">
          <h2 className="font-headline text-lg font-bold text-on-surface">Thông tin cá nhân</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="Họ và tên" onChange={(value) => onValueChange('fullName', value)} value={values.fullName} />
            <Field label="Mã số thuế cá nhân" onChange={(value) => onValueChange('taxCode', value)} value={values.taxCode} />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-headline text-lg font-bold text-on-surface">Thông tin liên hệ</h2>
          <div className="space-y-4">
            <Field label="Số điện thoại chính" onChange={(value) => onValueChange('phone', value)} type="tel" value={values.phone} />
            <div>
              <Field
                action={
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 font-headline text-sm font-semibold text-primary" type="button">
                    Xác thực
                  </button>
                }
                label="Email"
                onChange={(value) => onValueChange('email', value)}
                type="email"
                value={values.email}
              />
              <p className="mt-1 text-xs text-secondary">
                Cập nhật Email để nhận thông báo về tin đăng của bạn và CTKM từ Golden Land.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8 rounded-xl bg-surface-container-lowest p-8 md:col-span-12">
        <h2 className="font-headline text-2xl font-bold text-on-surface">Thông tin xuất hoá đơn</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Họ tên người mua hàng" onChange={(value) => onValueChange('invoiceName', value)} value={values.invoiceName} />
          <Field label="Email nhận hóa đơn" onChange={(value) => onValueChange('invoiceEmail', value)} type="email" value={values.invoiceEmail} />
          <Field className="md:col-span-2" label="Tên đơn vị (Tên công ty)" onChange={(value) => onValueChange('companyName', value)} value={values.companyName} />
          <Field label="Mã số thuế" onChange={(value) => onValueChange('invoiceTaxCode', value)} value={values.invoiceTaxCode} />
          <Field label="Mã số ĐVQHNS" onChange={(value) => onValueChange('budgetUnitCode', value)} value={values.budgetUnitCode} />
          <Field label="Căn cước công dân" onChange={(value) => onValueChange('citizenId', value)} value={values.citizenId} />
          <Field label="Số hộ chiếu" onChange={(value) => onValueChange('passport', value)} value={values.passport} />
          <Field className="md:col-span-2" label="Địa chỉ" onChange={(value) => onValueChange('address', value)} value={values.address} />
        </div>
      </section>
    </div>
  )
}
