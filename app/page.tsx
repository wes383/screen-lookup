import type { Metadata } from 'next'
import Home from '../src/components/Home'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return <Home />
}
