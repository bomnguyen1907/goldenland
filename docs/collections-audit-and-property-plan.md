# Collections Audit va Property Table Plan

Ngay audit: 2026-04-13
Pham vi: src/collections + anh huong nghiep vu tu src/endpoints

## 1) Collections errors and risks

### Critical

1. Missing access control in almost all collections
- Hien tai chi co access o Media.
- Cac collection con lai chua khai bao access -> de mo quyen CRUD ngoai y muon neu API route cho phep.
- Vi tri tieu bieu:
  - src/collections/Users.ts:3
  - src/collections/Listings.ts:4
  - src/collections/Orders.ts:3
  - src/collections/Notifications.ts:3
  - src/collections/Reports.ts:3
  - src/collections/ViewHistory.ts:3
  - src/collections/Vouchers.ts:3

### High

2. Users has sensitive fields without field-level access
- Truong role va balance chua co access update/read theo role admin/self.
- Co nguy co bi sua role/balance khong mong muon trong admin/API flows.
- Vi tri:
  - src/collections/Users.ts:31
  - src/collections/Users.ts:45

3. Listings owner field can be reassigned
- Truong user trong listing khong co field-level access de chan doi chu so huu.
- Vi tri:
  - src/collections/Listings.ts:392

### Medium

4. SavedListings disables TypeScript checking
- Co su dung @ts-nocheck cho toan bo file.
- Vi tri:
  - src/collections/SavedListings.ts:1

5. SavedListings hook uses nested local API without passing req
- Vi pham transaction safety guideline trong hook nested operation.
- Vi tri:
  - src/collections/SavedListings.ts:29

6. SavedListings duplicate prevention only at hook level
- Kiem tra truoc khi ghi de trung lap van co race condition neu request dong thoi.
- Nen co unique constraint cap user-listing o DB layer.
- Vi tri:
  - src/collections/SavedListings.ts:27

7. Reports and ViewHistory have no duplicate guard
- Chua co co che chong lap cho cap nguoi dung-doi tuong.
- Vi tri:
  - src/collections/Reports.ts:11
  - src/collections/ViewHistory.ts:10

## 2) Related endpoint observations (impact to access design)

- Nhieu endpoint dang query truc tiep collection listings:
  - src/endpoints/searchListings.ts
  - src/endpoints/myDashboard.ts
  - src/endpoints/trackView.ts
  - src/endpoints/toggleSavedListing.ts
- Nghia la Listing dang vua dong vai tro "tin dang" vua chua metadata cua tai san.

## 3) Co can tao them table Property khong?

### Ket luan ngan
- Chua bat buoc phai tao ngay neu product hien tai la marketplace 1 tin = 1 tai san dang ban/cho thue.
- Nen tao Property table neu ban muon mo rong theo huong 1 tai san co nhieu listing theo thoi gian/kenh/agent.

### Khi nao KHONG can tao Property
- Moi listing duoc xem la mot don vi doc lap va ngung su dung sau khi ban/het han.
- Khong can lich su giao dich theo "tai san goc".
- Khong can cho nhieu agent cung dang 1 tai san.

### Khi nao NEN tao Property
- Can model 1-N: 1 Property co nhieu Listing (dang lai, doi gia, doi trang thai, nhieu agent).
- Can chuan hoa du lieu co dinh cua tai san (dia chi toa do, phap ly, ket cau) tach khoi du lieu marketing cua listing.
- Can thong ke, so huu, lich su va quan tri theo tai san thay vi theo bai dang.

## 4) Suggested rollout plan (if adding Property)

### Phase 0 - Decision and scope
- Xac dinh nghiep vu: Listing la Advertisement, Property la Asset.
- Chot quy tac unique cho Property (vd: legal doc + full address + lat/lng).

### Phase 1 - Add Property collection (non-breaking)
- Tao src/collections/Properties.ts.
- Truong goi y:
  - title, slug
  - propertyType, legalStatus
  - provinceCode, districtCode, wardCode, street, address, lat, lng
  - area, bedrooms, bathrooms, roadWidth, facadeWidth, direction
  - owner (relationship users), project (relationship projects)
  - canonicalStatus (active/inactive)
- Bo sung relationship property vao Listings (optional o giai doan dau).

### Phase 2 - Dual-write and backfill
- Hook beforeChange o Listings:
  - Neu da co property -> gan
  - Neu chua co -> tao/tim Property theo quy tac dedupe roi gan vao listing
- Viet script migrate du lieu cu: moi listing tao map sang property tuong ung.

### Phase 3 - Read path migration
- Cap nhat endpoint va UI doc tu Listing + join Property.
- Tim kiem loc (search/listings) chuyen cac field co dinh sang property.* neu can.

### Phase 4 - Tighten constraints
- Bat required cho listing.property sau khi data on dinh.
- Giam duplicated fields trong Listings (giu lai field marketing: price, postType, status, seo, media display).

### Phase 5 - Validation and cleanup
- Chay generate:types sau khi doi schema.
- Chay typecheck/test va benchmark query.

## 5) Recommendation for current project

- Ngan han: chua can tach Property ngay, uu tien fix access control va integrity trong collections.
- Trung han: chuan bi Property neu roadmap co cac use case:
  - dang lai cung 1 tai san nhieu lan
  - nhieu nguoi moi gioi tren cung tai san
  - theo doi lifecycle tai san ngoai lifecycle listing
