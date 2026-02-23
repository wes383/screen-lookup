import oscarWinners from '../assets/oscar_winners.json';
import cannesAwards from '../assets/cannes_awards.json';
import veniceAwards from '../assets/venice_awards.json';
import berlinaleAwards from '../assets/berlinale_awards.json';

export interface Award {
    year: string | number;
    award: string;
    festival: 'Oscar' | 'Cannes' | 'Venice' | 'Berlinale';
    name?: string;
    weight?: number;
}

const awardWeights: { [key: string]: number } = {
    // Oscar
    'Best Picture': 100,
    'Outstanding Picture': 100,
    'Outstanding Production': 100,
    'Outstanding Motion Picture': 100,
    'Best Motion Picture': 100,
    'Directing': 95,
    'Actor In A Leading Role': 90,
    'Actor': 90,
    'Actress In A Leading Role': 90,
    'Actress': 90,
    'Writing (Original Screenplay)': 85,
    'Writing (Adapted Screenplay)': 85,
    'Actor In A Supporting Role': 80,
    'Actress In A Supporting Role': 80,
    'Cinematography': 75,
    'Film Editing': 75,
    'International Feature Film': 70,
    'Foreign Language Film': 70,
    'Animated Feature Film': 70,
    'Documentary Feature Film': 65,
    'Documentary (Feature)': 65,
    'Music (Original Score)': 60,
    'Music (Original Song)': 60,
    'Production Design': 55,
    'Art Direction': 55,
    'Costume Design': 50,
    'Makeup And Hairstyling': 50,
    'Makeup': 50,
    'Visual Effects': 50,
    'Sound': 45,
    'Sound Mixing': 45,
    'Sound Editing': 45,
    
    // Cannes
    "Palme d'Or": 98,
    'Grand Prix': 92,
    'Best Director': 88,
    'Best Actor': 83,
    'Best Actress': 83,
    'Best Screenplay': 78,
    'Jury Prize': 73,
    "Caméra d'Or": 68,
    
    // Venice
    'Golden Lion - Best Film': 98,
    'Grand Jury Prize': 88,
    
    // Berlinale
    'Golden Bear - Best Film': 98,
    'Silver Bear Grand Jury Prize': 88,
    'Silver Bear Jury Prize': 78,
    'Alfred Bauer Prize': 68
};

function getAwardWeight(award: string): number {
    if (awardWeights[award]) {
        return awardWeights[award];
    }
    
    const normalizedAward = award.toLowerCase();
    
    if (normalizedAward.includes('best picture') || normalizedAward.includes('outstanding')) {
        return 100;
    }
    if (normalizedAward.includes('directing')) {
        return 95;
    }
    if (normalizedAward.includes('actor') && normalizedAward.includes('leading')) {
        return 90;
    }
    if (normalizedAward.includes('actress') && normalizedAward.includes('leading')) {
        return 90;
    }
    if (normalizedAward.includes('writing') && normalizedAward.includes('original')) {
        return 85;
    }
    if (normalizedAward.includes('writing') && normalizedAward.includes('adapted')) {
        return 85;
    }
    if (normalizedAward.includes('actor') && normalizedAward.includes('supporting')) {
        return 80;
    }
    if (normalizedAward.includes('actress') && normalizedAward.includes('supporting')) {
        return 80;
    }
    if (normalizedAward.includes('cinematography')) {
        return 75;
    }
    if (normalizedAward.includes('editing')) {
        return 75;
    }
    
    return 40;
}

export function getMovieAwards(tmdbId: number): Award[] {
    const awards: Award[] = [];

    const toTitleCase = (str: string): string => {
        return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    };

    // Oscar awards
    const oscarMatches = oscarWinners.filter((item: any) => item.tmdb_id === tmdbId);
    oscarMatches.forEach((item: any) => {
        const awardName = toTitleCase(item.Award);
        awards.push({
            year: item.Year,
            award: awardName,
            festival: 'Oscar',
            name: item.name,
            weight: getAwardWeight(item.Award)
        });
    });

    // Cannes awards
    const cannesMatches = cannesAwards.filter((item: any) => item.tmdb_id === tmdbId);
    cannesMatches.forEach((item: any) => {
        awards.push({
            year: item.Year,
            award: item.Award,
            festival: 'Cannes',
            weight: getAwardWeight(item.Award)
        });
    });

    // Venice awards
    const veniceMatches = veniceAwards.filter((item: any) => item.tmdb_id === tmdbId);
    veniceMatches.forEach((item: any) => {
        awards.push({
            year: item.Year,
            award: item.Award,
            festival: 'Venice',
            weight: getAwardWeight(item.Award)
        });
    });

    // Berlinale awards
    const berlinaleMatches = berlinaleAwards.filter((item: any) => item.tmdb_id === tmdbId);
    berlinaleMatches.forEach((item: any) => {
        awards.push({
            year: item.Year,
            award: item.Award,
            festival: 'Berlinale',
            weight: getAwardWeight(item.Award)
        });
    });

    awards.sort((a, b) => (b.weight || 0) - (a.weight || 0));

    return awards;
}
