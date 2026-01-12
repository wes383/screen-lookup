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
}

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN; // Alternative

const BASE_URL = 'https://api.themoviedb.org/3';

export const getMovieDetails = async (id: string): Promise<MovieDetails> => {
    // options object removed as it was unused

    // If using API Key instead of Access Token (common for older integrations)
    // url would be: \`\${BASE_URL}/movie/\${id}?api_key=\${API_KEY}&language=en-US\`

    let url = `${BASE_URL}/movie/${id}?language=en-US`;

    // Prefer Access Token if available, otherwise fallback to API Key query param if implemented
    // For this implementation, we'll try to support both roughly, but Authorization header is cleaner.

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `&api_key=${API_KEY}`;
    } else {
        console.warn("No TMDB API Key or Access Token found.");
    }

    const response = await fetch(url, { headers });

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

export const getMovieLogos = async (id: string): Promise<MovieLogo[]> => {
    let url = `${BASE_URL}/movie/${id}/images?include_image_language=en,null`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `&api_key=${API_KEY}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    return data.logos || [];
}

export const getMovieCertification = async (id: string): Promise<string | null> => {
    let url = `${BASE_URL}/movie/${id}/release_dates`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) return null;

        const data = await response.json();
        // Try to find US certification first, then fallback to any available
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
    let url = `${BASE_URL}/movie/${id}/release_dates`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
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
    let url = `${BASE_URL}/movie/${id}/watch/providers`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
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
    let url = `${BASE_URL}/movie/${id}/keywords`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
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

export const getMovieCredits = async (id: string): Promise<MovieCredits> => {
    let url = `${BASE_URL}/movie/${id}/credits`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
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
    let url = `${BASE_URL}/movie/${id}/alternative_titles`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
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
    let url = `${BASE_URL}/movie/${id}/videos`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
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

export const getTVDetails = async (id: string): Promise<TVDetails> => {
    let url = `${BASE_URL}/tv/${id}?append_to_response=external_ids`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `&api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error('Failed to fetch TV details');
        return response.json();
    } catch (error) {
        throw error;
    }
};

export const getTVCredits = async (id: string): Promise<MovieCredits> => {
    let url = `${BASE_URL}/tv/${id}/aggregate_credits`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
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
    let url = `${BASE_URL}/tv/${id}/keywords`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || []; // distinct from movies which returns 'keywords'
    } catch {
        return [];
    }
};

export interface ContentRating {
    iso_3166_1: string;
    rating: string;
}

export const getTVContentRatings = async (id: string): Promise<ContentRating[]> => {
    let url = `${BASE_URL}/tv/${id}/content_ratings`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || [];
    } catch {
        return [];
    }
};

export const getTVVideos = async (id: string): Promise<MovieVideo[]> => {
    let url = `${BASE_URL}/tv/${id}/videos`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || [];
    } catch {
        return [];
    }
};

export const getTVAlternativeTitles = async (id: string): Promise<AlternativeTitle[]> => {
    let url = `${BASE_URL}/tv/${id}/alternative_titles`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || []; // distinct from movies which returns 'titles'
    } catch {
        return [];
    }
};

export const getTVWatchProviders = async (id: string, country: string = 'US'): Promise<WatchProviderData | null> => {
    let url = `${BASE_URL}/tv/${id}/watch/providers`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) return null;
        const data = await response.json();
        return data.results?.[country] || null;
    } catch {
        return null;
    }
};

export const getTVLogos = async (id: string): Promise<MovieLogo[]> => {
    let url = `${BASE_URL}/tv/${id}/images?include_image_language=en,null`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `&api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
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

export const getTVSeasonDetails = async (tvId: string, seasonNumber: number): Promise<SeasonDetails | null> => {
    let url = `${BASE_URL}/tv/${tvId}/season/${seasonNumber}`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `?api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
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
    gender: number; // 0: Not set, 1: Female, 2: Male, 3: Non-binary
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
    title?: string; // Movie
    name?: string; // TV
    media_type: 'movie' | 'tv';
    character?: string;
    job?: string;
    department?: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
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

export const getPersonDetails = async (id: string): Promise<PersonDetails | null> => {
    let url = `${BASE_URL}/person/${id}?append_to_response=combined_credits,external_ids,images`;

    const headers: HeadersInit = {
        'accept': 'application/json',
    };

    if (ACCESS_TOKEN) {
        headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    } else if (API_KEY) {
        url += `&api_key=${API_KEY}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) return null;
        return response.json();
    } catch {
        return null;
    }
};

