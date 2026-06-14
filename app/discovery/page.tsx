import type { Metadata } from 'next'
import MediaDiscovery from '../../src/components/MediaDiscovery'

export const metadata: Metadata = {
    title: 'Advanced Discovery - Kino',
    description: 'Advanced movie and TV show discovery. Filter by multiple criteria including genre, year, rating, language, and more.',
    keywords: ['advanced movie search', 'advanced TV search', 'movie filter', 'TV filter', 'film discovery'],
    openGraph: {
        title: 'Advanced Discovery - Kino',
        description: 'Advanced movie and TV show discovery. Filter by multiple criteria including genre, year, rating, language, and more.',
        type: 'website',
        siteName: 'Kino',
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function MediaDiscoveryPage() {
    return <MediaDiscovery />
}
