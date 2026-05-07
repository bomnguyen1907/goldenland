import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dang-tin', '/account']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  )

  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get('payload-token')
  if (token) return NextResponse.next()

  const loginUrl = new URL('/dang-nhap', request.url)
  loginUrl.searchParams.set('next', pathname)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/dang-tin', '/dang-tin/:path*', '/account', '/account/:path*'],
}
