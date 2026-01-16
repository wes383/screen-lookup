import tspdtData from '../assets/tspdt-1000-greatest-films-2026.json';

interface TSPDTFilm {
    rank: number;
    title: string;
    year: number;
}

const films: TSPDTFilm[] = tspdtData;

function normalizeTitle(title: string): string {
    const trailingArticlePattern = /^(.+?),\s+(The|A|An|Le|La|Les|L'|L|Un|Une|Des|El|Los|Las|Il|Lo|I|Gli|Der|Die|Das|Den)$/i;
    let workingTitle = title;
    const articleMatch = workingTitle.match(trailingArticlePattern);
    if (articleMatch) {
        workingTitle = `${articleMatch[2]}${articleMatch[1]}`;
    }
    
    let normalized = workingTitle
        .toLowerCase()
        .replace(/[^\w]/g, '')
        .trim();
    
    return normalized;
}

export function getTSPDTRanking(title: string, year: number, originalTitle?: string): number | null {
    const normalizedSearchTitle = normalizeTitle(title);

    let match = films.find(film => {
        const normalizedFilmTitle = normalizeTitle(film.title);
        const yearDiff = Math.abs(film.year - year);
        return normalizedFilmTitle === normalizedSearchTitle && yearDiff <= 1;
    });

    if (!match && originalTitle && originalTitle !== title) {
        const normalizedOriginalTitle = normalizeTitle(originalTitle);
        match = films.find(film => {
            const normalizedFilmTitle = normalizeTitle(film.title);
            const yearDiff = Math.abs(film.year - year);
            return normalizedFilmTitle === normalizedOriginalTitle && yearDiff <= 1;
        });
    }

    return match ? match.rank : null;
}
