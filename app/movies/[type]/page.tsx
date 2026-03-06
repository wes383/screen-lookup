'use client'

import MovieList from '../../../src/components/MovieList'

export default function MovieListPage({ params }: { params: { type: string } }) {
  return <MovieList />
}
