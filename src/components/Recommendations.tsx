import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

import tspdtData from '../assets/tspdt-1000-greatest-films-2026.json';
import tspdt21stData from '../assets/tspdt-21st-centurys-top-1000.json';
import sightAndSoundData from '../assets/sight-and-sound-2022-top-250.json';
import afiData from '../assets/afi-100-years-100-movies-10th-anniversary.json';
import cahiersData from '../assets/cahiers-du-cinema-top-10.json';
import oscarData from '../assets/oscar_winners.json';
import cannesData from '../assets/cannes_awards.json';
import veniceData from '../assets/venice_awards.json';
import berlinaleData from '../assets/berlinale_awards.json';

interface MovieItem {
        tmdb_id: number;
        title: string;
        year: string | number;
        sources: string[];
    awards?: { [key: string]: string[] };
    ranks?: { [key: string]: any };
    genres?: string[];
}

const LIST_OPTIONS = [
    { id: 'sightandsound', name: 'Sight & Sound' },
    { id: 'tspdt', name: 'TSPDT 1000' },
    { id: 'afi', name: 'AFI 100' },
    { id: 'cahiers', name: 'Cahiers du Cinéma' },
    { id: 'tspdt21st', name: 'TSPDT 21st Century' }
];

const AWARD_CATEGORIES = {
    'oscar': {
        name: 'Academy Awards',
        options: [
            'Best Picture',
            'Directing',
            'Actor',
            'Actress',
            'Supporting Actor',
            'Supporting Actress',
            'Writing',
            'Cinematography',
            'Film Editing',
            'Production Design',
            'Costume Design',
            'Makeup',
            'Music',
            'Sound',
            'Visual Effects',
            'Animated Feature',
            'International Feature'
        ]
    },
    'cannes': {
        name: 'Cannes Film Festival',
        options: [
            'Palme d\'Or',
            'Grand Prix',
            'Jury Prize',
            'Director',
            'Actor',
            'Actress',
            'Screenplay',
            'Caméra d\'Or'
        ]
    },
    'venice': {
        name: 'Venice Film Festival',
        options: [
            'Golden Lion',
            'Grand Jury Prize'
        ]
    },
    'berlinale': {
        name: 'Berlin International Film Festival',
        options: [
            'Golden Bear',
            'Silver Bear Grand Jury Prize',
            'Silver Bear Jury Prize',
            'Alfred Bauer Prize'
        ]
    }
};

export default function Recommendations() {
    const [selectedLists, setSelectedLists] = useState<string[]>([]);
    const [selectedAwards, setSelectedAwards] = useState<{ [key: string]: string[] }>({});
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState<string>('rank'); // 'rank', 'year_desc', 'year_asc', 'title_asc'
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);
    const [filteredMovies, setFilteredMovies] = useState<MovieItem[]>([]);
    const [displayCount, setDisplayCount] = useState(50);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setIsSortDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const LOAD_MORE_COUNT = 50;

    // Process and merge all data
    const allMovies = useMemo(() => {
        const movieMap = new Map<number, MovieItem>();
        
        const GENRE_MAPPING: {[key: string]: string} = {
            'Science Fiction': 'Sci-Fi',
            'Sci-Fi': 'Sci-Fi',
            'Musical': 'Music',
            'Music': 'Music',
            'Children': 'Family',
            'Kids': 'Family'
        };

        const normalizeGenre = (genre: string): string => {
            const trimmed = genre.trim();
            return GENRE_MAPPING[trimmed] || trimmed;
        };

        const processList = (data: any[], sourceId: string) => {
            let lastYear = '';
            let lastRank = '';

            data.forEach(item => {
                if (!item.tmdb_id) return;
                
                let existing = movieMap.get(item.tmdb_id);
                if (!existing) {
                    existing = {
                        tmdb_id: item.tmdb_id,
                        title: item.title || item.Film,
                        year: item.year || item.Year,
                        sources: [],
                        awards: {},
                        ranks: {},
                        genres: []
                    };
                    movieMap.set(item.tmdb_id, existing);
                }

                if (item.genres && Array.isArray(item.genres)) {
                    if (!existing.genres) existing.genres = [];
                    item.genres.forEach((g: string) => {
                        if (g === 'Action & Adventure' || g === 'Sci-Fi & Fantasy' || g === 'TV Movie') return;
                        
                        const normalized = normalizeGenre(g);
                        if (!existing.genres!.includes(normalized)) {
                            existing.genres!.push(normalized);
                        }
                    });
                }

                if (!existing.sources.includes(sourceId)) {
                    existing.sources.push(sourceId);
                }

                if (!existing.ranks) existing.ranks = {};
                
                if (sourceId === 'cahiers') {
                     let rank = item.rank;
                     if (item.year !== lastYear) {
                         lastYear = item.year;
                         lastRank = item.rank;
                     } else {
                         if (item.rank === 'Tied') {
                             rank = lastRank;
                         } else {
                             lastRank = item.rank;
                         }
                     }
                     existing.ranks[sourceId] = { year: item.year, rank: rank };
                } else if (item.rank) {
                     existing.ranks[sourceId] = item.rank;
                } else if (item.Year) {
                     existing.ranks[sourceId] = item.Year;
                } else {
                     existing.ranks[sourceId] = 0;
                }

                if (item.Award) {
                    if (!existing.awards) existing.awards = {};
                    if (!existing.awards[sourceId]) existing.awards[sourceId] = [];
                    if (!existing.awards[sourceId].includes(item.Award)) {
                        existing.awards[sourceId].push(item.Award);
                    }
                }
            });
        };

        processList(tspdtData, 'tspdt');
        processList(tspdt21stData, 'tspdt21st');
        processList(sightAndSoundData, 'sightandsound');
        processList(afiData, 'afi');
        processList(cahiersData, 'cahiers');
        processList(oscarData, 'oscar');
        processList(cannesData, 'cannes');
        processList(veniceData, 'venice');
        processList(berlinaleData, 'berlinale');

        return Array.from(movieMap.values());
    }, []);

    // Extract all genres
    const allGenres = useMemo(() => {
        const genres = new Set<string>();
        allMovies.forEach(movie => {
            if (movie.genres) {
                movie.genres.forEach(g => genres.add(g));
            }
        });
        return Array.from(genres).sort();
    }, [allMovies]);

    const checkAwardMatch = (awardName: string, option: string) => {
        const awardLower = awardName.toLowerCase();
        const optionLower = option.toLowerCase();

        if (optionLower === 'best picture') {
            return awardLower.includes('best picture') || 
                   awardLower.includes('outstanding picture') || 
                   awardLower.includes('unique and artistic picture') ||
                   awardLower.includes('best motion picture');
        }

        if (optionLower === 'supporting actor') {
            return awardLower.includes('supporting') && awardLower.includes('actor');
        }
        if (optionLower === 'supporting actress') {
            return awardLower.includes('supporting') && awardLower.includes('actress');
        }

        if (optionLower === 'actor') {
            return awardLower.includes('actor') && !awardLower.includes('supporting');
        }
        if (optionLower === 'actress') {
            return awardLower.includes('actress') && !awardLower.includes('supporting');
        }

        if (optionLower === 'production design') {
            return awardLower.includes('production design') || awardLower.includes('art direction');
        }
        
        if (optionLower === 'visual effects') {
            return awardLower.includes('visual effects') || awardLower.includes('special effects');
        }

        if (optionLower === 'international feature') {
            return awardLower.includes('international feature') || awardLower.includes('foreign language');
        }

        return awardLower.includes(optionLower);
    };

    const isAwardMatch = (movie: MovieItem, awardType: string, selectedOptions: string[]) => {
        if (!movie.awards || !movie.awards[awardType]) return false;
        
        return movie.awards[awardType].some(award => 
            selectedOptions.some(option => checkAwardMatch(award, option))
        );
    };

    useEffect(() => {
        // Filter logic
        const hasSelectedLists = selectedLists.length > 0;
        const hasSelectedAwards = Object.keys(selectedAwards).some(k => selectedAwards[k].length > 0);
        const hasSelectedGenres = selectedGenres.length > 0;

        if (!hasSelectedLists && !hasSelectedAwards) {
            setFilteredMovies([]);
            return;
        }

        const results = allMovies.filter(movie => {
            const matchesAllLists = !hasSelectedLists || selectedLists.every(id => movie.sources.includes(id));
            
            let matchesAllAwards = !hasSelectedAwards;
            if (hasSelectedAwards) {
                matchesAllAwards = Object.entries(selectedAwards).every(([type, options]) => {
                    if (options.length === 0) return true;
                    return options.every(option => isAwardMatch(movie, type, [option]));
                });
            }

            const matchesAllGenres = !hasSelectedGenres || selectedGenres.every(genre => movie.genres?.includes(genre));

            return matchesAllLists && matchesAllAwards && matchesAllGenres;
        });

        results.sort((a, b) => {
            if (sortOption === 'year_desc') {
                return String(b.year).localeCompare(String(a.year));
            }
            if (sortOption === 'year_asc') {
                return String(a.year).localeCompare(String(b.year));
            }
            if (sortOption === 'title_asc') {
                const titleA = formatTitle(a.title).toLowerCase();
                const titleB = formatTitle(b.title).toLowerCase();
                return titleA.localeCompare(titleB);
            }

            if (selectedLists.length > 0) {
                const primaryListId = selectedLists[0];
            
                if (primaryListId === 'cahiers') {
                    const rankA = a.ranks?.[primaryListId];
                    const rankB = b.ranks?.[primaryListId];
                    if (!rankA && !rankB) return 0;
                    if (!rankA) return 1;
                    if (!rankB) return -1;

                    const yearDiff = parseInt(String(rankB.year)) - parseInt(String(rankA.year));
                    if (yearDiff !== 0) return yearDiff;
                    
                    return parseInt(String(rankA.rank)) - parseInt(String(rankB.rank));
                }
                
                const rankA = a.ranks?.[primaryListId];
                const rankB = b.ranks?.[primaryListId];
                
                if (rankA && rankB) {
                    return Number(rankA) - Number(rankB);
                }
                
                return String(b.year).localeCompare(String(a.year));
            }
            
            return String(b.year).localeCompare(String(a.year));
        });

        setFilteredMovies(results);
        setDisplayCount(50);
    }, [selectedLists, selectedAwards, selectedGenres, sortOption, allMovies]);

    // Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop
                >= document.documentElement.offsetHeight - 200
            ) {
                setDisplayCount(prev => Math.min(prev + LOAD_MORE_COUNT, filteredMovies.length));
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [filteredMovies.length]);

    const formatTitle = (title: string) => {
        const pattern = /^(.*), (The|A|An)$/;
        const match = title.match(pattern);
        if (match) {
            return `${match[2]} ${match[1]}`;
        }
        return title;
    };

    const toggleListSelection = (id: string) => {
        setSelectedLists(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleAwardSelection = (type: string, option: string) => {
        setSelectedAwards(prev => {
            const currentOptions = prev[type] || [];
            const newOptions = currentOptions.includes(option)
                ? currentOptions.filter(x => x !== option)
                : [...currentOptions, option];
            
            const newState = { ...prev, [type]: newOptions };
            if (newOptions.length === 0) {
                delete newState[type];
            }
            return newState;
        });
    };

    const toggleGenreSelection = (genre: string) => {
        setSelectedGenres(prev => 
            prev.includes(genre) ? prev.filter(x => x !== genre) : [...prev, genre]
        );
    };

    const getSourceName = (id: string) => {
        const list = LIST_OPTIONS.find(l => l.id === id);
        if (list) return list.name;
        const award = Object.values(AWARD_CATEGORIES).find(a => a.name === id);
        if (award) return award.name;
        return id;
    };

    const getRankDisplay = (movie: MovieItem, sourceId: string) => {
        if (!movie.ranks || movie.ranks[sourceId] === undefined) return '';
        
        const rankData = movie.ranks[sourceId];
        
        // Handle Cahiers object
        if (sourceId === 'cahiers' && typeof rankData === 'object' && rankData !== null) {
            let display = '';
            if (rankData.year) {
                display += ` ${rankData.year}`;
            }
            if (rankData.rank) {
                display += ` #${rankData.rank}`;
            }
            return display;
        }
        
        if (rankData && rankData != 0) {
             return ` #${rankData}`;
        }
        
        return '';
    };

    const getSortLabel = (option: string) => {
        switch(option) {
            case 'rank': return 'Default (Rank)';
            case 'year_desc': return 'Year (Newest)';
            case 'year_asc': return 'Year (Oldest)';
            case 'title_asc': return 'Title (A-Z)';
            default: return 'Default (Rank)';
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#121212',
            color: '#fff',
            padding: '20px',
            boxSizing: 'border-box',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                paddingTop: '20px'
            }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
                        Movie Recommendations
                    </h1>
                </div>

                {/* Filters Section */}
                <div style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '32px',
                    border: '1px solid #333'
                }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold', margin: 0 }}>
                            Lists
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                            {LIST_OPTIONS.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => toggleListSelection(option.id)}
                                    style={{
                                        backgroundColor: selectedLists.includes(option.id) ? '#fff' : '#2a2a2a',
                                        color: selectedLists.includes(option.id) ? '#000' : '#ccc',
                                        border: '1px solid #333',
                                        borderRadius: '20px',
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontWeight: 500,
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                >
                                    {option.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold' }}>
                            Awards
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {Object.entries(AWARD_CATEGORIES).map(([key, category]) => (
                                <div key={key}>
                                    <div style={{ fontSize: '16px', marginBottom: '8px', color: '#999' }}>{category.name}</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {category.options.map(option => (
                                            <button
                                                key={option}
                                                onClick={() => toggleAwardSelection(key, option)}
                                                style={{
                                                    backgroundColor: (selectedAwards[key] || []).includes(option) ? '#fff' : '#2a2a2a',
                                                    color: (selectedAwards[key] || []).includes(option) ? '#000' : '#ccc',
                                                    border: '1px solid #333',
                                                    borderRadius: '20px',
                                                    padding: '6px 14px',
                                                    fontSize: '13px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    fontWeight: 500,
                                                    fontFamily: 'Inter, sans-serif'
                                                }}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold' }}>
                            Genres
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {allGenres.map(genre => (
                                <button
                                    key={genre}
                                    onClick={() => toggleGenreSelection(genre)}
                                    style={{
                                        backgroundColor: selectedGenres.includes(genre) ? '#fff' : '#2a2a2a',
                                        color: selectedGenres.includes(genre) ? '#000' : '#ccc',
                                        border: '1px solid #333',
                                        borderRadius: '20px',
                                        padding: '6px 14px',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontWeight: 500,
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Header */}
                <div style={{ 
                    marginBottom: '16px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                }}>
                    <div style={{ color: '#999', fontSize: '14px' }}>
                        Found {filteredMovies.length} movies
                    </div>

                    {/* Sort Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px', color: '#999', fontFamily: 'Inter, sans-serif' }}>Sort by:</span>
                        <div ref={sortDropdownRef} style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                style={{
                                    appearance: 'none',
                                    backgroundColor: '#2a2a2a',
                                    color: '#fff',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    padding: '8px 36px 8px 16px',
                                    fontSize: '14px',
                                    fontFamily: 'Inter, sans-serif',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    minWidth: '160px',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {getSortLabel(sortOption)}
                            </button>
                            
                            <div style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                color: '#999'
                            }}>
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>

                            {isSortDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    marginTop: '4px',
                                    backgroundColor: '#2a2a2a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    zIndex: 10,
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                }}>
                                    {[
                                        { value: 'rank', label: 'Default (Rank)' },
                                        { value: 'year_desc', label: 'Year (Newest)' },
                                        { value: 'year_asc', label: 'Year (Oldest)' },
                                        { value: 'title_asc', label: 'Title (A-Z)' }
                                    ].map(opt => (
                                        <div
                                            key={opt.value}
                                            onClick={() => {
                                                setSortOption(opt.value);
                                                setIsSortDropdownOpen(false);
                                            }}
                                            style={{
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontFamily: 'Inter, sans-serif',
                                                backgroundColor: sortOption === opt.value ? '#333' : 'transparent',
                                                color: sortOption === opt.value ? '#fff' : '#ccc',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#333'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = sortOption === opt.value ? '#333' : 'transparent'}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredMovies.slice(0, displayCount).map(movie => {
                        const isTV = movie.title.includes('[TV]');
                        const linkPath = isTV ? `/tv/${movie.tmdb_id}` : `/movie/${movie.tmdb_id}`;
                        return (
                        <Link
                            key={movie.tmdb_id}
                            to={linkPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '24px',
                                backgroundColor: '#1a1a1a',
                                padding: '16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                border: '1px solid #333',
                                textDecoration: 'none',
                                color: 'inherit'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252525'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                                    {formatTitle(movie.title)}
                                </div>
                                <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span>{movie.year}</span>
                                    {movie.genres && movie.genres.length > 0 && (
                                        <>
                                            <span>•</span>
                                            <span>
                                                {movie.genres.join(', ')}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {movie.sources
                                        .filter(s => selectedLists.includes(s))
                                        .map(source => (
                                            <span 
                                                key={source}
                                                style={{
                                                    fontSize: '12px',
                                                    backgroundColor: '#333',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    color: '#ccc'
                                                }}
                                            >
                                                {getSourceName(source)}
                                                <span style={{ color: '#fff', marginLeft: '4px' }}>
                                                    {getRankDisplay(movie, source)}
                                                </span>
                                            </span>
                                        ))
                                    }
                                    {/* Display matching awards */}
                                    {Object.entries(selectedAwards).map(([type, options]) => {
                                        if (!movie.awards || !movie.awards[type]) return null;
                                        // Find which of the movie's awards match the selected options
                                        const matchingAwards = movie.awards[type].filter(ma => {
                                             return options.some(opt => checkAwardMatch(ma, opt));
                                        });
                                        
                                        return matchingAwards.map(ma => (
                                            <span 
                                                key={`${type}-${ma}`}
                                                style={{
                                                    fontSize: '12px',
                                                    backgroundColor: '#4a3b00', // Different color for awards
                                                    color: '#ffd700',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                {ma}
                                            </span>
                                        ));
                                    })}
                                </div>
                            </div>
                        </Link>
                        );
                    })}
                    {filteredMovies.length === 0 && (selectedLists.length > 0 || Object.keys(selectedAwards).length > 0) && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            No movies found matching all selected criteria.
                        </div>
                    )}
                    {filteredMovies.length === 0 && selectedLists.length === 0 && Object.keys(selectedAwards).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            Select lists or awards to start exploring.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}