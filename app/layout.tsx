import type { Metadata, Viewport } from 'next'
import '../src/index.css'
import '../src/App.css'
import '../src/mobile.css'
import ClientLayout from './ClientLayout'

export const metadata: Metadata = {
  title: 'Kino - Discover Movies & TV Shows',
  description: 'A modern, multilingual web application for looking up information about movies, TV shows, and people. Powered by TMDB API.',
  keywords: ['movies', 'TV shows', 'film', 'cinema', 'TMDB', 'movie database', 'TV series', 'actors', 'directors', 'filmography', 'movie ratings', 'TV ratings', 'streaming', 'entertainment'],
  authors: [{ name: 'Kino' }],
  creator: 'Kino',
  publisher: 'Kino',
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL('/', 'https://kino.wesluma.com'),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kino.wesluma.com',
    title: 'Kino - Discover Movies & TV Shows',
    description: 'A modern, multilingual web application for looking up information about movies, TV shows, and people. Powered by TMDB API.',
    siteName: 'Kino',
  },
  twitter: {
    card: 'summary',
    title: 'Kino - Discover Movies & TV Shows',
    description: 'A modern, multilingual web application for looking up information about movies, TV shows, and people. Powered by TMDB API.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
