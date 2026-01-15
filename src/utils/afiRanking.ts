import afiData from '../assets/afi-100-years-100-movies-10th-anniversary.json';

interface AFIFilm {
    rank: number;
    title: string;
    year: string;
    imdb_id: string;
}

const films: AFIFilm[] = afiData;

export function getAFIRanking(imdbId: string): number | null {
    const match = films.find(film => film.imdb_id === imdbId);
    return match ? match.rank : null;
}
