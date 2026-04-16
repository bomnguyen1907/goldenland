'use client'

import useEmblaCarousel from 'embla-carousel-react'

type NewsItem = {
  title: string
  image: string
  imageAlt: string
  date: string
}

const newsItems: NewsItem[] = [
  {
    title: 'Trục đại lộ 60m tại TP.HCM sắp có trung tâm thương mại mới cạnh AEON Mall',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAECDzXZezrcelq6C5EWlWkmf219bNNXLvGeMrDp4Y_IxbuAKz1iRBB_x22ZEJcdFLsSzUlChYFjTNDUfI-P52eRlUmT6A3rlHdqRIBP0sq738R0HlWeP-Gz_nh7GzDZEXHLvra6ho1GTfLx4BHypcMWfZd6nFATGGzOvRdahnSoX-wIJBswYxX5wvCBC17zUXDCVMgatFSA0wtPfOxTJCF3ifKAbSDGtyVyaclvhgdaR5f6gOWm2UQpL5Uhri2TBwotYefZI9mHazu',
    imageAlt: 'Trục đại lộ 60m tại TP.HCM',
    date: '12 Tháng 03, 2026',
  },
  {
    title: 'Giải thưởng Bất động sản Việt Nam PropertyGuru lần thứ 12 chính thức khởi động',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAECDzXZezrcelq6C5EWlWkmf219bNNXLvGeMrDp4Y_IxbuAKz1iRBB_x22ZEJcdFLsSzUlChYFjTNDUfI-P52eRlUmT6A3rlHdqRIBP0sq738R0HlWeP-Gz_nh7GzDZEXHLvra6ho1GTfLx4BHypcMWfZd6nFATGGzOvRdahnSoX-wIJBswYxX5wvCBC17zUXDCVMgatFSA0wtPfOxTJCF3ifKAbSDGtyVyaclvhgdaR5f6gOWm2UQpL5Uhri2TBwotYefZI9mHazu',
    imageAlt: 'Giải thưởng Bất động sản Việt Nam',
    date: '10 Tháng 03, 2026',
  },
  {
    title: 'Thị trường bất động sản: "Nơi trú ẩn an toàn" giữa biến động kinh tế toàn cầu',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Thị trường bất động sản',
    date: '08 Tháng 03, 2026',
  },
  {
    title: 'Nguồn cung căn hộ trung tâm tăng trở lại, người mua có thêm nhiều lựa chọn',
    image:
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Nguồn cung căn hộ trung tâm',
    date: '06 Tháng 03, 2026',
  },
  {
    title: 'Nhiều địa phương công bố bảng giá đất mới, tác động đến chiến lược đầu tư 2026',
    image:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Bảng giá đất mới',
    date: '04 Tháng 03, 2026',
  },
  {
    title: 'Dòng tiền dịch chuyển về vùng ven có hạ tầng mới, phân khúc nhà phố được quan tâm',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Dòng tiền dịch chuyển về vùng ven',
    date: '02 Tháng 03, 2026',
  },
]

export function RealEstateArticlesSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    slidesToScroll: 1,
  })

  const handlePrev = () => emblaApi?.scrollPrev()

  const handleNext = () => emblaApi?.scrollNext()

  return (
    <section className="mx-auto max-w-screen-2xl px-8 pb-20">
      <div className="border-t border-zinc-100 pt-20">
        <div className="mb-12 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-bold uppercase tracking-tighter text-on-surface">
            Tin tức bất động sản
          </h2>
        </div>

        <div className="relative">
          <button
            aria-label="Xem tin trước"
            className="absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-outline bg-white shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-white"
            onClick={handlePrev}
            type="button"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <button
            aria-label="Xem tin kế tiếp"
            className="absolute right-0 top-1/2 z-10 flex h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-outline bg-white shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-white"
            onClick={handleNext}
            type="button"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="-mx-3 flex">
              {newsItems.map((news, index) => {
                const order = String(index + 1).padStart(2, '0')

                return (
                  <article
                    key={`${news.title}-${order}`}
                    className="group min-w-0 shrink-0 basis-full cursor-pointer px-3 md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="mb-6 overflow-hidden rounded-xl">
                      <img
                        alt={news.imageAlt}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={news.image}
                      />
                    </div>

                    <div className="flex gap-4">
                      <span className="text-4xl font-extrabold text-zinc-200 transition-colors group-hover:text-primary">
                        {order}
                      </span>

                      <div>
                        <h4 className="text-base font-bold leading-tight transition-colors group-hover:text-primary">
                          {news.title}
                        </h4>
                        <p className="mt-2 text-xs text-secondary">{news.date}</p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
