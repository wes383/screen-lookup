import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const host = request.headers.get('host')
    const url = request.nextUrl

    if (host === 'screen-lookup.vercel.app') {
        url.host = 'kino.wesluma.com'
        url.protocol = 'https'
        return NextResponse.redirect(url, 301)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|google.*\\.html$).*)',
    ],
}
