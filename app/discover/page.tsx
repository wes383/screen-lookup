import type { Metadata } from 'next'
import Discover from '../../src/components/Discover'

export const metadata: Metadata = {
    title: 'Discover Movies & TV Shows - Kino',
    description: 'Discover new movies and TV shows. Search by genre, year, rating, and more to find your next favorite film or series.',
    keywords: ['discover movies', 'discover TV shows', 'movie search', 'TV search', 'find movies', 'film discovery'],
    openGraph: {
        title: 'Discover Movies & TV Shows - Kino',
        description: 'Discover new movies and TV shows. Search by genre, year, rating, and more to find your next favorite film or series.',
        type: 'website',
        siteName: 'Kino',
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function DiscoverPage() {
    return <Discover />
}
