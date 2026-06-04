'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store'
import {
  selectProfile,
  selectUser,
  setAuthProfile,
  setAuthUser,
  updateAuthUser,
} from '@/app/store/slices/authSlice'
import {
  fetchCurrentUser,
  fetchMyProfile,
  updateMyAccount,
  uploadMyAvatar,
} from '@/app/services/auth'
import { AccountToast, type AccountToastState } from '../../components/AccountToast'
import { PasswordSettingsTab } from './PasswordSettingsTab'
import { ProfileInfoTab, type ProfileInfoValues } from './ProfileInfoTab'

type AccountTab = 'edit' | 'settings'

const EMPTY_VALUES: ProfileInfoValues = {
  fullName: '',
  phone: '',
  email: '',
  taxCode: '',
  invoiceName: '',
  invoiceEmail: '',
  companyName: '',
  invoiceTaxCode: '',
  budgetUnitCode: '',
  citizenId: '',
  passport: '',
  address: 'Việt Nam',
}

export function AccountSettingsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => selectUser(state))
  const profile = useSelector((state: RootState) => selectProfile(state))
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [activeTab, setActiveTab] = useState<AccountTab>('settings')
  const [values, setValues] = useState<ProfileInfoValues>(EMPTY_VALUES)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<AccountToastState>(null)

  const tabs = useMemo(
    () => [
      { key: 'edit' as const, label: 'Chỉnh sửa thông tin' },
      { key: 'settings' as const, label: 'Cài đặt tài khoản' },
    ],
    [],
  )

  useEffect(() => {
    const loadAccountData = async () => {
      const [freshUser, freshProfile] = await Promise.all([fetchCurrentUser(), fetchMyProfile()])

      if (freshUser) {
        dispatch(
          setAuthUser({
            id: freshUser.id,
            email: freshUser.email,
            role: freshUser.role,
            fullName: freshUser.fullName ?? null,
            phone: freshUser.phone ?? null,
            avatarUrl: freshUser.avatarUrl ?? freshUser.avatar_id ?? null,
            activePackage: freshUser.activePackage,
            active_package_id: freshUser.active_package_id,
          }),
        )
      }

      dispatch(setAuthProfile(freshProfile))
    }

    void loadAccountData()
  }, [dispatch])

  useEffect(() => {
    const fullName = user?.fullName || profile?.displayName || ''
    const email = user?.email || ''

    setValues((current) => ({
      ...current,
      fullName,
      phone: user?.phone || '',
      email,
      invoiceName: current.invoiceName || fullName,
      invoiceEmail: current.invoiceEmail || email,
      address: profile?.address || current.address || 'Việt Nam',
    }))
    setAvatarUrl(user?.avatarUrl || '')
  }, [profile, user])

  const displayName = values.fullName || profile?.displayName || user?.email || 'Khách hàng'
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'G'

  const handleValueChange = <TKey extends keyof ProfileInfoValues>(
    key: TKey,
    value: ProfileInfoValues[TKey],
  ) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setToast(null)
    setIsUploadingAvatar(true)

    try {
      const result = await uploadMyAvatar(file)
      setAvatarUrl(result.displayAvatarUrl)
      dispatch(updateAuthUser({ avatarUrl: result.displayAvatarUrl }))
      setToast({ message: 'Ảnh đại diện đã được cập nhật.', type: 'success' })
    } catch (uploadError) {
      setToast({
        message: uploadError instanceof Error ? uploadError.message : 'Không thể tải ảnh đại diện.',
        type: 'error',
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async () => {
    setToast(null)
    setIsSaving(true)

    try {
      const result = await updateMyAccount({
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        profile: {
          displayName: values.fullName,
          address: values.address,
        },
      })

      dispatch(
        setAuthUser({
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          fullName: result.user.fullName ?? null,
          phone: result.user.phone ?? null,
          avatarUrl: result.user.avatarUrl ?? result.user.avatar_id ?? avatarUrl,
          activePackage: result.user.activePackage,
          active_package_id: result.user.active_package_id,
        }),
      )
      dispatch(setAuthProfile(result.profile))
      setToast({ message: 'Thông tin tài khoản đã được lưu.', type: 'success' })
    } catch (saveError) {
      setToast({
        message: saveError instanceof Error ? saveError.message : 'Không thể lưu thông tin tài khoản.',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface px-4 pb-28 pt-8 text-on-surface sm:px-6 lg:px-10">
      <AccountToast toast={toast} onClose={() => setToast(null)} />
      <main className="mx-auto max-w-6xl">
        <header className="mb-10">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
            Quản lý tài khoản
          </h1>
          <p className="mt-2 text-secondary">Cập nhật thông tin cá nhân và thiết lập trải nghiệm của bạn.</p>

          <div className="mt-8 flex gap-8 overflow-x-auto border-b border-outline-variant/20 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`whitespace-nowrap pb-4 font-headline text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-secondary hover:text-on-surface'
                }`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {activeTab === 'edit' ? (
          <ProfileInfoTab
            avatarInitial={avatarInitial}
            avatarUrl={avatarUrl}
            displayName={displayName}
            fileInputRef={fileInputRef}
            isUploadingAvatar={isUploadingAvatar}
            onAvatarChange={handleAvatarChange}
            onAvatarClick={() => fileInputRef.current?.click()}
            onValueChange={handleValueChange}
            userId={user?.id}
            values={values}
          />
        ) : (
          <PasswordSettingsTab />
        )}
      </main>

      {activeTab === 'edit' ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant/20 bg-surface/90 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-4 sm:px-6 lg:px-10">
            <button className="px-6 py-2 font-headline text-sm font-bold text-secondary transition hover:text-on-surface" type="button">
              Hủy bỏ
            </button>
            <button
              className="rounded-lg bg-gradient-to-br from-primary to-primary-container px-8 py-3 font-headline text-sm font-bold text-white shadow-xl shadow-primary/20 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSaving || isUploadingAvatar}
              onClick={handleSaveProfile}
              type="button"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
