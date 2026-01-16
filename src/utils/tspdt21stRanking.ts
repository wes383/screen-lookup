import tspdt21stData from '../assets/tspdt-21st-centurys-top-1000.json';

interface TSPDT21stFilm {
    rank: number;
    title: string;
    year: number;
}

const films = tspdt21stData as TSPDT21stFilm[];

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

export function getTSPDT21stRanking(title: string, year: number, originalTitle?: string): number | null {
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
