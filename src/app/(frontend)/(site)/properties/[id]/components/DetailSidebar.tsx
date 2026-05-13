import type { Property, User } from '@/payload-types'

export function ContactCard({ property }: { property: Property }) {
  const userData = typeof property.user === 'object' ? (property.user as User) : null

  const displayName = userData?.fullName || userData?.email || 'Người đăng'
  const displayAvatar =
    userData?.fullName?.charAt(0).toUpperCase() ||
    (userData?.email ? userData.email.charAt(0).toUpperCase() : 'U')
  const phoneNumber = userData?.phone || '09xx xxx xxx'

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_12px_32px_rgba(27,28,28,0.06)] border border-outline-variant/15 relative z-10 overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-surface bg-surface-container-highest">
          {userData?.avatar_id ? (
            <img
              src={userData.avatar_id}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-surface-container flex items-center justify-center text-secondary font-bold">
              {displayAvatar}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-headline font-semibold text-lg text-on-surface tracking-tight">
            {displayName}
          </h3>
          <p className="text-sm text-on-secondary-container font-label">Chuyên viên tư vấn</p>
        </div>
      </div>
      <button
        className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-3 px-4 rounded-md font-lexend font-medium tracking-tight hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mb-4 shadow-[0px_4px_12px_rgba(181,27,23,0.2)]"
        type="button"
      >
        <span
          className="material-symbols-outlined text-xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          call
        </span>
        {phoneNumber} 
      </button>
      <button
        className="w-full bg-transparent border border-primary text-primary py-3 px-4 rounded-md font-lexend font-medium tracking-tight hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
        type="button"
      >
        <span className="material-symbols-outlined text-xl">chat</span>
        Chat Zalo
      </button>
    </div>
  )
}

export function ConsultationForm() {
  return (
    <div className="bg-surface-container-low rounded-xl p-6 shadow-sm border border-outline-variant/15">
      <h4 className="font-headline font-semibold text-on-surface mb-4 tracking-tight">
        Yêu cầu tư vấn
      </h4>
      <form className="space-y-4">
        <div>
          <input
            className="w-full rounded-md border-outline-variant/30 bg-surface-container-lowest px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary font-body text-on-surface placeholder:text-on-surface-variant/50"
            placeholder="Họ và tên"
            type="text"
          />
        </div>
        <div>
          <input
            className="w-full rounded-md border-outline-variant/30 bg-surface-container-lowest px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary font-body text-on-surface placeholder:text-on-surface-variant/50"
            placeholder="Số điện thoại"
            type="tel"
          />
        </div>
        <div>
          <input
            className="w-full rounded-md border-outline-variant/30 bg-surface-container-lowest px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary font-body text-on-surface placeholder:text-on-surface-variant/50"
            placeholder="Email"
            type="email"
          />
        </div>
        <div>
          <textarea
            className="w-full rounded-md border-outline-variant/30 bg-surface-container-lowest px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary font-body text-on-surface placeholder:text-on-surface-variant/50 resize-none"
            placeholder="Lời nhắn..."
            rows={3}
          ></textarea>
        </div>
        <button
          className="w-full bg-surface-variant text-on-surface py-2.5 px-4 rounded-md font-lexend font-medium text-sm tracking-tight hover:bg-surface-dim transition-colors"
          type="button"
        >
          Gửi yêu cầu
        </button>
      </form>
    </div>
  )
}
