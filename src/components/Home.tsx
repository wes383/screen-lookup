import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Film, Tv, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { searchMulti, getImageUrl, type SearchResult } from '../services/tmdb';
import { getTMDBLanguage } from '../utils/languageMapper';

export default function Home() {
    const { t, i18n } = useTranslation();
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [displayCount, setDisplayCount] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const searchTimeoutRef = useRef<number | undefined>(undefined);
    const resultsRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
                if (query.trim().length === 0) {
                    setIsFocused(false);
                }
            }
        };

        if (isFocused) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFocused, query]);

    // Handle infinite scroll
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return;

        const handleScroll = async () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            
            // When user scrolls to bottom (with 100px threshold)
            if (distanceFromBottom < 100 && !isLoadingMore) {
                // Check if we need to load more from current results
                if (displayCount < searchResults.length) {
                    setDisplayCount(prev => Math.min(prev + 10, searchResults.length));
                }
                // Check if we need to fetch next page
                else if (currentPage < totalPages && !isLoadingMore) {
                    setIsLoadingMore(true);
                    const currentLanguage = getTMDBLanguage(i18n.language);
                    const nextPage = currentPage + 1;
                    const results = await searchMulti(query.trim(), currentLanguage, nextPage);
                    const filtered = results.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv' || r.media_type === 'person');
                    setSearchResults(prev => [...prev, ...filtered]);
                    setCurrentPage(nextPage);
                    setDisplayCount(prev => prev + 10);
                    setIsLoadingMore(false);
                }
            }
        };

        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, [displayCount, searchResults.length, currentPage, totalPages, isLoadingMore, query, i18n.language]);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.trim().length < 1) {
            setSearchResults([]);
            setIsSearching(false);
            setDisplayCount(10);
            setCurrentPage(1);
            setTotalPages(1);
            return;
        }

        setIsSearching(true);
        setDisplayCount(10);
        setCurrentPage(1);
        searchTimeoutRef.current = setTimeout(async () => {
            const currentLanguage = getTMDBLanguage(i18n.language);
            const results = await searchMulti(query.trim(), currentLanguage, 1);
            // Include movies, TV shows, and people
            const filtered = results.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv' || r.media_type === 'person');
            setSearchResults(filtered);
            setTotalPages(results.total_pages);
            setIsSearching(false);
        }, 300) as unknown as number;

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [query, i18n.language]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim() && searchResults.length > 0) {
            navigate(`/${searchResults[0].media_type}/${searchResults[0].id}`);
        }
    };

    const handleResultClick = (result: SearchResult) => {
        navigate(`/${result.media_type}/${result.id}`);
        setIsFocused(false);
        setQuery('');
    };

    const getMediaTypeLabel = (mediaType: string) => {
        switch (mediaType) {
            case 'movie':
                return t('common.movie');
            case 'tv':
                return t('common.tvShow');
            case 'person':
                return t('common.person');
            default:
                return '';
        }
    };

    const getMediaTypeIcon = (mediaType: string) => {
        switch (mediaType) {
            case 'movie':
                return <Film size={16} />;
            case 'tv':
                return <Tv size={16} />;
            case 'person':
                return <User size={16} />;
            default:
                return null;
        }
    };

    const getResultImage = (result: SearchResult) => {
        if (result.media_type === 'person') {
            return result.profile_path ? getImageUrl(result.profile_path, 'w92') : null;
        }
        return result.poster_path ? getImageUrl(result.poster_path, 'w92') : null;
    };

    const getResultTitle = (result: SearchResult) => {
        if (result.media_type === 'person') {
            return result.name;
        }
        return result.title || result.name;
    };

    const translateKnownFor = (department: string | undefined): string => {
        if (!department) return '';
        const departmentMap: { [key: string]: string } = {
            'Acting': t('person.knownForActing'),
            'Directing': t('person.knownForDirecting'),
            'Writing': t('person.knownForWriting'),
            'Production': t('person.knownForProduction'),
            'Sound': t('person.knownForSound'),
            'Camera': t('person.knownForCamera'),
            'Editing': t('person.knownForEditing'),
            'Art': t('person.knownForArt'),
            'Costume & Make-Up': t('person.knownForCostumeMakeUp'),
            'Visual Effects': t('person.knownForVisualEffects'),
            'Crew': t('person.knownForCrew')
        };
        return departmentMap[department] || department;
    };

    const getResultYear = (result: SearchResult) => {
        if (result.media_type === 'person') {
            return translateKnownFor(result.known_for_department);
        }
        const date = result.release_date || result.first_air_date;
        return date ? new Date(date).getFullYear() : '';
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#121212',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 'calc(50vh - 285px)'
        }}>
            <div style={{
                padding: '0 20px',
                width: '100%',
                maxWidth: '600px'
            }}>
                <div ref={resultsRef} style={{ position: 'relative' }}>
                    <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder={t('common.searchPlaceholder')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            style={{
                                width: '100%',
                                padding: '20px 30px 20px 60px',
                                borderRadius: isFocused ? '24px 24px 0 0' : '9999px',
                                border: 'none',
                                outline: 'none',
                                backgroundColor: '#2A2A2A',
                                color: '#FFFFFF',
                                fontSize: '24px',
                                fontFamily: 'Inter, sans-serif',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                                boxSizing: 'border-box'
                            }}
                        />
                        <Search
                            style={{
                                position: 'absolute',
                                left: '24px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#888'
                            }}
                            size={28}
                        />
                    </form>

                    {/* Search Results Dropdown */}
                    {isFocused && (
                        <div 
                            ref={scrollContainerRef}
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: '#2A2A2A',
                                borderRadius: '0 0 24px 24px',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                                height: '500px',
                                overflowY: 'auto',
                                zIndex: 1000
                            }}>
                            {isSearching && query.trim().length >= 1 ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#888',
                                    fontSize: '14px'
                                }}>
                                    {t('common.searching')}...
                                </div>
                            ) : searchResults.length > 0 ? (
                                <>
                                    {searchResults.slice(0, displayCount).map((result) => (
                                    <div
                                        key={`${result.media_type}-${result.id}`}
                                        onClick={() => handleResultClick(result)}
                                        style={{
                                            display: 'flex',
                                            gap: '16px',
                                            padding: '12px 20px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #333',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            backgroundColor: '#1a1a1a',
                                            borderRadius: result.media_type === 'person' ? '50%' : '4px',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {getResultImage(result) ? (
                                                <img
                                                    src={getResultImage(result)!}
                                                    alt={getResultTitle(result)}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                result.media_type === 'person' ? <User size={24} color="#666" /> : <Film size={24} color="#666" />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                color: '#fff',
                                                fontSize: '16px',
                                                fontWeight: 500,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {getResultTitle(result)}
                                                </span>
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '12px',
                                                    color: '#999',
                                                    backgroundColor: '#1a1a1a',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    flexShrink: 0
                                                }}>
                                                    {getMediaTypeIcon(result.media_type)}
                                                    {getMediaTypeLabel(result.media_type)}
                                                </span>
                                            </div>
                                            <div style={{
                                                color: '#999',
                                                fontSize: '14px',
                                                marginTop: '4px'
                                            }}>
                                                {getResultYear(result)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                                }
                                {(displayCount < searchResults.length || currentPage < totalPages) && (
                                    <div style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: '#888',
                                        fontSize: '14px'
                                    }}>
                                        {t('common.loading')}...
                                    </div>
                                )}
                                </>
                            ) : query.trim().length >= 1 ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#888',
                                    fontSize: '14px'
                                }}>
                                    {t('common.noResults')}
                                </div>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#666',
                                    fontSize: '14px'
                                }}>
                                    {t('common.startTyping')}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

