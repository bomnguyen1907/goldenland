import React from 'react'
import { headers as getHeaders } from 'next/headers.js' // Get request headers (cookies, auth info)
import { getPayload } from 'payload' // Create Payload instance to use its API

import config from '@/payload.config' // Payload configuration

import './styles.css'
import Footer from './components/Footer'
import Header from './components/Header'

// SEO metadata for the app
export const metadata = {
  title: 'Golden Land - Bất động sản',
  description: 'Nền tảng bất động sản hàng đầu Việt Nam',
}

// Root layout (wraps the whole app)
export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  // Store current logged-in user
  let currentUser: {
    email?: string | null
    id?: number | string
    name?: string | null
  } | null = null

  try {
    // Get request headers (contains cookies, token)
    const headers = await getHeaders()

    // Initialize Payload with config
    const payload = await getPayload({ config: await config })

    // Authenticate user using headers
    const { user } = await payload.auth({ headers })

    // If user exists, extract needed fields
    currentUser = user
      ? {
          id: user.id,
          email: user.email,
          name: (user as { name?: string | null }).name ?? null,
        }
      : null
  } catch {
    // If error happens, set user to null
    currentUser = null
  }

  return (
    <html lang="vi" className="scrollbar-hide">
      <head>
        {/* Load Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Load Material Icons */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="bg-background text-on-surface font-body">
        {/* Pass user to Header */}
        <Header user={currentUser} />

        {/* Render page content */}
        <main>{children}</main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  )
}
