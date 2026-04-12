import React from 'react'
import Link from 'next/link'

export default function Footer() {
    const s = {
        footer: {
            borderTop: '1px solid #000',
            background: '#fff',
            marginTop: 60,
            padding: '40px 0 20px 0',
        } as React.CSSProperties,
        container: {
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 20px',
        } as React.CSSProperties,
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 40,
            marginBottom: 32,
        } as React.CSSProperties,
        colTitle: {
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 14,
            textTransform: 'uppercase' as const,
            letterSpacing: 1,
        } as React.CSSProperties,
        link: {
            display: 'block',
            color: '#555',
            textDecoration: 'none',
            fontSize: 13,
            marginBottom: 8,
        } as React.CSSProperties,
        text: {
            color: '#555',
            fontSize: 13,
            lineHeight: 1.7,
        } as React.CSSProperties,
        bottom: {
            borderTop: '1px solid #e5e5e5',
            paddingTop: 20,
            textAlign: 'center' as const,
            fontSize: 12,
            color: '#999',
        } as React.CSSProperties,
    }

    return (
        <footer style={s.footer}>
            <div style={s.container}>
                <div style={s.grid}>
                    <div>
                        <div style={{ ...s.colTitle, fontSize: 16 }}>GOLDEN LAND</div>
                        <div style={s.text}>
                            Nền tảng bất động sản hàng đầu Việt Nam. Kết nối người mua, người bán và chủ đầu tư.
                        </div>
                    </div>

                    <div>
                        <div style={s.colTitle}>Sản phẩm</div>
                        <Link href="/listings?type=sale" style={s.link}>
                            Nhà đất bán
                        </Link>
                        <Link href="/listings?type=rent" style={s.link}>
                            Nhà đất cho thuê
                        </Link>
                        <Link href="/projects" style={s.link}>
                            Dự án
                        </Link>
                        <Link href="/articles" style={s.link}>
                            Tin tức
                        </Link>
                    </div>

                    <div>
                        <div style={s.colTitle}>Hỗ trợ</div>
                        <Link href="/" style={s.link}>
                            Hướng dẫn đăng tin
                        </Link>
                        <Link href="/" style={s.link}>
                            Bảng giá dịch vụ
                        </Link>
                        <Link href="/" style={s.link}>
                            Câu hỏi thường gặp
                        </Link>
                        <Link href="/" style={s.link}>
                            Liên hệ
                        </Link>
                    </div>

                    <div>
                        <div style={s.colTitle}>Liên hệ</div>
                        <div style={s.text}>
                            Hotline: 1900 1234
                            <br />
                            Email: support@goldenland.vn
                            <br />
                            Địa chỉ: TP. Hồ Chí Minh
                        </div>
                    </div>
                </div>

                <div style={s.bottom}>© {new Date().getFullYear()} Golden Land. All rights reserved.</div>
            </div>
        </footer>
    )
}