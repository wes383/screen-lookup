import type { Metadata } from 'next'
import TrendingList from '../../../src/components/TrendingList'

const trendingTitles: Record<string, { title: string; description: string }> = {
    'all': {
        title: 'Trending Movies & TV Shows - Kino',
        description: 'Discover what\'s trending in movies and TV shows. See the most popular content right now.',
    },
    'movie': {
        title: 'Trending Movies - Kino',
        description: 'Discover the hottest trending movies. See what films are gaining popularity right now.',
    },
    'tv': {
        title: 'Trending TV Shows - Kino',
        description: 'Discover the hottest trending TV shows. See what series are gaining popularity right now.',
    },
    'person': {
        title: 'Trending People - Kino',
        description: 'Discover trending actors, directors, and filmmakers. See who\'s making waves in entertainment.',
    },
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
    const { type } = await params
    const listInfo = trendingTitles[type]
    
    if (!listInfo) {
        return {
            title: 'Trending - Kino',
            description: 'See what\'s trending on Kino.',
        }
    }
    
    return {
        title: listInfo.title,
        description: listInfo.description,
        keywords: [type, 'trending', 'popular', 'hot', 'viral', type === 'movie' ? 'movies' : type === 'tv' ? 'TV shows' : ''],
        openGraph: {
            title: listInfo.title,
            description: listInfo.description,
            type: 'website',
            siteName: 'Kino',
        },
        robots: {
            index: true,
            follow: true,
        },
    }
}

export default function TrendingListPage({ params }: { params: Promise<{ type: string }> }) {
    return <TrendingList />
}
