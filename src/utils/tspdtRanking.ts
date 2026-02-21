import tspdtData from '../assets/tspdt-1000-greatest-films-2026.json';

interface TSPDTFilm {
    rank: number;
    title: string;
    year: string;
    tmdb_id: number;
    genres: string[];
}

const films: TSPDTFilm[] = tspdtData as unknown as TSPDTFilm[];

export function getTSPDTRanking(tmdbId: number): number | null {
    const match = films.find(film => film.tmdb_id === tmdbId);
    return match ? match.rank : null;
}
