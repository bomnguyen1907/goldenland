# API Organization Guidelines

Tài liệu này ghi lại quy tắc tổ chức API cho dự án Golden Land khi dùng Payload CMS + Next.js frontend. Mục tiêu là giữ backend dễ nhìn, frontend fetch đồng bộ, và tránh lẫn lộn giữa Payload native REST API với custom application endpoints.

## Nguyên Tắc Tổng Quát

Backend không nên chọn cực đoan "tất cả dùng Payload querystring" hoặc "tất cả viết custom endpoint". Dự án nên chia API thành 3 lớp rõ vai trò:

1. Payload native resource API
2. App read/search API
3. App command API

Câu hỏi quyết định:

> Query này do user điều khiển linh hoạt, hay do hệ thống/business rule quyết định?

User điều khiển linh hoạt thì ưu tiên Payload querystring hoặc app search endpoint có allow-list. Business rule, bảo mật, aggregate, multi-step mutation thì dùng custom endpoint.

## 1. Payload Native Resource API

Dùng native Payload REST API cho CRUD/query đơn giản theo collection:

```txt
GET /api/properties
GET /api/properties/:id
GET /api/users/me
POST /api/media
GET /api/articles?where=...
```

Chỉ dùng trực tiếp khi:

- Collection access đã đúng.
- Không cần response format đặc biệt.
- Không cần business rule nhiều bước.
- Query chỉ là filter/sort/pagination đơn giản.
- FE không cần chạm vào field nhạy cảm.

Ví dụ phù hợp:

```ts
payloadApi.find('properties', {
  where: {
    status: { equals: 'active' },
  },
  sort: '-createdAt',
  depth: 2,
})
```

Lưu ý bảo mật: access control của collection vẫn là nguồn sự thật chính. Khi gọi Local API trong backend và có truyền user/req, luôn cân nhắc `overrideAccess: false`.

## 2. App Read/Search API

Dùng custom endpoint cho các API đọc có contract riêng của app:

```txt
GET /api/search/properties
GET /api/search/properties/filters
GET /api/search/projects
GET /api/search/news
GET /api/my/dashboard
GET /api/admin/dashboard-stats
```

Dùng khi:

- Backend cần ép điều kiện cố định như `status=active`.
- Cần giới hạn `limit`, whitelist `sort`, whitelist filter.
- Cần aggregate/count/group/filter options.
- Cần response format ổn định cho UI.
- Cần enrich dữ liệu từ collection khác.
- Không muốn FE gửi Payload `where` tùy ý.

Quy tắc:

- Querystring của app endpoint phải là contract riêng, đơn giản và được allow-list.
- Backend tự build Payload `where`.
- Không pass nguyên Payload query DSL từ FE vào app endpoint nếu không kiểm soát.
- Response nên có shape thống nhất:

```ts
{
  success: true,
  data,
  pagination: {
    page,
    totalPages,
    totalDocs,
    limit,
    hasNextPage,
    hasPrevPage,
  },
}
```

## 3. App Command API

Dùng custom endpoint cho hành động nghiệp vụ hoặc mutation nhiều bước:

```txt
POST /api/me/favorites
DELETE /api/me/favorites/:property_id
POST /api/me/favorites/bulk
PATCH /api/me/profile
POST /api/me/avatar
POST /api/me/change-password
POST /api/post-flow/submit
POST /api/property-reports/submit
POST /api/top-up
GET /api/top-up-status/:id
POST /api/purchase-package
POST /api/payos-webhook
POST /api/properties/:id/view
```

Dùng khi:

- Có validate input.
- Có authentication/authorization riêng.
- Có nhiều thao tác DB trong một use case.
- Có thanh toán, upload, voucher, balance, notification.
- Cần idempotency hoặc xử lý duplicate.
- Cần ẩn chi tiết schema Payload khỏi frontend.

Quy tắc:

- Endpoint command nhận body rõ ràng, không nhận Payload `where`.
- Luôn validate body trước khi gọi database.
- Các nested Local API operations trong hook hoặc transaction-sensitive flow phải truyền `req`.
- Khi Local API cần áp access theo user hiện tại, dùng `overrideAccess: false`.
- Chỉ dùng `overrideAccess: true` khi đó là admin/system operation có chủ đích, và nên comment ngắn lý do.

## Backend Folder Structure Đề Xuất

Giữ cấu trúc chuẩn của Payload: collection ở `src/collections`, access ở `src/access`, hooks ở `src/hooks`, custom endpoints ở `src/endpoints`. Không tạo thêm layer `src/backend` nếu không thật sự cần.

Hiện tại `src/payload.config.ts` không nên import từng endpoint một khi số lượng endpoint tăng. Nên gom bằng barrel theo domain trong `src/endpoints`.

```txt
src/endpoints/
  index.ts
  _shared/
    auth.ts
    query.ts
    errors.ts
  public/
    index.ts
    searchProperties.ts
    searchProjects.ts
    searchNews.ts
    propertyFilters.ts
    divisions.ts
  properties/
    index.ts
    submitProperty.ts
    submitReport.ts
    trackView.ts
    relatedProperties.ts
  account/
    index.ts
    me.ts
    favorites.ts
    notifications.ts
    myDashboard.ts
  billing/
    index.ts
    calculatePackagePrice.ts
    purchasePackage.ts
    topUp.ts
    topUpStatus.ts
    payosWebhook.ts
  admin/
    index.ts
    dashboardStats.ts
```

`src/endpoints/index.ts`:

```ts
import { publicEndpoints } from './public'
import { propertyEndpoints } from './properties'
import { accountEndpoints } from './account'
import { billingEndpoints } from './billing'
import { adminEndpoints } from './admin'

export const endpoints = [
  ...publicEndpoints,
  ...propertyEndpoints,
  ...accountEndpoints,
  ...billingEndpoints,
  ...adminEndpoints,
]
```

`src/payload.config.ts`:

```ts
import { endpoints } from './endpoints'

export default buildConfig({
  endpoints,
})
```

Quy tắc:

- Custom Payload endpoints vẫn nằm trong `src/endpoints`.
- Helper dùng riêng cho endpoint đặt trong `src/endpoints/_shared`.
- Không đặt business endpoint trong `src/app/api` trừ khi đó thật sự là Next.js route handler độc lập với Payload.
- Không tạo `src/backend` cho refactor này để giữ shape quen thuộc của Payload.

## Route Naming Rules

Tránh đặt custom endpoint trùng nghĩa với native Payload collection API.

Không nên:

```txt
GET /api/projects
```

nếu route này là custom endpoint nhưng cũng trùng với collection `projects`.

Nên chọn một trong các hướng:

```txt
GET /api/projects
```

dành cho native Payload resource API, hoặc:

```txt
GET /api/search/projects
```

dành cho application API.

Trong dự án này, custom `/api/projects` legacy đã được gỡ để tránh đụng native Payload collection API. FE nên gọi project list/detail qua `src/app/services/projects.ts`, mặc định dùng native `/api/projects`.

Quy tắc đặt tên:

- `search/*`: tìm kiếm/list public có filter contract riêng.
- `me/*`: dữ liệu và hành động của user hiện tại.
- `admin/*`: dashboard/report/admin-only API.
- `billing/*` hoặc tên domain rõ ràng: top-up, package purchase, webhook.
- Resource native giữ tên collection gốc của Payload.

## Frontend Fetch Rules

Component/page không nên gọi `fetch('/api/...')` trực tiếp, trừ trường hợp rất nhỏ hoặc prototype. Fetch nên đi qua API client + domain service.

Mục tiêu:

- Component chỉ lo UI.
- Domain API module biết endpoint URL.
- HTTP client biết axios/fetch/base URL/error handling.
- Khi backend đổi route, chỉ sửa một file API module.

## Frontend Folder Structure Đề Xuất

```txt
src/app/lib/api/
  http.ts
  query.ts
  payload.ts

src/app/services/
  auth.ts
  properties.ts
  properties.server.ts
  projects.ts
  account.ts
  favorites.ts
  billing.ts
  hybridSearch.ts
  media.ts
  location.ts
  maps.ts
  articles.ts
```

Không dùng `src/features` trong refactor này để giữ cấu trúc Next/Payload hiện tại. Service nên đặt tập trung theo domain trong `src/app/services`, không rải service theo từng page như `home/services`, `properties/services`, `account/services`.

Các command nhỏ thuộc một domain nên nằm trong service của domain đó. Ví dụ `submitPropertyReport` nằm trong `properties.ts` vì đó là hành động trên property, không cần tách `reports.ts` riêng khi chưa có nhiều report workflow độc lập.

Nếu một service quá lớn, có thể tách thành folder nhưng vẫn nằm dưới `src/app/services`:

```txt
src/app/services/
  properties/
    index.ts
    types.ts
    mappers.ts
  billing/
    index.ts
    types.ts
```

Rule quan trọng: component không biết URL API trực tiếp.

Service nào dùng `getPayload`, `@payload-config`, filesystem, secret env, hoặc server-only dependency thì đặt hậu tố `.server.ts` và chỉ import từ Server Component, server action, route handler, hoặc endpoint. Không import `.server.ts` vào Client Component.

## FE API Client Pattern

Phân biệt rõ native Payload API và app custom API trong code.

```ts
// Native Payload API
payloadApi.find('properties', query)
payloadApi.findById('properties', id, query)
payloadApi.create('media', formData)

// App custom API qua domain services
propertiesService.search(filters)
propertiesService.getFilters()
propertiesService.getRelated(propertyId)
propertiesService.submitReport(payload)
favoritesService.add(propertyId)
billingService.purchasePackage(payload)
accountService.getDashboard()
fetchNearbyPlaces(params)
```

Ví dụ component nên gọi:

```ts
const result = await propertiesService.search({
  page: 1,
  limit: 20,
  sort: 'price_desc',
  filters,
})
```

Không nên gọi trực tiếp:

```ts
const result = await getJSON(`/api/search/properties${query}`)
```

## Query Builder Rules

Không dùng một `buildQuery(any)` cho mọi loại API trong dài hạn. Nên tách:

```ts
buildPayloadQuery(query)
buildAppQuery(query)
```

`buildPayloadQuery` dùng cho native Payload REST API:

```ts
buildPayloadQuery({
  where: {
    and: [
      { status: { equals: 'active' } },
      { provinceCode: { equals: '01' } },
    ],
  },
  sort: '-createdAt',
  depth: 2,
})
```

`buildAppQuery` dùng cho app endpoint:

```ts
buildAppQuery({
  keyword: 'can ho',
  provinceCodes: ['01', '79'],
  minPrice: 1_000_000_000,
  maxPrice: 3_000_000_000,
  page: 1,
  limit: 20,
})
```

App query nên convert array thành format endpoint đã định nghĩa, ví dụ CSV:

```txt
provinceCodes=01,79
propertyTypes=apartment,house
```

## Khi Nào Chuyển Logic Từ FE Về Backend

Nên chuyển vào custom endpoint nếu FE đang làm một trong các việc sau:

- Gọi nhiều API để ghép thành một view model.
- Tự quyết định ranking như VIP trước, tin thường sau.
- Tự lọc field nhạy cảm.
- Tự tính dashboard/count/aggregate.
- Có logic payment, voucher, package, balance.
- Có rule cần đồng nhất giữa nhiều màn hình.

Ví dụ logic "tin liên quan" không nên nằm rải trong FE:

```txt
GET /api/properties/:id/related
```

Backend quyết định:

- Loại trừ property hiện tại.
- Ưu tiên cùng ward/province.
- Ưu tiên VIP trước.
- Giới hạn số lượng.
- Format response ổn định.

## Refactor Checklist

Khi thêm API mới:

- Xác định API thuộc native resource, read/search, hay command.
- Đặt route không trùng nghĩa với native Payload API.
- Nếu là custom endpoint, đặt vào đúng domain folder.
- Dùng helper chung cho auth, parse query/body, error response.
- Với Local API có user hiện tại, dùng `overrideAccess: false`.
- Với nested operation trong hook/use case cần transaction safety, truyền `req`.
- FE chỉ gọi qua domain service trong `src/app/services`.
- Không gọi `fetch('/api/...')` trực tiếp trong component nếu API đó sẽ còn được tái sử dụng.
- Type response và request payload ở domain `types.ts`.
- Nếu đổi schema Payload, chạy `generate:types`.
- Nếu tạo/sửa admin component, chạy `generate:importmap`.
- Validate TypeScript bằng `tsc --noEmit` khi thay đổi code.

## Migration Plan Đề Xuất

1. Tạo `src/endpoints/index.ts` và gom endpoint theo domain.
2. Tạo `src/endpoints/_shared` cho auth, parse, response/error helpers.
3. Đổi các custom endpoint dễ nhập nhằng như `/projects` sang route app rõ hơn hoặc bỏ nếu native API đủ dùng.
4. Tạo `src/app/lib/api/http.ts`, `query.ts`, `payload.ts`.
5. Tạo domain services trong `src/app/services` cho `properties`, `account`, `favorites`, `billing`, `projects`.
6. Thay dần các chỗ component gọi `fetch('/api/...')` bằng domain services.
7. Đưa logic FE có business rule như related properties về custom backend endpoint.
