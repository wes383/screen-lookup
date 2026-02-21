import cahiersData from '../assets/cahiers-du-cinema-top-10.json';

interface CahiersEntry {
    year: string;
    rank: string;
    title: string;
    tmdb_id: number;
    genres: string[];
}

const films: CahiersEntry[] = cahiersData as unknown as CahiersEntry[];

export const getCahiersRanking = (tmdbId: number): { rank: number; year: string } | null => {
    const matchingIndices: number[] = [];
    films.forEach((film, index) => {
        if (film.tmdb_id === tmdbId) {
            matchingIndices.push(index);
        }
    });

    if (matchingIndices.length === 0) return null;

    let entryIndex = matchingIndices.find(idx => films[idx].year.includes('s'));
    
    if (entryIndex === undefined) {
        entryIndex = matchingIndices[0];
    }

    const entry = films[entryIndex];
    let rank: number;

    if (entry.rank === 'Tied') {
        const currentYear = entry.year;
        rank = 0;
        
        for (let i = entryIndex - 1; i >= 0; i--) {
            if (films[i].year !== currentYear) break;
            
            if (films[i].rank !== 'Tied') {
                rank = parseInt(films[i].rank);
                break;
            }
        }
    } else {
        rank = parseInt(entry.rank);
    }

    return { rank, year: entry.year };
};
