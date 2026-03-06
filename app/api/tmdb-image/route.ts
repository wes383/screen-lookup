import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
  }

  try {
    const imageUrl = `https://image.tmdb.org${path}`

    const response = await fetch(imageUrl, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    })

    if (!response.ok) {
      return new NextResponse(null, { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const contentLength = response.headers.get('content-length')

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': contentType,
        ...(contentLength ? { 'Content-Length': contentLength } : {}),
        'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate',
      },
    })
  } catch (error) {
    console.error('TMDB Image Proxy Error:', error)
    return NextResponse.json({ error: 'Failed to fetch image from TMDB' }, { status: 500 })
  }
}
