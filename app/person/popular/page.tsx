import type { Metadata } from 'next'
import PersonList from '../../../src/components/PersonList'

export const metadata: Metadata = {
  title: 'Popular People - Screen Lookup',
  description: 'Discover popular actors, directors, and other entertainment figures trending on Screen Lookup.',
  keywords: ['popular people', 'actors', 'directors', 'celebrities', 'trending people', 'TMDB people'],
  alternates: {
    canonical: '/person/popular',
  },
  openGraph: {
    title: 'Popular People - Screen Lookup',
    description: 'Discover popular actors, directors, and other entertainment figures trending on Screen Lookup.',
    type: 'website',
    siteName: 'Screen Lookup',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PersonPopularPage() {
  return <PersonList />
}
