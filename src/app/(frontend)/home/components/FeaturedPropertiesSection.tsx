const featuredProjects = [
  {
    title: 'Dinh thự The Rivus Elie Saab',
    area: '26,73 ha',
    location: 'Quận 9, TP. Hồ Chí Minh',
    imageCount: 17,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCY9DhR9fDE3Hb0AVkPRXME4dM_4RbHYfXNC6b7zsc3dBRrFAU8rH8Ndte9obB-6DZbb-bUTdhFXHxEoc1O__FT8kqmcEsbmXTQWzoxC1pZ_PYidNOls5qYHlwY6QUR_yA86OjjzHgOCCyBwidevNJfSlDDwfWBX786pDIohGCxLPOfzGyHW5zbSHghPvpI27AE8z58Wj6UIYFxT4jHTBvYlC5-tm1Z7PmLz1tF84Vm4l_KllSCp-bdhKkZNWRMxN8WVl5-jT1ScPEr',
  },
  {
    title: 'Vinhomes Green Paradise',
    area: '2.866 ha',
    location: 'Cần Giờ, TP. Hồ Chí Minh',
    imageCount: 11,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBRR-Z88ZR-PAMVesM2J3vGY46XzF_H6s-oevtRCaS5GBMX9h8iSLwluONFQFNq1EXbsuw6VL1clSgs6zEIduKkyI76FUPBkEl9A1vnTsTllq9EI2BtQCUDBBYlSbJUCzcekdaXvdlzP0-mnRvhQjRBKE3ZMQd_HFY2dJPjxos4UqiYdFfB1uKIgs9d6rBQOXBqLuk1LeihuHb4Ho8xN9gGmsdUt4oZk3ijoRCSm2uoUYF2XCAQ992kG603U1E-_u01k9gP7ugWHD8f',
  },
]

export function FeaturedPropertiesSection() {
  return (
    <section className="mx-auto max-w-screen-2xl px-8 pb-24">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold uppercase tracking-tighter text-on-surface">
          Dự án bất động sản nổi bật
        </h2>
        <a className="group flex items-center gap-1 font-semibold text-primary" href="#">
          Xem thêm
          <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {featuredProjects.map((project) => (
          <div
            key={project.title}
            className="cursor-pointer overflow-hidden rounded-lg border border-outline-variant/20 bg-white shadow-sm transition-all hover:shadow-lg"
          >
            <div className="relative h-48 overflow-hidden">
              <img alt={project.title} className="h-full w-full object-cover" src={project.image} />
              <div className="absolute bottom-2 left-2 flex gap-1">
                <span className="rounded bg-green-500 px-2 py-0.5 text-[10px] text-white">
                  Đang mở bán
                </span>
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white">
                <span className="material-symbols-outlined text-xs">image</span>
                {project.imageCount}
              </div>
            </div>
            <div className="p-4">
              <h4 className="mb-1 text-sm font-bold">{project.title}</h4>
              <p className="text-xs text-secondary">{project.area}</p>
              <p className="mt-2 text-xs text-zinc-500">{project.location}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
