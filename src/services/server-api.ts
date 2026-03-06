const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

const getApiKey = (): string => {
    const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY
    if (!apiKey) {
        throw new Error('TMDB API key not found')
    }
    return apiKey
}

const fetchFromTMDB = async <T>(path: string, params: Record<string, string> = {}): Promise<T | null> => {
    try {
        const url = new URL(`${TMDB_BASE_URL}/${path}`)
        url.searchParams.append('api_key', getApiKey())
        
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value)
        })
        
        const response = await fetch(url.toString(), {
            next: { revalidate: 3600 }
        })
        
        if (!response.ok) return null
        return response.json()
    } catch {
        return null
    }
}

export interface ServerMovieDetails {
    id: number
    title: string
    original_title: string
    poster_path: string | null
    overview: string
    release_date: string
    backdrop_path: string | null
    runtime: number
    genres: { id: number; name: string }[]
    tagline: string | null
    vote_average: number
    vote_count: number
    imdb_id?: string
}

export const getServerMovieDetails = async (id: string): Promise<ServerMovieDetails | null> => {
    return fetchFromTMDB<ServerMovieDetails>(`movie/${id}`)
}

export interface ServerTVDetails {
    id: number
    name: string
    original_name: string
    poster_path: string | null
    overview: string
    first_air_date: string
    backdrop_path: string | null
    genres: { id: number; name: string }[]
    tagline: string | null
    vote_average: number
    vote_count: number
    number_of_seasons: number
    number_of_episodes: number
}

export const getServerTVDetails = async (id: string): Promise<ServerTVDetails | null> => {
    return fetchFromTMDB<ServerTVDetails>(`tv/${id}`)
}

export interface ServerPersonDetails {
    id: number
    name: string
    biography: string
    birthday: string | null
    deathday: string | null
    profile_path: string | null
    known_for_department: string
    place_of_birth: string | null
}

export const getServerPersonDetails = async (id: string): Promise<ServerPersonDetails | null> => {
    return fetchFromTMDB<ServerPersonDetails>(`person/${id}`)
}

export const getImageUrl = (path: string | null, size: string = 'w500'): string | null => {
    if (!path) return null
    return `https://image.tmdb.org/t/p/${size}${path}`
}
