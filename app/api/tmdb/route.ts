import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
  }

  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 })
  }

  try {
    const url = new URL(`https://api.themoviedb.org/3/${path}`)

    searchParams.forEach((value, key) => {
      if (key !== 'path') {
        url.searchParams.append(key, value)
      }
    })

    url.searchParams.append('api_key', apiKey)

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    })
  } catch (error) {
    console.error('TMDB API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch data from TMDB' }, { status: 500 })
  }
}
