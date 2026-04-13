type PropertyItem = {
  title: string
  price: string
  area: string
  location: string
  image: string
  imageAlt: string
}

const properties: PropertyItem[] = [
  {
    title: 'Biệt thự đơn lập senturia vườn lài hoàn thiện chỉ 30 tỷ',
    price: '30 tỷ',
    area: '365 m²',
    location: 'Quận 12, Hồ Chí Minh',
    imageAlt: 'Senturia Vườn Lài',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAECDzXZezrcelq6C5EWlWkmf219bNNXLvGeMrDp4Y_IxbuAKz1iRBB_x22ZEJcdFLsSzUlChYFjTNDUfI-P52eRlUmT6A3rlHdqRIBP0sq738R0HlWeP-Gz_nh7GzDZEXHLvra6ho1GTfLx4BHypcMWfZd6nFATGGzOvRdahnSoX-wIJBswYxX5wvCBC17zUXDCVMgatFSA0wtPfOxTJCF3ifKAbSDGtyVyaclvhgdaR5f6gOWm2UQpL5Uhri2TBwotYefZI9mHazu',
  },
  {
    title: 'Nhà mới 4 tầng DT (4m x 17m) - khu biệt thự Kiểu Đàm, P. Tân...',
    price: '12 tỷ',
    area: '68 m²',
    location: 'Quận 7, Hồ Chí Minh',
    imageAlt: 'Nhà Kiểu Đàm',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDJvraFzf0zA9_Fxy5xac4Xzu1DCR6oHHlueOmcYXTVvyaFJES4qcPmSSZKToAponBW03MG7jAflzP8yIJScBLKJTrxcHuvqOjOZomJE7GIdVzJBGXaJqoCdHeXxk4INDCVLDTgXYD42QtaJWqWB__FBKXKwREXvl4OzBH9YBKvAzNmxtP0NApvF6k6ixHO3eeTnC88GkObpF03CgFMwyXgiseewZSd02gXTXcJVAGSWq14OYG90Xr89_3Sl8Tb5Zw_g4_xW-1QBmUM',
  },
  {
    title: 'Bán căn hộ 1+1PN 1WC 52m2 Victoria Village view sông...',
    price: '4,5 tỷ',
    area: '52 m²',
    location: 'Quận 2, Hồ Chí Minh',
    imageAlt: 'Victoria Village',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCY9DhR9fDE3Hb0AVkPRXME4dM_4RbHYfXNC6b7zsc3dBRrFAU8rH8Ndte9obB-6DZbb-bUTdhFXHxEoc1O__FT8kqmcEsbmXTQWzoxC1pZ_PYidNOls5qYHlwY6QUR_yA86OjjzHgOCCyBwidevNJfSlDDwfWBX786pDIohGCxLPOfzGyHW5zbSHghPvpI27AE8z58Wj6UIYFxT4jHTBvYlC5-tm1Z7PmLz1tF84Vm4l_KllSCp-bdhKkZNWRMxN8WVl5-jT1ScPEr',
  },
  {
    title: 'NHÀ MỚI 4*16m 1LẦU 4PN 2WC 1/ NGUYỄN VĂN KHỐI P11',
    price: '10,5 triệu/tháng',
    area: '64 m²',
    location: 'Gò Vấp, Hồ Chí Minh',
    imageAlt: 'Nhà Nguyễn Văn Khối',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBRR-Z88ZR-PAMVesM2J3vGY46XzF_H6s-oevtRCaS5GBMX9h8iSLwluONFQFNq1EXbsuw6VL1clSgs6zEIduKkyI76FUPBkEl9A1vnTsTllq9EI2BtQCUDBBYlSbJUCzcekdaXvdlzP0-mnRvhQjRBKE3ZMQd_HFY2dJPjxos4UqiYdFfB1uKIgs9d6rBQOXBqLuk1LeihuHb4Ho8xN9gGmsdUt4oZk3ijoRCSm2uoUYF2XCAQ992kG603U1E-_u01k9gP7ugWHD8f',
  },
  {
    title: 'Căn hộ 2PN The Global City bàn giao nội thất cao cấp',
    price: '8,2 tỷ',
    area: '78 m²',
    location: 'TP. Thủ Đức, Hồ Chí Minh',
    imageAlt: 'The Global City',
    image:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Nhà phố 5 tầng khu dân cư Him Lam, sổ hồng riêng',
    price: '16,8 tỷ',
    area: '96 m²',
    location: 'Quận 7, Hồ Chí Minh',
    imageAlt: 'Nhà phố Him Lam',
    image:
      'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Căn studio cho thuê gần Landmark 81, full nội thất',
    price: '12 triệu/tháng',
    area: '38 m²',
    location: 'Bình Thạnh, Hồ Chí Minh',
    imageAlt: 'Studio gần Landmark 81',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Đất nền mặt tiền đường 30m trung tâm hành chính mới',
    price: '3,9 tỷ',
    area: '120 m²',
    location: 'Dĩ An, Bình Dương',
    imageAlt: 'Đất nền trung tâm hành chính',
    image:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=80',
  },
]

export function PropertyForYouSection() {
  return (
    <section className="mx-auto max-w-screen-2xl px-8 pb-24">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <h2 className="font-lexend text-3xl font-bold uppercase tracking-tighter text-on-surface">
          Bất động sản dành cho bạn
        </h2>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-4 text-sm font-medium md:flex">
            <a className="text-secondary transition-colors hover:text-primary" href="#">
              Tin nhà đất bán mới nhất
            </a>
            <span className="text-outline-variant">|</span>
            <a className="text-secondary transition-colors hover:text-primary" href="#">
              Tin nhà đất cho thuê mới nhất
            </a>
          </div>

          <div className="flex gap-2">
            <button
              aria-label="Xem bất động sản trước"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-outline transition-all hover:bg-primary hover:text-white"
              type="button"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              aria-label="Xem bất động sản tiếp theo"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-outline transition-all hover:bg-primary hover:text-white"
              type="button"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {properties.map((property) => (
          <div
            key={property.title}
            className="group cursor-pointer overflow-hidden rounded-lg border border-outline-variant/20 bg-white transition-all hover:shadow-xl"
          >
            <div className="relative h-[208px] min-h-[208px] max-h-[208px] overflow-hidden">
              <img
                alt={property.imageAlt}
                className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={property.image}
              />
            </div>

            <div className="flex h-[180px] flex-col justify-between p-4">
              <div>
                <h4 className="font-lexend mb-2 line-clamp-2 font-bold text-on-surface transition-colors group-hover:text-primary">
                  {property.title}
                </h4>

                <div className="font-lexend text-lg font-bold text-primary">
                  {property.price}
                  <span className="mx-1 font-normal text-secondary">·</span>
                  {property.area}
                </div>

                <div className="mt-2 flex items-center gap-1 text-sm text-secondary">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  {property.location}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                <span className="text-xs italic text-secondary">Đăng hôm nay</span>

                <button
                  aria-label={`Thêm ${property.title} vào mục yêu thích`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/30 transition-colors hover:border-primary hover:bg-primary/10"
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg text-secondary hover:text-primary">
                    favorite
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          className="rounded-full border border-outline px-6 py-2 font-semibold text-on-surface transition-all hover:border-primary hover:bg-primary hover:text-white"
          type="button"
        >
          Xem thêm
        </button>
      </div>
    </section>
  )
}
