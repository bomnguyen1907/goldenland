const locations = [
  {
    city: 'Hà Nội',
    count: '53.345 tin đăng',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCY9DhR9fDE3Hb0AVkPRXME4dM_4RbHYfXNC6b7zsc3dBRrFAU8rH8Ndte9obB-6DZbb-bUTdhFXHxEoc1O__FT8kqmcEsbmXTQWzoxC1pZ_PYidNOls5qYHlwY6QUR_yA86OjjzHgOCCyBwidevNJfSlDDwfWBX786pDIohGCxLPOfzGyHW5zbSHghPvpI27AE8z58Wj6UIYFxT4jHTBvYlC5-tm1Z7PmLz1tF84Vm4l_KllSCp-bdhKkZNWRMxN8WVl5-jT1ScPEr',
  },
  {
    city: 'Đà Nẵng',
    count: '11.624 tin đăng',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBRR-Z88ZR-PAMVesM2J3vGY46XzF_H6s-oevtRCaS5GBMX9h8iSLwluONFQFNq1EXbsuw6VL1clSgs6zEIduKkyI76FUPBkEl9A1vnTsTllq9EI2BtQCUDBBYlSbJUCzcekdaXvdlzP0-mnRvhQjRBKE3ZMQd_HFY2dJPjxos4UqiYdFfB1uKIgs9d6rBQOXBqLuk1LeihuHb4Ho8xN9gGmsdUt4oZk3ijoRCSm2uoUYF2XCAQ992kG603U1E-_u01k9gP7ugWHD8f',
  },
  {
    city: 'Bình Dương',
    count: '9.656 tin đăng',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDecPZ2OFWhcJVEz6OOTD2Udp74-IqeueJUJvwtV_nNAYrMyThT5K_lbAEbPYIVTuQq5UqCowgyfMls8gQ4ZQig6Mx9fqbIPzPKwtLH92oBzHCHXgs4yVIekCvziFCUbR_BK7D0grRfTFhGaXWkhj3NiiVhXw6BQarXRCcSjtfhTJEYFR0utP22eZOd8GWNB427WLd-KEYomgpuhZUDhmYqpEef_hdS4Vs4ssnSt0DNVl0E0XTx2uiZrtgf6ODUjS-irUvPXCxvR52S',
  },
  {
    city: 'Đồng Nai',
    count: '4.359 tin đăng',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAECDzXZezrcelq6C5EWlWkmf219bNNXLvGeMrDp4Y_IxbuAKz1iRBB_x22ZEJcdFLsSzUlChYFjTNDUfI-P52eRlUmT6A3rlHdqRIBP0sq738R0HlWeP-Gz_nh7GzDZEXHLvra6ho1GTfLx4BHypcMWfZd6nFATGGzOvRdahnSoX-wIJBswYxX5wvCBC17zUXDCVMgatFSA0wtPfOxTJCF3ifKAbSDGtyVyaclvhgdaR5f6gOWm2UQpL5Uhri2TBwotYefZI9mHazu',
  },
]

const tags = [
  'Vinhomes Central Park',
  'Vinhomes Grand Park',
  'Vinhomes Smart City',
  'Vinhomes Ocean Park',
  'Vũng Tàu Pearl',
  'Bcons Green View',
  'Grandeur Palace',
]

export function PropertiesByLocationSection() {
  return (
    <section className="mx-auto max-w-screen-2xl px-8 pb-24">
      <h2 className="mb-8 text-3xl font-bold uppercase tracking-tighter text-on-surface">
        Bất động sản theo địa điểm
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
        <div className="city-card lg:col-span-6">
          <img
            alt="TP. Hồ Chí Minh"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJvraFzf0zA9_Fxy5xac4Xzu1DCR6oHHlueOmcYXTVvyaFJES4qcPmSSZKToAponBW03MG7jAflzP8yIJScBLKJTrxcHuvqOjOZomJE7GIdVzJBGXaJqoCdHeXxk4INDCVLDTgXYD42QtaJWqWB__FBKXKwREXvl4OzBH9YBKvAzNmxtP0NApvF6k6ixHO3eeTnC88GkObpF03CgFMwyXgiseewZSd02gXTXcJVAGSWq14OYG90Xr89_3Sl8Tb5Zw_g4_xW-1QBmUM"
          />
          <div className="city-card-overlay">
            <h3 className="text-2xl font-bold text-white">TP. Hồ Chí Minh</h3>
            <p className="text-sm text-white/80">86.929 tin đăng</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:col-span-6">
          {locations.map((city) => (
            <div key={city.city} className="city-card">
              <img alt={city.city} src={city.image} />
              <div className="city-card-overlay p-4">
                <h3 className="text-lg font-bold text-white">{city.city}</h3>
                <p className="text-[10px] text-white/80">{city.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {tags.map((item) => (
          <span
            key={item}
            className="cursor-pointer rounded-full bg-zinc-100 px-4 py-2 text-xs text-secondary transition-colors hover:bg-primary hover:text-white"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}
