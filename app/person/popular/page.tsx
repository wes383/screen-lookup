import type { Metadata } from 'next'
import PersonList from '../../../src/components/PersonList'

export const metadata: Metadata = {
  title: 'Popular People - Kino',
  description: 'Discover popular actors, directors, and other entertainment figures trending on Kino.',
  keywords: ['popular people', 'actors', 'directors', 'celebrities', 'trending people', 'TMDB people'],
  alternates: {
    canonical: '/person/popular',
  },
  openGraph: {
    title: 'Popular People - Kino',
    description: 'Discover popular actors, directors, and other entertainment figures trending on Kino.',
    type: 'website',
    siteName: 'Kino',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PersonPopularPage() {
  return <PersonList />
}
