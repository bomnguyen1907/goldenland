import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import './styles.css'

export const metadata = {
  title: 'Golden Land - Bất động sản',
  description: 'Nền tảng bất động sản hàng đầu Việt Nam',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, padding: 0, background: '#fff' }}>
        <Header />
        <main style={{ minHeight: 'calc(100vh - 64px - 300px)' }}>{children}</main>
        <Footer />
      </body>
    </html>
  )
}