'use client'

import { useEffect, useRef } from 'react'
import { trackArticleView } from '@/app/services/articles'

export function ViewCounter({ articleId }: { articleId: string }) {
  const hasFetched = useRef(false)

  useEffect(() => {
    // Only fetch once per mount to prevent double-counting in strict mode
    if (!hasFetched.current) {
      hasFetched.current = true

      trackArticleView(articleId).catch(console.error)
    }
  }, [articleId])

  return null
}
