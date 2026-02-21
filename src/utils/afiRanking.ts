import afiData from '../assets/afi-100-years-100-movies-10th-anniversary.json';

interface AFIFilm {
    rank: number;
    title: string;
    year: string;
    tmdb_id: number;
    genres: string[];
}

const films: AFIFilm[] = afiData as unknown as AFIFilm[];

export function getAFIRanking(tmdbId: number): number | null {
    const match = films.find(film => film.tmdb_id === tmdbId);
    return match ? match.rank : null;
}
