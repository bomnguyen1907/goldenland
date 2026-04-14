import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import './news.css'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '09/04/2026 08:00'
  const date = new Date(dateStr)
  return `${date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
}

// 1. Đổi kiểu dữ liệu của searchParams thành Promise
export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const payload = await getPayload({ config: configPromise })

  // 2. Dùng await để lấy dữ liệu thực tế từ searchParams (Bắt buộc trong Next.js 15+)
  const resolvedSearchParams = await searchParams

  // Lấy trang hiện tại từ URL đã được unwrap, mặc định là 1
  const currentPage = Number(resolvedSearchParams?.page) || 1
  const ITEMS_PER_PAGE = 15

  // Gọi Payload CMS kèm theo các tham số phân trang
  const {
    docs: articles,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = await payload.find({
    collection: 'articles',
    limit: ITEMS_PER_PAGE,
    page: currentPage,
    sort: '-createdAt', // Sắp xếp bài mới nhất lên đầu
  })

  // Phân chia dữ liệu 15 bài cho các khu vực
  const featuredArticle = articles.length > 0 ? articles[0] : null
  const leftListArticles = articles.length > 1 ? articles.slice(1, 5) : []
  const rightTopArticles = articles.length > 5 ? articles.slice(5, 9) : []
  const mostViewedArticles = articles.length > 9 ? articles.slice(9, 13) : []

  // Helper để lấy url hình ảnh
  const getImageUrl = (thumbnail: any) => {
    if (thumbnail && typeof thumbnail === 'object' && thumbnail.url) {
      return thumbnail.url
    }
    return '' // Bỏ trống url nếu không có
  }

  return (
    <div className="news-page">
      <div className="news-container">
        <header className="news-header">
          <h1>Tin tức bất động sản mới nhất</h1>
          <p>
            Thông tin mới, đầy đủ, hấp dẫn về thị trường bất động sản Việt Nam thông qua dữ liệu lớn
            về giá, giao dịch, nguồn cung - cầu và khảo sát thực tế của đội ngũ phóng viên, biên tập
            của Batdongsan.com.vn.
          </p>
        </header>

        {articles.length === 0 ? (
          <div className="news-empty">
            <p>Hiện chưa có bài viết nào trong hệ thống quản trị Payload...</p>
          </div>
        ) : (
          <>
            <div className="news-grid">
              <div className="news-main">
                {featuredArticle && (
                  <div className="news-featured">
                    <div className="image-wrapper">
                      {getImageUrl(featuredArticle.thumbnail) && (
                        <img
                          src={getImageUrl(featuredArticle.thumbnail)}
                          alt={featuredArticle.title}
                        />
                      )}
                    </div>
                    <div className="gradient-overlay"></div>
                    <div className="content">
                      <div className="meta-date">
                        {formatDate(featuredArticle.createdAt)} • Tin tức
                      </div>
                      <h2>
                        <Link href={`/articles/${featuredArticle.slug}`}>
                          {featuredArticle.title}
                        </Link>
                      </h2>
                      {featuredArticle.excerpt && (
                        <p className="excerpt">{featuredArticle.excerpt}</p>
                      )}
                    </div>
                  </div>
                )}

                {leftListArticles.length > 0 && (
                  <div className="news-main-list">
                    {leftListArticles.map((article: any) => (
                      <div key={article.id} className="news-list-item">
                        <div className="image-wrapper">
                          <span className="news-badge">TIN TỨC</span>
                          {getImageUrl(article.thumbnail) && (
                            <img src={getImageUrl(article.thumbnail)} alt={article.title} />
                          )}
                        </div>
                        <div className="content">
                          <div className="meta-date">{formatDate(article.createdAt)} • Tin tức</div>
                          <h3>
                            <Link href={`/news/${article.slug}`}>{article.title}</Link>
                          </h3>
                          <p className="excerpt">{article.excerpt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <aside className="news-sidebar">
                {rightTopArticles.length > 0 && (
                  <div className="sidebar-list">
                    {rightTopArticles.map((article: any) => (
                      <div key={article.id} className="sidebar-item">
                        <div className="meta-date">{formatDate(article.createdAt)} • Tin tức</div>
                        <h3>
                          <Link href={`/news/${article.slug}`}>{article.title}</Link>
                        </h3>
                      </div>
                    ))}
                  </div>
                )}

                {mostViewedArticles.length > 0 && (
                  <div className="most-viewed-widget">
                    <h3>Bài viết được xem nhiều nhất</h3>
                    <div className="most-viewed-list">
                      {mostViewedArticles.map((article: any, index: number) => (
                        <div key={article.id} className="viewed-item">
                          <span className="viewed-rank">{index + 1}</span>
                          <h4>
                            <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>

            {/* --- THANH ĐIỀU HƯỚNG --- */}
            {totalPages > 1 && (
              <div className="pagination-container">
                {hasPrevPage ? (
                  <Link href={`/articles?page=${prevPage}`} className="page-btn">
                    &laquo; Trang trước
                  </Link>
                ) : (
                  <span className="page-btn disabled">&laquo; Trang trước</span>
                )}

                <span className="page-info">
                  Trang {currentPage} / {totalPages}
                </span>

                {hasNextPage ? (
                  <Link href={`/articles?page=${nextPage}`} className="page-btn">
                    Trang sau &raquo;
                  </Link>
                ) : (
                  <span className="page-btn disabled">Trang sau &raquo;</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
