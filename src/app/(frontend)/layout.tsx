import React from 'react'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

import config from '@/payload.config'


import './styles.css'
import Footer from './components/Footer'
import TopAppBar from './components/Header'

export const metadata = {
  title: 'Golden Land - Bất động sản',
  description: 'Nền tảng bất động sản hàng đầu Việt Nam',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  let currentUser: { email?: string | null; id?: number | string; name?: string | null } | null =
    null

  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: await config })
    const { user } = await payload.auth({ headers })

    currentUser = user
      ? {
          id: user.id,
          email: user.email,
          name: (user as { name?: string | null }).name ?? null,
        }
      : null
  } catch {
    currentUser = null
  }

  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface font-body">
        <TopAppBar user={currentUser} />
        <main>{children}</main>

        <Footer />
      </body>
    </html>
  )
}