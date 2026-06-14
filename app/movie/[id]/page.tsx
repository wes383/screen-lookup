import type { Metadata } from 'next'
import { getServerMovieDetails, getImageUrl } from '../../../src/services/server-api'
import MovieDetail from '../../../src/components/MovieDetail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const movie = await getServerMovieDetails(id)
    
    if (!movie) {
        return {
            title: 'Movie Not Found - Kino',
        }
    }
    
    const year = movie.release_date?.split('-')[0]
    const title = year ? `${movie.title} (${year})` : movie.title
    const ogImage = getImageUrl(movie.poster_path, 'w500')
    
    return {
        title: `${title} - Kino`,
        description: movie.overview || `${movie.title} - View details, cast, ratings, and more on Kino.`,
        keywords: [
            movie.title,
            movie.original_title,
            ...(movie.genres?.map(g => g.name) || []),
            'movie',
            'film',
            'cinema'
        ].filter(Boolean),
        openGraph: {
            title: `${title} - Kino`,
            description: movie.overview || `${movie.title} - View details, cast, ratings, and more on Kino.`,
            type: 'video.movie',
            images: ogImage ? [{ url: ogImage, alt: movie.title }] : [],
            siteName: 'Kino',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} - Kino`,
            description: movie.overview || `${movie.title} - View details, cast, ratings, and more on Kino.`,
            images: ogImage ? [ogImage] : [],
        },
        robots: {
            index: true,
            follow: true,
        },
    }
}

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return <MovieDetail />
}
