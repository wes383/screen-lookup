import sightAndSoundData from '../assets/sight-and-sound-2022-top-250.json';

interface SightAndSoundFilm {
    rank: number;
    title: string;
    year: string;
    imdb_id: string;
}

const films: SightAndSoundFilm[] = sightAndSoundData;

export function getSightAndSoundRanking(imdbId: string): number | null {
    const match = films.find(film => film.imdb_id === imdbId);
    return match ? match.rank : null;
}
