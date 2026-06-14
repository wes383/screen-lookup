import type { Metadata } from 'next'
import ListDetail from '../../../src/components/ListDetail'

const listTitles: Record<string, { title: string; description: string }> = {
    'recommendations': {
        title: 'Recommendations - Kino',
        description: 'Personalized movie and TV show recommendations based on your preferences.',
    },
    'oscar': {
        title: 'Academy Awards - Kino',
        description: 'Complete list of Academy Award winners throughout history.',
    },
    'cannes': {
        title: 'Cannes Film Festival - Kino',
        description: 'Complete list of Cannes Film Festival award winners throughout history.',
    },
    'venice': {
        title: 'Venice Film Festival - Kino',
        description: 'Complete list of Venice Film Festival award winners throughout history.',
    },
    'berlinale': {
        title: 'Berlin International Film Festival - Kino',
        description: 'Complete list of Berlin International Film Festival award winners throughout history.',
    },
    'sightandsound': {
        title: 'Sight & Sound Greatest Films of All Time - Kino',
        description: 'BFI Sight & Sound Greatest Films of All Time. The most prestigious film poll in the world.',
    },
    'tspdt': {
        title: 'TSPDT 1000 Greatest Films - Kino',
        description: 'They Shoot Pictures, Don\'t They? 1000 greatest films of all time.',
    },
    'afi': {
        title: 'AFI 100 Years... 100 Movies - Kino',
        description: 'American Film Institute\'s 100 greatest American movies of all time.',
    },
    'cahiers': {
        title: 'Cahiers du Cinéma Top 10 - Kino',
        description: 'Cahiers du Cinéma annual top 10 films.',
    },
    'tspdt21st': {
        title: "TSPDT 21st Century's 1000 Most Acclaimed Films - Kino",
        description: 'The greatest films made since 2000.',
    },
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
    const { type } = await params
    const listInfo = listTitles[type]
    
    if (!listInfo) {
        return {
            title: 'List Not Found - Kino',
        }
    }
    
    return {
        title: listInfo.title,
        description: listInfo.description,
        keywords: [type.replace(/-/g, ' '), 'movie list', 'film ranking', 'best movies', 'cinema'],
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

export default function ListDetailPage({ params }: { params: Promise<{ type: string }> }) {
    return <ListDetail />
}
