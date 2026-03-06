import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
  }

  try {
    const imageUrl = `https://image.tmdb.org${path}`
    
    const response = await fetch(imageUrl)

    if (!response.ok) {
      return new NextResponse(null, { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(Buffer.from(imageBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 's-maxage=31536000, stale-while-revalidate',
      },
    })
  } catch (error) {
    console.error('TMDB Image Proxy Error:', error)
    return NextResponse.json({ error: 'Failed to fetch image from TMDB' }, { status: 500 })
  }
}
