import type { Metadata } from 'next'
import MovieList from '../../../src/components/MovieList'

const movieListTitles: Record<string, { title: string; description: string }> = {
    'popular': {
        title: 'Popular Movies - Kino',
        description: 'Discover the most popular movies right now. See what\'s trending and being watched worldwide.',
    },
    'top-rated': {
        title: 'Top Rated Movies - Kino',
        description: 'The highest-rated movies of all time. Explore critically acclaimed films loved by audiences.',
    },
    'now-playing': {
        title: 'Now Playing in Theaters - Kino',
        description: 'Movies currently playing in theaters. Find showtimes and discover new releases.',
    },
    'upcoming': {
        title: 'Upcoming Movies - Kino',
        description: 'Coming soon to theaters. Preview the most anticipated upcoming movie releases.',
    },
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
    const { type } = await params
    const listInfo = movieListTitles[type]
    
    if (!listInfo) {
        return {
            title: 'Movies - Kino',
            description: 'Browse movies on Kino.',
        }
    }
    
    return {
        title: listInfo.title,
        description: listInfo.description,
        keywords: [type.replace(/-/g, ' '), 'movies', 'films', 'cinema', 'movie list'],
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

export default function MovieListPage({ params }: { params: Promise<{ type: string }> }) {
    return <MovieList />
}
