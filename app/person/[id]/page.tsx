import type { Metadata } from 'next'
import { getServerPersonDetails, getImageUrl } from '../../../src/services/server-api'
import PersonDetail from '../../../src/components/PersonDetail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const person = await getServerPersonDetails(id)
    
    if (!person) {
        return {
            title: 'Person Not Found - Kino',
        }
    }
    
    const ogImage = getImageUrl(person.profile_path, 'w500')
    const description = person.biography 
        ? person.biography.slice(0, 160) + (person.biography.length > 160 ? '...' : '')
        : `${person.name} - View filmography, biography, and more on Kino.`
    
    return {
        title: `${person.name} - Kino`,
        description,
        keywords: [
            person.name,
            person.known_for_department,
            'actor',
            'actress',
            'director',
            'filmography'
        ].filter(Boolean),
        openGraph: {
            title: `${person.name} - Kino`,
            description,
            type: 'profile',
            images: ogImage ? [{ url: ogImage, alt: person.name }] : [],
            siteName: 'Kino',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${person.name} - Kino`,
            description,
            images: ogImage ? [ogImage] : [],
        },
        robots: {
            index: true,
            follow: true,
        },
    }
}

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return <PersonDetail />
}
