import tspdt21stData from '../assets/tspdt-21st-centurys-top-1000.json';

interface TSPDT21stFilm {
    rank: number;
    title: string;
    year: string;
    tmdb_id: number;
    genres: string[];
}

const films: TSPDT21stFilm[] = tspdt21stData as unknown as TSPDT21stFilm[];

export function getTSPDT21stRanking(tmdbId: number): number | null {
    const match = films.find(film => film.tmdb_id === tmdbId);
    return match ? match.rank : null;
}
