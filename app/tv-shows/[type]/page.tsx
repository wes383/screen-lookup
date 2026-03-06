import type { Metadata } from 'next'
import TVList from '../../../src/components/TVList'

const tvListTitles: Record<string, { title: string; description: string }> = {
    'popular': {
        title: 'Popular TV Shows - Screen Lookup',
        description: 'Discover the most popular TV shows right now. See what everyone is watching and talking about.',
    },
    'top-rated': {
        title: 'Top Rated TV Shows - Screen Lookup',
        description: 'The highest-rated TV series of all time. Explore critically acclaimed shows loved by audiences.',
    },
    'airing-today': {
        title: 'TV Shows Airing Today - Screen Lookup',
        description: 'TV shows airing new episodes today. Never miss your favorite shows again.',
    },
    'on-the-air': {
        title: 'Currently Airing TV Shows - Screen Lookup',
        description: 'TV shows currently airing new episodes. Stay up to date with ongoing series.',
    },
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
    const { type } = await params
    const listInfo = tvListTitles[type]
    
    if (!listInfo) {
        return {
            title: 'TV Shows - Screen Lookup',
            description: 'Browse TV shows on Screen Lookup.',
        }
    }
    
    return {
        title: listInfo.title,
        description: listInfo.description,
        keywords: [type.replace(/-/g, ' '), 'TV shows', 'TV series', 'streaming', 'television'],
        openGraph: {
            title: listInfo.title,
            description: listInfo.description,
            type: 'website',
            siteName: 'Screen Lookup',
        },
        robots: {
            index: true,
            follow: true,
        },
    }
}

export default function TVListPage({ params }: { params: Promise<{ type: string }> }) {
    return <TVList />
}
