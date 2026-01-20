export interface MovieDetails {
    id: number;
    title: string;
    original_title: string;
    poster_path: string | null;
    overview: string;
    release_date: string;
    backdrop_path: string | null;
    runtime: number;
    genres: { id: number; name: string }[];
    tagline: string | null;
    status: string;
    original_language: string;
    budget: number;
    revenue: number;
    homepage?: string;
    imdb_id?: string;
    spoken_languages: { iso_639_1: string; name: string }[];
    production_countries: { iso_3166_1: string; name: string }[];
    production_companies: { id: number; logo_path: string | null; name: string; origin_country: string }[];
    vote_average: number;
    vote_count: number;
}

const USE_DIRECT_API = import.meta.env.VITE_USE_DIRECT_API === 'true';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper function to build API URL
const buildApiUrl = (path: string, params: Record<string, string> = {}): string => {
    if (USE_DIRECT_API && API_KEY) {
        // Development mode: direct API call
        const url = new URL(`${TMDB_BASE_URL}/${path}`);
        url.searchParams.append('api_key', API_KEY);
        
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        
        return url.toString();
    } else {
        // Production mode: use serverless function
        const url = new URL('/api/tmdb', window.location.origin);
        url.searchParams.append('path', path);
        
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        
        return url.toString();
    }
};

export const getMovieDetails = async (id: string, language: string = 'en-US'): Promise<MovieDetails> => {
    const url = buildApiUrl(`movie/${id}`, { language });
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch movie details');
    }

    return response.json();
};

export const getImageUrl = (path: string | null, size: string = 'w500') => {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

export interface MovieLogo {
    file_path: string;
    width: number;
    height: number;
    iso_639_1: string | null;
}

export const getMovieLogos = async (id: string, language: string = 'en'): Promise<MovieLogo[]> => {
    const url = buildApiUrl(`movie/${id}/images`, { include_image_language: language });
    
    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return data.logos || [];
    } catch {
        return [];
    }
}

export const getMovieCertification = async (id: string, countryCode: string = 'US'): Promise<string | null> => {
    const url = buildApiUrl(`movie/${id}/release_dates`);

    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        // Try to find certification for the specified country first
        const countryRelease = data.results?.find((r: { iso_3166_1: string }) => r.iso_3166_1 === countryCode);
        if (countryRelease?.release_dates?.length) {
            const cert = countryRelease.release_dates.find((rd: { certification: string }) => rd.certification)?.certification;
            if (cert) return cert;
        }
        // Fallback to US certification
        const usRelease = data.results?.find((r: { iso_3166_1: string }) => r.iso_3166_1 === 'US');
        if (usRelease?.release_dates?.length) {
            const cert = usRelease.release_dates.find((rd: { certification: string }) => rd.certification)?.certification;
            if (cert) return cert;
        }
        // Fallback to first available certification
        for (const result of data.results || []) {
            const cert = result.release_dates?.find((rd: { certification: string }) => rd.certification)?.certification;
            if (cert) return cert;
        }
        return null;
    } catch {
        return null;
    }
}

export interface ReleaseDateItem {
    certification: string;
    iso_639_1: string;
    note: string;
    release_date: string;
    type: number;
}

export interface CountryReleaseDates {
    iso_3166_1: string;
    release_dates: ReleaseDateItem[];
}

export const getMovieReleaseDates = async (id: string): Promise<CountryReleaseDates[]> => {
    const url = buildApiUrl(`movie/${id}/release_dates`);

    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || [];
    } catch {
        return [];
    }
}

export interface WatchProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string;
}

export interface WatchProviderData {
    flatrate?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
    link?: string;
}

export const getWatchProviders = async (id: string, country: string = 'US'): Promise<WatchProviderData | null> => {
    const url = buildApiUrl(`movie/${id}/watch/providers`);

    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        return data.results?.[country] || null;
    } catch {
        return null;
    }
}

export interface Keyword {
    id: number;
    name: string;
}

export const getMovieKeywords = async (id: string): Promise<Keyword[]> => {
    const url = buildApiUrl(`movie/${id}/keywords`);

    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return data.keywords || [];
    } catch {
        return [];
    }
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

export interface CrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
}

export interface MovieCredits {
    cast: CastMember[];
    crew: CrewMember[];
}

export const getMovieCredits = async (id: string, language: string = 'en-US'): Promise<MovieCredits> => {
    const url = buildApiUrl(`movie/${id}/credits`, { language });

    try {
        const response = await fetch(url);
        if (!response.ok) return { cast: [], crew: [] };
        const data = await response.json();
        return { cast: data.cast || [], crew: data.crew || [] };
    } catch {
        return { cast: [], crew: [] };
    }
}

export interface AlternativeTitle {
    iso_3166_1: string;
    title: string;
    type: string;
}

export const getMovieAlternativeTitles = async (id: string): Promise<AlternativeTitle[]> => {
    const url = buildApiUrl(`movie/${id}/alternative_titles`);

    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return data.titles || [];
    } catch {
        return [];
    }
}

export interface MovieVideo {
    id: string;
    iso_639_1: string;
    iso_3166_1: string;
    key: string;
    name: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    published_at: string;
}

export const getMovieVideos = async (id: string): Promise<MovieVideo[]> => {
    const url = buildApiUrl(`movie/${id}/videos`);

    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || [];
    } catch {
        return [];
    }
}

export interface Season {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    vote_average: number;
}

export interface CreatedBy {
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path: string | null;
}

export interface TVDetails {
    backdrop_path: string | null;
    created_by: CreatedBy[];
    episode_run_time: number[];
    first_air_date: string;
    genres: { id: number; name: string }[];
    homepage: string;
    id: number;
    in_production: boolean;
    languages: string[];
    last_air_date: string;
    name: string;
    networks: { id: number; logo_path: string | null; name: string; origin_country: string }[];
    number_of_episodes: number;
    number_of_seasons: number;
    origin_country: string[];
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string | null;
    production_companies: { id: number; logo_path: string | null; name: string; origin_country: string }[];
    production_countries: { iso_3166_1: string; name: string }[];
    seasons: Season[];
    spoken_languages: { iso_639_1: string; name: string }[];
    status: string;
    tagline: string;
    type: string;
    vote_average: number;
    vote_count: number;
    external_ids?: {
        imdb_id?: string | null;
        freebase_mid?: string | null;
        freebase_id?: string | null;
        tvdb_id?: number | null;
        tvrage_id?: number | null;
        wikidata_id?: string | null;
        facebook_id?: string | null;
        instagram_id?: string | null;
        twitter_id?: string | null;
    };
    next_episode_to_air: {
        id: number;
        name: string;
        overview: string;
        vote_average: number;
        vote_count: number;
        air_date: string;
        episode_number: number;
        episode_type: string;
        production_code: string;
        runtime: number | null;
        season_number: number;
        show_id: number;
        still_path: string | null;
    } | null;
    last_episode_to_air: {
        id: number;
        name: string;
        overview: string;
        vote_average: number;
        vote_count: number;
        air_date: string;
        episode_number: number;
        episode_type: string;
        production_code: string;
        runtime: number | null;
        season_number: number;
        show_id: number;
        still_path: string | null;
    } | null;
}

export const getTVDetails = async (id: string, language: string = 'en-US'): Promise<TVDetails> => {
    const url = buildApiUrl(`tv/${id}`, { 
        append_to_response: 'external_ids',
        language 
    });

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch TV details');
    return response.json();
};

export const getTVCredits = async (id: string, language: string = 'en-US'): Promise<MovieCredits> => {
    const url = buildApiUrl(`tv/${id}/aggregate_credits`, { language });

    try {
        const response = await fetch(url);
        if (!response.ok) return { cast: [], crew: [] };
        const data = await response.json();

        // Map aggregate credits (roles/jobs) to standard MovieCredits format (character/job)
        const cast = (data.cast || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            profile_path: c.profile_path,
            character: c.roles?.map((r: any) => `${r.character} (${r.episode_count} eps)`).join(', ') || ''
        }));

        const crew = (data.crew || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            profile_path: c.profile_path,
            job: c.jobs?.map((j: any) => `${j.job} (${j.episode_count} eps)`).join(', ') || '',
            department: c.department || (c.jobs?.[0]?.department) || ''
        }));

        return { cast, crew };
    } catch {
        return { cast: [], crew: [] };
    }
};

export const getTVKeywords = async (id: string): Promise<Keyword[]> => {
    const url = buildApiUrl(`tv/${id}/keywords`);

    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || [];
    } catch {
        return [];
    }
};

export interface ContentRating {
    iso_3166_1: string;
    rating: string;
}

export const getTVContentRatings = async (id: string): Promise<ContentRating[]> => {
    const url = buildApiUrl(`tv/${id}/content_ratings`);

    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || [];
    } catch {
        return [];
    }
};

export const getTVVideos = async (id: string): Promise<MovieVideo[]> => {
    const url = buildApiUrl(`tv/${id}/videos`);

    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || [];
    } catch {
        return [];
    }
};

export const getTVAlternativeTitles = async (id: string): Promise<AlternativeTitle[]> => {
    const url = buildApiUrl(`tv/${id}/alternative_titles`);

    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || [];
    } catch {
        return [];
    }
};

export const getTVWatchProviders = async (id: string, country: string = 'US'): Promise<WatchProviderData | null> => {
    const url = buildApiUrl(`tv/${id}/watch/providers`);

    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        return data.results?.[country] || null;
    } catch {
        return null;
    }
};

export const getTVLogos = async (id: string, language: string = 'en'): Promise<MovieLogo[]> => {
    const url = buildApiUrl(`tv/${id}/images`, { include_image_language: language });

    try {
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return data.logos || [];
    } catch {
        return [];
    }
};

export interface Episode {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
}

export interface EpisodeDetails extends Episode {
    external_ids?: {
        imdb_id?: string | null;
        freebase_mid?: string | null;
        freebase_id?: string | null;
        tvdb_id?: number | null;
        tvrage_id?: number | null;
        wikidata_id?: string | null;
    };
}

export interface SeasonDetails {
    _id: string;
    air_date: string;
    episodes: Episode[];
    name: string;
    overview: string;
    id: number;
    poster_path: string | null;
    season_number: number;
    vote_average: number;
}

export const getTVSeasonDetails = async (tvId: string, seasonNumber: number, language: string = 'en-US'): Promise<SeasonDetails | null> => {
    const url = buildApiUrl(`tv/${tvId}/season/${seasonNumber}`, { language });

    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return response.json();
    } catch {
        return null;
    }
};

export const getTVEpisodeDetails = async (tvId: string, seasonNumber: number, episodeNumber: number, language: string = 'en-US'): Promise<EpisodeDetails | null> => {
    const url = buildApiUrl(`tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, { 
        append_to_response: 'external_ids',
        language 
    });

    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return response.json();
    } catch {
        return null;
    }
};

// Person Types
export interface PersonDetails {
    id: number;
    name: string;
    biography: string;
    birthday: string | null;
    deathday: string | null;
    gender: number;
    known_for_department: string;
    place_of_birth: string | null;
    popularity: number;
    profile_path: string | null;
    also_known_as: string[];
    homepage: string | null;
    imdb_id: string | null;
    combined_credits?: PersonCombinedCredits;
    external_ids?: {
        imdb_id: string | null;
        facebook_id: string | null;
        instagram_id: string | null;
        twitter_id: string | null;
        tiktok_id: string | null;
        youtube_id: string | null;
    };
    images?: {
        profiles: PersonImage[];
    };
}

export interface PersonCombinedCredits {
    cast: PersonCreditItem[];
    crew: PersonCreditItem[];
}

export interface PersonCreditItem {
    id: number;
    title?: string;
    name?: string;
    media_type: 'movie' | 'tv';
    character?: string;
    job?: string;
    department?: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    vote_count?: number;
    popularity?: number;
    episode_count?: number;
}

export interface PersonImage {
    aspect_ratio: number;
    file_path: string;
    height: number;
    width: number;
    vote_average: number;
}

export const getPersonDetails = async (id: string, language: string = 'en-US'): Promise<PersonDetails | null> => {
    const url = buildApiUrl(`person/${id}`, { 
        append_to_response: 'combined_credits,external_ids,images',
        language 
    });

    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return response.json();
    } catch {
        return null;
    }
};

// Search Types
export interface SearchResult {
    id: number;
    media_type: 'movie' | 'tv' | 'person';
    title?: string;
    name?: string;
    original_title?: string;
    original_name?: string;
    poster_path: string | null;
    profile_path?: string | null;
    backdrop_path: string | null;
    overview: string;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    popularity: number;
    known_for_department?: string;
}

export interface SearchResponse {
    page: number;
    results: SearchResult[];
    total_pages: number;
    total_results: number;
}

export const searchMulti = async (query: string, language: string = 'en-US', page: number = 1): Promise<SearchResponse> => {
    const url = buildApiUrl('search/multi', { 
        query,
        language,
        page: page.toString(),
        include_adult: 'false'
    });

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        // Filter to only movies, TV shows, and people
        return {
            ...data,
            results: data.results.filter((r: SearchResult) => r.media_type === 'movie' || r.media_type === 'tv' || r.media_type === 'person')
        };
    } catch {
        return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
};

// IMDb Rating Types
export interface IMDbRating {
    aggregateRating: number;
    voteCount: number;
}

export const getIMDbRating = async (imdbId: string): Promise<IMDbRating | null> => {
    try {
        const response = await fetch(`https://imdb-ratings-ten.vercel.app/api/rating?imdbId=${imdbId}`);
        if (!response.ok) return null;
        const data = await response.json();
        
        if (data.rating && data.numVotes) {
            return {
                aggregateRating: data.rating,
                voteCount: data.numVotes
            };
        }
        return null;
    } catch {
        return null;
    }
};

// Find movie, TV show, or person by IMDb ID
export interface FindByImdbResult {
    movie_results: Array<{ id: number }>;
    tv_results: Array<{ id: number }>;
    person_results: Array<{ id: number }>;
}

export const findByImdbId = async (imdbId: string): Promise<{ type: 'movie' | 'tv' | 'person' | null; id: number | null }> => {
    try {
        const url = buildApiUrl(`find/${imdbId}`, { external_source: 'imdb_id' });
        const response = await fetch(url);
        
        if (!response.ok) return { type: null, id: null };
        
        const data: FindByImdbResult = await response.json();
        
        if (data.movie_results && data.movie_results.length > 0) {
            return { type: 'movie', id: data.movie_results[0].id };
        }
        
        if (data.tv_results && data.tv_results.length > 0) {
            return { type: 'tv', id: data.tv_results[0].id };
        }
        
        if (data.person_results && data.person_results.length > 0) {
            return { type: 'person', id: data.person_results[0].id };
        }
        
        return { type: null, id: null };
    } catch {
        return { type: null, id: null };
    }
};
