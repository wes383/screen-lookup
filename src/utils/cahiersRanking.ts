import cahiersData from '../assets/cahiers-du-cinema-top-10.json';

interface CahiersEntry {
    Year: string;
    Rank: string;
    'English Title': string;
    'Original Title': string;
    'Director(s)': string;
}

const normalizeTitle = (title: string): string => {
    return title.toLowerCase().trim().replace(/[^\w\s]/g, '');
};

const normalizeDirector = (director: string): string => {
    return director.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '').trim();
};

export const getCahiersRanking = (title: string, originalTitle: string | undefined, directors: string[]): { rank: number; year: string } | null => {
    if (!title || !directors || directors.length === 0) return null;

    const normalizedTitle = normalizeTitle(title);
    const normalizedOriginalTitle = originalTitle ? normalizeTitle(originalTitle) : '';
    const normalizedDirectors = directors.map(normalizeDirector);

    const dataArray = cahiersData as CahiersEntry[];
    const matchingEntries: number[] = [];

    dataArray.forEach((item, index) => {
        const listEnglishTitle = normalizeTitle(item['English Title']);
        const listOriginalTitle = normalizeTitle(item['Original Title']);
        
        const enTitleMatch = normalizedTitle === listEnglishTitle || normalizedTitle === listOriginalTitle;
        const originalTitleMatch = normalizedOriginalTitle && (normalizedOriginalTitle === listEnglishTitle || normalizedOriginalTitle === listOriginalTitle);
        
        const titleMatches = enTitleMatch || originalTitleMatch;

        if (!titleMatches) return;

        const itemDirectors = item['Director(s)'].split('&').map(normalizeDirector);
        const directorMatches = itemDirectors.some(itemDir => 
            normalizedDirectors.some(dir => itemDir.includes(dir) || dir.includes(itemDir))
        );

        if (directorMatches) {
            matchingEntries.push(index);
        }
    });

    if (matchingEntries.length === 0) return null;

    let entryIndex = matchingEntries.find(idx => dataArray[idx].Year.includes('s'));
    
    if (entryIndex === undefined) {
        entryIndex = matchingEntries[0];
    }

    const entry = dataArray[entryIndex];
    let rank: number;

    if (entry.Rank === 'Tied') {
        for (let i = entryIndex - 1; i >= 0; i--) {
            if (dataArray[i].Rank !== 'Tied') {
                rank = parseInt(dataArray[i].Rank);
                break;
            }
        }
        if (rank! === undefined) rank = 0;
    } else {
        rank = parseInt(entry.Rank);
    }

    return { rank, year: entry.Year };
};

