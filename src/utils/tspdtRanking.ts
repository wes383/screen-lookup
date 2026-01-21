import tspdtData from '../assets/tspdt-1000-greatest-films-2026.json';

interface TSPDTEntry {
    Pos: string;
    "2025": string;
    Title: string;
    Director: string;
    Year: string;
}

interface TSPDTFilm {
    rank: number;
    title: string;
    director: string;
    year: number;
}

const films: TSPDTFilm[] = (tspdtData as TSPDTEntry[]).map(entry => ({
    rank: parseInt(entry.Pos),
    title: entry.Title,
    director: entry.Director,
    year: parseInt(entry.Year)
}));

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

function normalizeDirector(director: string): string {
    const commaPattern = /^(.+?),\s*(.+)$/;
    const match = director.match(commaPattern);
    if (match) {
        director = `${match[2]} ${match[1]}`;
    }
    
    return director.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '').trim();
}

export function getTSPDTRanking(title: string, year: number, originalTitle?: string, directors?: string[]): number | null {
    const normalizedSearchTitle = normalizeTitle(title);
    const normalizedDirectors = directors ? directors.map(normalizeDirector) : [];

    let match = films.find(film => {
        const normalizedFilmTitle = normalizeTitle(film.title);
        const yearDiff = Math.abs(film.year - year);
        const titleMatches = normalizedFilmTitle === normalizedSearchTitle && yearDiff <= 1;
        
        if (!titleMatches) return false;
        
        if (normalizedDirectors.length === 0) return false;
        
        const filmDirectors = film.director.split('&').map(d => normalizeDirector(d));
        const directorMatches = filmDirectors.some(filmDir => 
            normalizedDirectors.some(dir => {
                return filmDir.includes(dir) || dir.includes(filmDir);
            })
        );
        return directorMatches;
    });

    if (!match && originalTitle && originalTitle !== title) {
        const normalizedOriginalTitle = normalizeTitle(originalTitle);
        match = films.find(film => {
            const normalizedFilmTitle = normalizeTitle(film.title);
            const yearDiff = Math.abs(film.year - year);
            const titleMatches = normalizedFilmTitle === normalizedOriginalTitle && yearDiff <= 1;
            
            if (!titleMatches) return false;
            
            if (normalizedDirectors.length === 0) return false;
            
            const filmDirectors = film.director.split('&').map(d => normalizeDirector(d));
            const directorMatches = filmDirectors.some(filmDir => 
                normalizedDirectors.some(dir => {
                    return filmDir.includes(dir) || dir.includes(filmDir);
                })
            );
            return directorMatches;
        });
    }

    return match ? match.rank : null;
}
