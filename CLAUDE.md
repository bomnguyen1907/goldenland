# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Các lệnh thường dùng

```bash
# Phát triển
pnpm dev              # Khởi động dev server (tắt fast-refresh để Payload ổn định)
pnpm devsafe          # Xóa cache .next rồi mới khởi động (dùng khi dev server bị lỗi)

# Build & Production
pnpm build
pnpm start

# Tiện ích Payload CMS
pnpm generate:types   # Tái tạo src/payload-types.ts sau khi thay đổi collections
pnpm generate:importmap

# Lint
pnpm lint

# Test
pnpm test:int         # Integration tests qua Vitest (tests/int/**/*.int.spec.ts)
pnpm test:e2e         # E2E tests qua Playwright (tests/e2e/**/*.e2e.spec.ts)

# Seed dữ liệu
pnpm seed:listings-projects
```

**Database**: PostgreSQL chạy qua Docker trên cổng 5433.
```bash
docker compose up -d db   # Chỉ khởi động database
```

**Biến môi trường bắt buộc** (`.env`):
```
DATABASE_URL=postgres://admin:secret@localhost:5433/realestate
PAYLOAD_SECRET=<chuỗi bí mật từ 32 ký tự trở lên>
```

## Kiến trúc tổng quan

Đây là **nền tảng bất động sản Việt Nam** xây dựng trên **Payload CMS 3.x** tích hợp bên trong **Next.js 16**. Payload chạy cùng tiến trình với Next.js — không có backend server riêng.

### Các nhóm route

- `src/app/(frontend)/` — Trang công khai dành cho người dùng
- `src/app/(payload)/` — Giao diện admin Payload CMS (mount tại `/admin`)

### Các tầng kiến trúc chính

| Tầng | Vị trí | Vai trò |
|---|---|---|
| Collections | `src/collections/` | Định nghĩa bảng PostgreSQL + kiểm soát truy cập + giao diện admin |
| Custom Endpoints | `src/endpoints/` | Các handler REST được đăng ký trong `payload.config.ts` |
| Kiểm soát truy cập | `src/access/index.ts` | Các hàm access tái sử dụng cho collections |
| Trang frontend | `src/app/(frontend)/` | Next.js Server Components gọi Payload local API |
| Globals | `src/app/globals/Settings.ts` | Cài đặt toàn site (1 bản ghi duy nhất) |
| Types | `src/payload-types.ts` | Tự động sinh — không chỉnh tay, chạy `generate:types` để cập nhật |

### Collections (19 tổng)

**Người dùng**: `Users`, `Profiles`
**Bất động sản**: `Listings` (bán/thuê, 6 tab trong admin), `Projects` (dự án theo phân khu), `Investors`
**Nội dung**: `Articles`, `ArticleCategories`, `Banners`
**Marketplace**: `Packages`, `PostingPrices`, `Vouchers`, `Orders`
**Hành động người dùng**: `SavedListings`, `ViewHistory`, `Notifications`, `Contacts`
**Kiểm duyệt**: `Reports`, `SpamBlacklist`
**Media**: `Media`

### Custom API endpoints (đăng ký trong `payload.config.ts`)

| Endpoint | Mục đích |
|---|---|
| `GET /api/divisions/*` | Tra cứu tỉnh/huyện/xã Việt Nam |
| `POST /api/search/listings` | Tìm kiếm tin đăng với bộ lọc và phân trang |
| `POST /api/purchase-package` | Mua gói đăng tin (trừ số dư, áp voucher) |
| `POST /api/saved-listings/toggle` | Lưu/bỏ lưu tin đăng |
| `POST /api/track-view` | Ghi lại lượt xem tin đăng |
| `GET/POST /api/notifications/*` | Đọc/đếm thông báo |
| `GET /api/my/dashboard` | Thống kê dashboard của người dùng |
| `GET /api/projects`, `GET /api/projects/:id` | Danh sách và chi tiết dự án |

### Pattern kiểm soát truy cập

Toàn bộ hàm access nằm trong `src/access/index.ts`. Các hàm chính:

- `authenticated` — yêu cầu đăng nhập
- `adminOnly` — chỉ admin
- `ownerOrAdmin(ownerField)` — chủ sở hữu tài liệu hoặc admin
- `statusOrOwnerOrAdmin(statusField, publicStatus)` — công khai nếu status khớp, owner thấy của mình, admin thấy tất cả

Dùng trực tiếp trong cấu hình `access` của collection. Để ẩn field theo vai trò, dùng `adminOnlyField`.

### Vòng đời trạng thái tin đăng (Listing)

`draft` → `pending` → `active` → `expired` | `sold` | `rejected`

Admin duyệt/từ chối tin đang chờ. Từ chối yêu cầu nhập lý do.

### Sinh types

Sau khi thay đổi schema của bất kỳ collection nào, chạy `pnpm generate:types` để cập nhật `src/payload-types.ts`. Import type từ file đó — không tự định nghĩa interface trùng lặp với Payload types.

### Fetch dữ liệu ở frontend

Các trang frontend dùng **Payload local API** (`getPayload({ config })`), không dùng `fetch` qua HTTP. Cách này tránh overhead mạng vì frontend và CMS cùng chạy trong một tiến trình.

### Testing

- Integration tests (`tests/int/`) dùng Vitest + jsdom, gọi thẳng Payload local API
- E2E tests (`tests/e2e/`) dùng Playwright, chạy trên dev server đang chạy
- Helper dùng chung trong `tests/helpers/` xử lý đăng nhập và seed user
