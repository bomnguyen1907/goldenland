'use client'

import { useState } from 'react'
import SideBar from './SideBar'
import PostFlowModal from '../management/components/PostFlowModal'

export default function AccountShell({ children }: { children: React.ReactNode }) {
  const [isPostFlowOpen, setIsPostFlowOpen] = useState(false)
  const [openToken, setOpenToken] = useState(0)

  const openPostFlow = () => {
    setOpenToken((prev) => prev + 1)
    setIsPostFlowOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-[#f9f9f9] font-body text-[#2c2c2c]">
      <SideBar onCreatePostClick={openPostFlow} />
      <main className="min-w-0 flex-1">{children}</main>

      <PostFlowModal key={openToken} isOpen={isPostFlowOpen} onClose={() => setIsPostFlowOpen(false)} />
    </div>
  )
}
