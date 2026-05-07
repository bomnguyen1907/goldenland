'use client'

import { useRef, useState } from 'react'
import type { FormData } from '../page'

type Props = {
  images: FormData['images']
  videoUrl: string
  onImagesChange: (images: FormData['images']) => void
  onVideoChange: (url: string) => void
}

export default function Step4Images({ images, videoUrl, onImagesChange, onVideoChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (images.length + files.length > 20) {
      setError('Tối đa 20 ảnh')
      return
    }
    setError('')
    setUploading(true)

    const uploaded: FormData['images'] = []
    for (const file of Array.from(files)) {
      const body = new window.FormData()
      body.append('file', file)
      body.append('alt', file.name)

      try {
        const res = await fetch('/api/media', { method: 'POST', body })
        const media = await res.json()
        if (media?.url) {
          uploaded.push({ image: media.url, sort: images.length + uploaded.length })
        }
      } catch {
        setError('Có lỗi khi tải ảnh lên, thử lại.')
      }
    }

    onImagesChange([...images, ...uploaded])
    setUploading(false)
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, sort: i })))
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-800">
            Hình ảnh <span className="text-gray-400 font-normal">({images.length}/20)</span>
          </h2>
          {images.length < 20 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-xs text-emerald-600 font-medium hover:text-emerald-700 disabled:opacity-50"
            >
              {uploading ? 'Đang tải...' : '+ Thêm ảnh'}
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {images.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-emerald-400 transition disabled:opacity-50"
          >
            <div className="text-3xl mb-2">📷</div>
            <p className="text-sm font-medium text-gray-600">Nhấn để tải ảnh lên</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — tối đa 20 ảnh</p>
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                <img src={img.image} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    Ảnh bìa
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length < 20 && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition disabled:opacity-50"
              >
                <span className="text-xl">+</span>
                <span className="text-xs mt-1">Thêm</span>
              </button>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        <p className="text-xs text-gray-400 mt-2">Ảnh đầu tiên sẽ là ảnh bìa của tin đăng</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Link video (YouTube, TikTok...)
        </label>
        <input
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={videoUrl}
          onChange={(e) => onVideoChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
        />
      </div>
    </div>
  )
}
