import React from 'react'

export type Article = {
  id: string | number
  title: string
  summary: string
  date: string
  readTime: string
  image: string
  label: string
}

interface ArticleHeroItemProps {
  article: Article
  isFading: boolean
}

export function ArticleHeroItem({ article, isFading }: ArticleHeroItemProps) {
  return (
    <div
      className={`group cursor-pointer transition-all duration-300 ease-out lg:col-span-8 ${
        isFading ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="relative mb-6 overflow-hidden rounded-full">
        <img
          alt={article.title}
          className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={article.image}
        />
        <div className="absolute left-6 top-6">
          <span className="bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            {article.label}
          </span>
        </div>
      </div>
      <h3 className="mb-4 text-2xl font-bold leading-snug transition-colors group-hover:text-primary">
        {article.title}
      </h3>
      <p className="mb-4 leading-relaxed text-secondary">{article.summary}</p>
      <div className="flex items-center gap-4 text-xs text-secondary">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">calendar_today</span>
          {article.date}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">schedule</span>
          {article.readTime}
        </span>
      </div>
    </div>
  )
}

interface ArticleListItemProps {
  article: Article
  isActive: boolean
  isLast: boolean
  onActivate: () => void
}

export function ArticleListItem({ article, isActive, isLast, onActivate }: ArticleListItemProps) {
  return (
    <div
      className={`group -mx-2 flex cursor-pointer gap-4 rounded-lg px-2 py-2 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-surface-container-low ${
        isActive ? 'bg-surface-container-low' : ''
      } ${!isLast ? 'border-b border-outline-variant/10 pb-6' : ''}`}
      onFocus={onActivate}
      onMouseEnter={onActivate}
      role="button"
      tabIndex={0}
    >
      <div className="space-y-1">
        <h4 className="text-sm font-bold leading-tight transition-colors group-hover:text-primary">
          {article.title}
        </h4>
      </div>
    </div>
  )
}
