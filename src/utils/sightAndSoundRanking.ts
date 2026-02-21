import sightAndSoundData from '../assets/sight-and-sound-2022-top-250.json';

interface SightAndSoundFilm {
    rank: number;
    title: string;
    year: string;
    tmdb_id: number;
    genres: string[];
}

const films: SightAndSoundFilm[] = sightAndSoundData as unknown as SightAndSoundFilm[];

export function getSightAndSoundRanking(tmdbId: number): number | null {
    const match = films.find(film => film.tmdb_id === tmdbId);
    return match ? match.rank : null;
}
