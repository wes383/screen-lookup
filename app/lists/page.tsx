import type { Metadata } from 'next'
import Lists from '../../src/components/Lists'

export const metadata: Metadata = {
    title: 'Lists - Kino',
    description: 'Browse curated lists of movies and TV shows. Explore top-rated, popular, and trending content across different categories.',
    keywords: ['movie lists', 'TV lists', 'top movies', 'top TV shows', 'popular movies', 'trending'],
    openGraph: {
        title: 'Lists - Kino',
        description: 'Browse curated lists of movies and TV shows. Explore top-rated, popular, and trending content across different categories.',
        type: 'website',
        siteName: 'Kino',
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function ListsPage() {
    return <Lists />
}
