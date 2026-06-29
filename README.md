# GoldenLand — Nền tảng Bất động sản

Website đăng tin & quản lý bất động sản, xây dựng trên **Payload CMS 3** + **Next.js 16**, với cơ sở dữ liệu PostgreSQL (Supabase) và lưu trữ ảnh trên Supabase Storage (S3). Hỗ trợ đăng tin nhà đất/dự án, gói đăng tin trả phí qua **PayOS**, và tự động cào tin tức BĐS từ các nguồn RSS.

## 🔗 Demo & Tài khoản dùng thử

| | Đường dẫn |
|---|---|
| Website | https://goldenland-five.vercel.app |
| Trang quản trị (Payload Admin) | https://goldenland-five.vercel.app/admin |
| Dashboard quản trị | https://goldenland-five.vercel.app/quan-tri |

**Tài khoản dùng thử:**

| Vai trò | Email | Mật khẩu | Dùng để |
|---|---|---|---|
| Người dùng thường | `user20@goldenland.vn` | `goldenland@2024` | Test giao diện website, đăng tin, tài khoản |
| Quản trị viên | `admin@gmail.com` | `Admin@123` | Test trang quản trị `/admin`, `/quan-tri` |

> 👉 Để test thông thường, hãy dùng **tài khoản người dùng thường** (`user20@goldenland.vn`).
>
> ⚠️ **Lưu ý bảo mật**: tài khoản `admin@gmail.com` có **toàn quyền** trên dữ liệu production — chỉ chia sẻ nội bộ, không nên để trong repo công khai. Có thể đặt lại mật khẩu admin bằng `scripts/resetAdminPassword.ts`.

## Công nghệ sử dụng

| Mảng | Công nghệ |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React 19) |
| CMS / Backend | [Payload CMS 3.81](https://payloadcms.com) |
| Database | PostgreSQL (Supabase) — `@payloadcms/db-postgres` |
| Lưu trữ ảnh | Supabase Storage (S3-compatible) — `@payloadcms/storage-s3` |
| Thanh toán | [PayOS](https://payos.vn) — `@payos/node` |
| State | Redux Toolkit + React Redux |
| Form | React Hook Form + Zod |
| Bản đồ | Leaflet |
| UI | Tailwind CSS, lucide-react, Embla Carousel |
| Cào tin tức | rss-parser + cheerio |
| Testing | Vitest (integration) + Playwright (e2e) |
| Package manager | pnpm |

## Tính năng chính

- **Quản lý tin đăng**: tin nhà đất (`Properties`), dự án (`Projects`), chủ đầu tư (`Investors`)
- **Tài khoản & hồ sơ**: `Users` (xác thực + phân quyền), `Profiles`, lịch sử xem (`ViewHistory`), tin yêu thích (`Favorites`)
- **Đăng tin trả phí**: bảng giá đăng tin (`PostingPrices`), gói (`Packages`), đơn hàng (`Orders`), mã giảm giá (`Vouchers`), khuyến mãi (`Promotions`) — thanh toán qua PayOS
- **Tin tức**: bài viết (`Articles`), danh mục (`ArticleCategories`), tự động cào & phân loại từ VnExpress / Dân Trí / Vietnamnet (`/api/crawl`)
- **Vận hành**: liên hệ (`Contacts`), báo cáo tin (`Reports`), thông báo (`Notifications`), chặn spam (`SpamBlacklist`)
- **Admin Panel** của Payload tại `/admin`

## Yêu cầu môi trường

- Node.js `^18.20.2 || >=20.9.0`
- pnpm `^9 || ^10`
- Một database PostgreSQL (khuyến nghị Supabase)

## Cài đặt & chạy local

```bash
# 1. Cài dependencies
pnpm install

# 2. Tạo file .env từ mẫu
cp .env.example .env
#   → điền DATABASE_URL, PAYLOAD_SECRET, S3_*, ... (xem phần Biến môi trường)

# 3. Chạy dev server
pnpm dev
```

Mở http://localhost:3000 cho website, và http://localhost:3000/admin cho trang quản trị. Lần đầu vào `/admin` sẽ được yêu cầu tạo tài khoản admin đầu tiên.

> Thay đổi trong `./src` sẽ tự động cập nhật (hot reload).

## Biến môi trường

Tham khảo [`.env.example`](.env.example). Các biến quan trọng:

| Biến | Mô tả |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL/Supabase |
| `PAYLOAD_SECRET` | Khóa bí mật của Payload (bắt buộc) |
| `NEXT_PUBLIC_SERVER_URL` | URL công khai của site (local: `http://localhost:3000`) |
| `PAYLOAD_PUBLIC_SERVER_URL` | URL công khai cho Payload |
| `SUPABASE_URL` | URL project Supabase (cho cào tin & upload ảnh) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key của Supabase |
| `S3_BUCKET` / `S3_ENDPOINT` / `S3_REGION` | Cấu hình bucket lưu media |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Khóa truy cập S3 |
| `PAYOS_CLIENT_ID` / `PAYOS_API_KEY` / `PAYOS_CHECKSUM_KEY` | Thông tin PayOS |
| `PAYOS_RETURN_URL` / `PAYOS_CANCEL_URL` | URL redirect sau thanh toán |

> ⚠️ File `.env` đã được `.gitignore` — **không commit secret lên git**.

## Các lệnh thường dùng

```bash
pnpm dev                 # Chạy dev server
pnpm build               # Build production
pnpm start               # Chạy bản production đã build
pnpm lint                # ESLint
pnpm generate:types      # Sinh lại payload-types.ts sau khi đổi schema
pnpm generate:importmap  # Sinh lại import map cho admin components

# Seed dữ liệu mẫu
pnpm seed:posting-prices     # Bảng giá đăng tin
pnpm seed:properties-full    # Tin BĐS đầy đủ
pnpm seed:projects30         # 30 dự án mẫu
pnpm seed:listings-projects  # Tin + dự án

# Migrate / sửa dữ liệu
pnpm migrate:posting-prices           # Migrate schema bảng giá
pnpm fix:property-addresses           # Chuẩn hóa địa chỉ
pnpm fix:property-public-coords       # Cập nhật tọa độ công khai
pnpm sync:property-location-content   # Đồng bộ nội dung vị trí
pnpm sync:property-project-locations  # Đồng bộ vị trí dự án

# Test
pnpm test       # Chạy cả integration + e2e
pnpm test:int   # Vitest (integration)
pnpm test:e2e   # Playwright (e2e)
```

> Sau khi thay đổi schema collection/field, chạy `pnpm generate:types`. Sau khi thêm/sửa admin component, chạy `pnpm generate:importmap`.

## Cấu trúc thư mục

```
src/
├── app/
│   ├── (frontend)/      # Giao diện website (route nhóm)
│   ├── (payload)/       # Admin panel của Payload
│   ├── api/crawl/       # API cào tin tức BĐS từ RSS
│   ├── lib/             # Tiện ích (http client, api helpers)
│   ├── services/        # Lớp gọi API phía client
│   └── store/           # Redux store
├── collections/         # 19 collection (Properties, Projects, Users, ...)
├── globals/             # Settings (cấu hình toàn cục)
├── endpoints/           # Custom endpoint (account, admin, billing, properties, public)
├── lib/                 # Tích hợp bên thứ ba (payos, ...)
└── payload.config.ts    # Cấu hình chính của Payload
scripts/                 # Script seed / migrate / fix dữ liệu
```

## Triển khai (Vercel)

Project được triển khai trên **Vercel**.

1. **Khai báo Environment Variables** trên Vercel (Settings → Environment Variables) — đầy đủ các biến ở phần trên. Các biến URL phải trỏ về domain production (không có dấu `/` ở cuối).
2. Production track nhánh **`main`** — merge code vào `main` để deploy lên production.
3. Build command mặc định: `pnpm build`. Khi đổi env, cần **Redeploy** để có hiệu lực (biến `NEXT_PUBLIC_*` được nhúng lúc build).

> Lưu ý serverless + PostgreSQL: nếu gặp lỗi "too many connections", chuyển `DATABASE_URL` sang **transaction pooler (port 6543)** của Supabase và thêm `?pgbouncer=true`.

## Tài liệu phát triển

- Quy ước phát triển Payload (access control, hooks, security...) xem trong [`AGENTS.md`](AGENTS.md).
- Tài liệu Payload: https://payloadcms.com/docs
- Tài liệu Next.js: https://nextjs.org/docs