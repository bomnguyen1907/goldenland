'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff, LockKeyhole, Trash2 } from 'lucide-react'
import { changeMyPassword } from '@/app/services/auth'
import { AccountToast, type AccountToastState } from '../../components/AccountToast'

type PasswordKey = 'currentPassword' | 'newPassword' | 'confirmPassword'

function PasswordInput({
  label,
  value,
  visible,
  onChange,
  onToggle,
}: {
  label: string
  value: string
  visible: boolean
  onChange: (value: string) => void
  onToggle: () => void
}) {
  const Icon = visible ? Eye : EyeOff

  return (
    <div className="flex flex-col gap-2">
      <label className="font-headline text-sm font-bold">{label}</label>
      <div className="relative">
        <input
          className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-2.5 pr-12 text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          onChange={(event) => onChange(event.target.value)}
          type={visible ? 'text' : 'password'}
          value={value}
        />
        <button
          aria-label={visible ? 'Mật khẩu đang hiển thị' : 'Mật khẩu đang ẩn'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface"
          onClick={onToggle}
          type="button"
          title={visible ? 'Mật khẩu đang hiển thị' : 'Mật khẩu đang ẩn'}
        >
          <Icon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function PasswordSettingsTab() {
  const [values, setValues] = useState<Record<PasswordKey, string>>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [visible, setVisible] = useState<Record<PasswordKey, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<AccountToastState>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteConfirmSeconds, setDeleteConfirmSeconds] = useState(5)

  useEffect(() => {
    if (!isDeleteConfirmOpen) return

    setDeleteConfirmSeconds(5)
    const timer = window.setInterval(() => {
      setDeleteConfirmSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isDeleteConfirmOpen])

  const updateValue = (key: PasswordKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const toggleVisible = (key: PasswordKey) => {
    setVisible((current) => ({ ...current, [key]: !current[key] }))
  }

  const handleChangePassword = async () => {
    setToast(null)

    if (!values.currentPassword || !values.newPassword || !values.confirmPassword) {
      setToast({ message: 'Vui lòng nhập đầy đủ mật khẩu.', type: 'error' })
      return
    }

    if (values.newPassword !== values.confirmPassword) {
      setToast({ message: 'Mật khẩu mới và xác nhận mật khẩu không khớp.', type: 'error' })
      return
    }

    if (values.newPassword.length < 8) {
      setToast({ message: 'Mật khẩu mới phải có tối thiểu 8 ký tự.', type: 'error' })
      return
    }

    if (!/[A-Z]/.test(values.newPassword)) {
      setToast({ message: 'Mật khẩu mới phải có ít nhất 1 ký tự viết hoa.', type: 'error' })
      return
    }

    if (!/[0-9]/.test(values.newPassword)) {
      setToast({ message: 'Mật khẩu mới phải có ít nhất 1 ký tự số.', type: 'error' })
      return
    }

    setIsSaving(true)
    try {
      await changeMyPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setToast({ message: 'Mật khẩu đã được cập nhật.', type: 'success' })
    } catch (changeError) {
      setToast({
        message: changeError instanceof Error ? changeError.message : 'Không thể đổi mật khẩu.',
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <AccountToast toast={toast} onClose={() => setToast(null)} />

      <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <LockKeyhole className="h-5 w-5 text-primary" />
          <h3 className="font-headline text-xl font-bold">Đổi mật khẩu</h3>
        </div>

        <div className="max-w-2xl space-y-6">
          <PasswordInput
            label="Mật khẩu hiện tại"
            onChange={(value) => updateValue('currentPassword', value)}
            onToggle={() => toggleVisible('currentPassword')}
            value={values.currentPassword}
            visible={visible.currentPassword}
          />
          <PasswordInput
            label="Mật khẩu mới"
            onChange={(value) => updateValue('newPassword', value)}
            onToggle={() => toggleVisible('newPassword')}
            value={values.newPassword}
            visible={visible.newPassword}
          />
          <PasswordInput
            label="Nhập lại mật khẩu mới"
            onChange={(value) => updateValue('confirmPassword', value)}
            onToggle={() => toggleVisible('confirmPassword')}
            value={values.confirmPassword}
            visible={visible.confirmPassword}
          />

          <button
            className="rounded-lg bg-primary px-6 py-2.5 font-headline text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            onClick={handleChangePassword}
            type="button"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>

          <div className="mt-4 space-y-1 text-xs text-secondary">
            <p>• Mật khẩu tối thiểu 8 ký tự</p>
            <p>• Chứa ít nhất 1 ký tự viết hoa</p>
            <p>• Chứa ít nhất 1 ký tự số</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-error" />
          <h3 className="font-headline text-xl font-bold">Yêu cầu xóa tài khoản</h3>
        </div>
        <p className="mb-5 max-w-2xl text-sm text-secondary">
          Hành động này là vĩnh viễn. Tất cả dữ liệu sở hữu và lịch sử giao dịch sẽ bị xóa khỏi hệ thống.
        </p>
        <button
          className="inline-flex items-center rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-error/90"
          onClick={() => setIsDeleteConfirmOpen(true)}
          type="button"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Xóa tài khoản vĩnh viễn
        </button>
      </section>

      {isDeleteConfirmOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[9999px] bg-error/10">
                <Trash2 className="h-5 w-5 text-error" />
              </span>
              <h3 className="font-headline text-xl font-bold text-on-surface">Xác nhận xóa tài khoản</h3>
            </div>
            <p className="text-sm leading-6 text-secondary">
              Yêu cầu xóa tài khoản là hành động nghiêm trọng. Sau khi xác nhận, đội ngũ hỗ trợ sẽ xử lý yêu cầu theo quy trình và dữ liệu liên quan có thể bị xóa vĩnh viễn.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-lg border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-surface-container"
                onClick={() => setIsDeleteConfirmOpen(false)}
                type="button"
              >
                Hủy
              </button>
              <button
                className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white transition hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={deleteConfirmSeconds > 0}
                onClick={() => {
                  setIsDeleteConfirmOpen(false)
                  setToast({ message: 'Yêu cầu xóa tài khoản đã được ghi nhận.', type: 'success' })
                }}
                type="button"
              >
                {deleteConfirmSeconds > 0 ? `OK sau ${deleteConfirmSeconds}s` : 'OK'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
