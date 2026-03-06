import type { Metadata } from 'next'
import { getServerTVDetails, getImageUrl } from '../../../src/services/server-api'
import TVDetail from '../../../src/components/TVDetail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const tv = await getServerTVDetails(id)
    
    if (!tv) {
        return {
            title: 'TV Show Not Found - Screen Lookup',
        }
    }
    
    const year = tv.first_air_date?.split('-')[0]
    const title = year ? `${tv.name} (${year})` : tv.name
    const ogImage = getImageUrl(tv.poster_path, 'w500')
    
    return {
        title: `${title} - Screen Lookup`,
        description: tv.overview || `${tv.name} - View details, cast, ratings, seasons, and more on Screen Lookup.`,
        keywords: [
            tv.name,
            tv.original_name,
            ...(tv.genres?.map(g => g.name) || []),
            'TV show',
            'TV series',
            'streaming'
        ].filter(Boolean),
        openGraph: {
            title: `${title} - Screen Lookup`,
            description: tv.overview || `${tv.name} - View details, cast, ratings, seasons, and more on Screen Lookup.`,
            type: 'video.tv_show',
            images: ogImage ? [{ url: ogImage, alt: tv.name }] : [],
            siteName: 'Screen Lookup',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} - Screen Lookup`,
            description: tv.overview || `${tv.name} - View details, cast, ratings, seasons, and more on Screen Lookup.`,
            images: ogImage ? [ogImage] : [],
        },
        robots: {
            index: true,
            follow: true,
        },
    }
}

export default function TVDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return <TVDetail />
}
