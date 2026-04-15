'use client'

import { useEffect, useState } from 'react'

type Article = {
  title: string
  summary: string
  date: string
  readTime: string
  image: string
  label: string
}

type NewsCategory = {
  title: string
  articles: Article[]
}

const categories: NewsCategory[] = [
  {
    title: 'Tin nổi bật',
    articles: [
      {
        title: 'Hạ tầng thúc đẩy giá trị khu Tây Sài Gòn',
        summary:
          'Sự phát triển của các trục giao thông huyết mạch đang tạo động lực tăng giá trị cho khu Tây, mở ra cơ hội đầu tư trung hạn cho nhà đầu tư cá nhân và tổ chức.',
        date: '12 Tháng 10, 2024',
        readTime: '5 phút đọc',
        label: 'Tiêu điểm',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAECDzXZezrcelq6C5EWlWkmf219bNNXLvGeMrDp4Y_IxbuAKz1iRBB_x22ZEJcdFLsSzUlChYFjTNDUfI-P52eRlUmT6A3rlHdqRIBP0sq738R0HlWeP-Gz_nh7GzDZEXHLvra6ho1GTfLx4BHypcMWfZd6nFATGGzOvRdahnSoX-wIJBswYxX5wvCBC17zUXDCVMgatFSA0wtPfOxTJCF3ifKAbSDGtyVyaclvhgdaR5f6gOWm2UQpL5Uhri2TBwotYefZI9mHazu',
      },
      {
        title: 'Dự án LA HOME công bố chính sách ưu đãi đặc biệt cuối năm',
        summary:
          'Chủ đầu tư giới thiệu gói hỗ trợ lãi suất và lịch thanh toán linh hoạt nhằm kích cầu mua ở thực và nhà đầu tư trung hạn.',
        date: '09 Tháng 10, 2024',
        readTime: '3 phút đọc',
        label: 'Thị trường',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDJvraFzf0zA9_Fxy5xac4Xzu1DCR6oHHlueOmcYXTVvyaFJES4qcPmSSZKToAponBW03MG7jAflzP8yIJScBLKJTrxcHuvqOjOZomJE7GIdVzJBGXaJqoCdHeXxk4INDCVLDTgXYD42QtaJWqWB__FBKXKwREXvl4OzBH9YBKvAzNmxtP0NApvF6k6ixHO3eeTnC88GkObpF03CgFMwyXgiseewZSd02gXTXcJVAGSWq14OYG90Xr89_3Sl8Tb5Zw_g4_xW-1QBmUM',
      },
      {
        title: 'Xu hướng thiết kế căn hộ xanh đang chiếm lĩnh thị trường 2025',
        summary:
          'Dữ liệu tìm kiếm cho thấy người mua ưu tiên không gian xanh, thông gió tự nhiên và các chứng nhận công trình bền vững.',
        date: '07 Tháng 10, 2024',
        readTime: '4 phút đọc',
        label: 'Kiến trúc',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCY9DhR9fDE3Hb0AVkPRXME4dM_4RbHYfXNC6b7zsc3dBRrFAU8rH8Ndte9obB-6DZbb-bUTdhFXHxEoc1O__FT8kqmcEsbmXTQWzoxC1pZ_PYidNOls5qYHlwY6QUR_yA86OjjzHgOCCyBwidevNJfSlDDwfWBX786pDIohGCxLPOfzGyHW5zbSHghPvpI27AE8z58Wj6UIYFxT4jHTBvYlC5-tm1Z7PmLz1tF84Vm4l_KllSCp-bdhKkZNWRMxN8WVl5-jT1ScPEr',
      },
      {
        title: 'Quận Bình Tân sắp có thêm trung tâm thương mại quy mô lớn',
        summary:
          'Dự án mới dự kiến bổ sung hơn 120.000 m2 sàn bán lẻ, kỳ vọng nâng tầm sức mua và giá trị bất động sản lân cận.',
        date: '04 Tháng 10, 2024',
        readTime: '3 phút đọc',
        label: 'Quy hoạch',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBRR-Z88ZR-PAMVesM2J3vGY46XzF_H6s-oevtRCaS5GBMX9h8iSLwluONFQFNq1EXbsuw6VL1clSgs6zEIduKkyI76FUPBkEl9A1vnTsTllq9EI2BtQCUDBBYlSbJUCzcekdaXvdlzP0-mnRvhQjRBKE3ZMQd_HFY2dJPjxos4UqiYdFfB1uKIgs9d6rBQOXBqLuk1LeihuHb4Ho8xN9gGmsdUt4oZk3ijoRCSm2uoUYF2XCAQ992kG603U1E-_u01k9gP7ugWHD8f',
      },
      {
        title: 'Công nghệ PropTech thay đổi cách người trẻ mua nhà',
        summary:
          'Nền tảng số hóa quy trình giao dịch và thẩm định giúp rút ngắn thời gian tìm kiếm, gia tăng độ minh bạch thông tin.',
        date: '01 Tháng 10, 2024',
        readTime: '4 phút đọc',
        label: 'Công nghệ',
        image:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDecPZ2OFWhcJVEz6OOTD2Udp74-IqeueJUJvwtV_nNAYrMyThT5K_lbAEbPYIVTuQq5UqCowgyfMls8gQ4ZQig6Mx9fqbIPzPKwtLH92oBzHCHXgs4yVIekCvziFCUbR_BK7D0grRfTFhGaXWkhj3NiiVhXw6BQarXRCcSjtfhTJEYFR0utP22eZOd8GWNB427WLd-KEYomgpuhZUDhmYqpEef_hdS4Vs4ssnSt0DNVl0E0XTx2uiZrtgf6ODUjS-irUvPXCxvR52S',
      },
    ],
  },
  {
    title: 'BĐS TP.HCM',
    articles: [
      {
        title: 'Khu Nam TP.HCM hút dòng vốn nhờ hạ tầng và quỹ đất lớn',
        summary:
          'Các dự án giao thông liên kết khu Nam đang tạo sức bật mới cho thị trường, đặc biệt ở phân khúc căn hộ và nhà phố thương mại.',
        date: '05 Tháng 01, 2025',
        readTime: '6 phút đọc',
        label: 'TPHCM',
        image:
          'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=80',
      },
      {
        title: 'Căn hộ khu Thủ Đức tiếp tục dẫn đầu nhu cầu tìm kiếm',
        summary: 'Khu vực quanh các ga metro thu hút nhiều giao dịch ở phân khúc tầm giá.',
        date: '02 Tháng 01, 2025',
        readTime: '3 phút đọc',
        label: 'Thủ Đức',
        image:
          'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Giá thuê văn phòng hạng B tại Quận 1 tăng nhẹ 3%',
        summary: 'Nhu cầu mở rộng quy mô văn phòng của doanh nghiệp SME đang phục hồi tốt.',
        date: '30 Tháng 12, 2024',
        readTime: '2 phút đọc',
        label: 'Quận 1',
        image:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Bình Chánh xuất hiện thêm cụm đô thị quy mô trên 100ha',
        summary: 'Loại hình đô thị tích hợp đầy đủ tiện ích đang trở thành tâm điểm đầu tư mới.',
        date: '27 Tháng 12, 2024',
        readTime: '3 phút đọc',
        label: 'Bình Chánh',
        image:
          'https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Nhà đầu tư quay lại phân khúc đất nền ven đô',
        summary: 'Thanh khoản cải thiện nhờ kỳ vọng quy hoạch và hệ thống kết nối liên quận.',
        date: '24 Tháng 12, 2024',
        readTime: '3 phút đọc',
        label: 'Đất nền',
        image:
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    title: 'BĐS Hà Nội',
    articles: [
      {
        title: 'Vành đai 4 tạo lực đẩy mới cho thị trường phía Đông Hà Nội',
        summary:
          'Hạ tầng liên vùng và quy hoạch mới đang đẩy nhanh tốc độ phát triển dự án tại khu vực phía Đông, thu hút cả người mua ở và nhà đầu tư.',
        date: '17 Tháng 02, 2025',
        readTime: '5 phút đọc',
        label: 'Hà Nội',
        image:
          'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=80',
      },
      {
        title: 'Căn hộ Đông Anh thu hút sự quan tâm nhờ kết nối hạ tầng',
        summary:
          'Người mua đánh giá cao các dự án gần trục giao thông xuyên tâm đã được phê duyệt.',
        date: '13 Tháng 02, 2025',
        readTime: '3 phút đọc',
        label: 'Đông Anh',
        image:
          'https://images.unsplash.com/photo-1472224371017-08207f84aaae?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Nguồn cung nhà liền kề ở Hoài Đức tăng trong quý I',
        summary: 'Nhiều dự án mở bán giai đoạn tiếp theo với giá bán cạnh tranh hơn.',
        date: '11 Tháng 02, 2025',
        readTime: '2 phút đọc',
        label: 'Hoài Đức',
        image:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Thị trường cho thuê quanh khu công nghệ cao sôi động trở lại',
        summary: 'Nhu cầu thuê của chuyên gia nước ngoài và kỹ sư tăng trở lại sau Tết.',
        date: '08 Tháng 02, 2025',
        readTime: '3 phút đọc',
        label: 'Cho thuê',
        image:
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Nhà đầu tư ưu tiên dự án có vận hành đã hiện hữu',
        summary: 'Sản phẩm đã hình thành dòng tiền cho thuê được quan tâm nhiều hơn.',
        date: '05 Tháng 02, 2025',
        readTime: '3 phút đọc',
        label: 'Đầu tư',
        image:
          'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
]

export function FeaturedNewsSection() {
  // Current tab
  const [activeCategoryTitle, setActiveCategoryTitle] = useState(categories[0].title)

  // Active article in that tab
  const [activeArticleIndex, setActiveArticleIndex] = useState(0)

  // Active article in hero
  const [heroArticle, setHeroArticle] = useState<Article>(categories[0].articles[0])

  // Animation flag
  const [isHeroFading, setIsHeroFading] = useState(false)

  // Find Category by ActiveCategoryTitle, fallback to first category if not found
  const currentCategory =
    categories.find((category) => category.title === activeCategoryTitle) ?? categories[0]

  // Find the active article in the current category
  const activeArticle =
    currentCategory.articles[activeArticleIndex] ?? currentCategory.articles[0] ?? heroArticle

  // Reset active article index when switching category
  useEffect(() => {
    setActiveArticleIndex(0)
  }, [activeCategoryTitle])

  // Animate hero article change
  useEffect(() => {
    if (heroArticle.title === activeArticle.title) return

    setIsHeroFading(true)
    const timeoutId = setTimeout(() => {
      setHeroArticle(activeArticle)
      setIsHeroFading(false)
    }, 140)

    return () => clearTimeout(timeoutId)
  }, [activeArticle, heroArticle.title])

  return (
    <section className="mx-auto max-w-screen-2xl bg-surface px-8 py-20">
      <div className="mb-12 flex flex-col justify-between border-b border-outline-variant/20 pb-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold uppercase tracking-tighter text-on-surface">
            Dòng chảy thị trường
          </h2>
          <div className="scrollbar-hide flex gap-8 overflow-x-auto pb-2">
            {categories.map((category) => {
              const isActive = category.title === activeCategoryTitle

              return (
                <button
                  key={category.title}
                  className={
                    isActive
                      ? 'whitespace-nowrap border-b-2 border-primary pb-2 font-bold text-primary'
                      : 'whitespace-nowrap pb-2 text-secondary transition-colors hover:text-on-surface'
                  }
                  onClick={() => setActiveCategoryTitle(category.title)}
                  type="button"
                >
                  {category.title}
                </button>
              )
            })}
          </div>
        </div>
        <a className="group mb-2 flex items-center gap-1 font-semibold text-primary" href="/articles">
          Xem tất cả
          <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div
          className={`group cursor-pointer transition-all duration-300 ease-out lg:col-span-8 ${
            isHeroFading ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <div className="relative mb-6 overflow-hidden rounded-full">
            <img
              alt={heroArticle.title}
              className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={heroArticle.image}
            />
            <div className="absolute left-6 top-6">
              <span className="bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                {heroArticle.label}
              </span>
            </div>
          </div>
          <h3 className="mb-4 text-2xl font-bold leading-snug transition-colors group-hover:text-primary">
            {heroArticle.title}
          </h3>
          <p className="mb-4 leading-relaxed text-secondary">{heroArticle.summary}</p>
          <div className="flex items-center gap-4 text-xs text-secondary">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {heroArticle.date}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {heroArticle.readTime}
            </span>
          </div>
        </div>

        <div className="space-y-8 lg:col-span-4">
          {currentCategory.articles.map((article, index) => {
            const isActive = index === activeArticleIndex

            return (
              <div
                key={article.title}
                className={`group -mx-2 flex cursor-pointer gap-4 rounded-lg px-2 py-2 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-surface-container-low ${
                  isActive ? 'bg-surface-container-low' : ''
                } ${
                  index < currentCategory.articles.length - 1
                    ? 'border-b border-outline-variant/10 pb-6'
                    : ''
                }`}
                onFocus={() => setActiveArticleIndex(index)}
                onMouseEnter={() => setActiveArticleIndex(index)}
                role="button"
                tabIndex={0}
              >
                {/* <img
                  alt={article.title}
                  className="h-24 w-24 shrink-0 rounded-xl object-cover transition-opacity group-hover:opacity-90"
                  src={article.image}
                /> */}
                <div className="space-y-1">
                  <h4 className="text-sm font-bold leading-tight transition-colors group-hover:text-primary">
                    {article.title}
                  </h4>
                  <span className="text-[10px] font-bold uppercase text-secondary">
                    {article.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
