import tspdt21stData from '../assets/tspdt-21st-centurys-top-1000.json';

interface TSPDT21stFilm {
    rank: number;
    title: string;
    year: number;
}

const films = tspdt21stData as TSPDT21stFilm[];

function normalizeTitle(title: string): string {
    // First, handle titles with trailing articles before removing punctuation
    // e.g., "Avventura, L'" -> "L'Avventura"
    const trailingArticlePattern = /^(.+?),\s+(The|A|An|Le|La|Les|L'|L|Un|Une|Des|El|Los|Las|Il|Lo|I|Gli|Der|Die|Das|Den)$/i;
    let workingTitle = title;
    const articleMatch = workingTitle.match(trailingArticlePattern);
    if (articleMatch) {
        workingTitle = `${articleMatch[2]}${articleMatch[1]}`;
    }
    
    // Now normalize: lowercase and remove all punctuation and spaces
    let normalized = workingTitle
        .toLowerCase()
        .replace(/[^\w]/g, '')
        .trim();
    
    return normalized;
}

export function getTSPDT21stRanking(title: string, year: number): number | null {
    const normalizedSearchTitle = normalizeTitle(title);

    const match = films.find(film => {
        const normalizedFilmTitle = normalizeTitle(film.title);
        return normalizedFilmTitle === normalizedSearchTitle && film.year === year;
    });

    return match ? match.rank : null;
}
