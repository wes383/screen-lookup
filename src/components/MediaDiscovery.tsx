import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Film, ArrowUp, Loader } from 'lucide-react';
import {
    discoverMedia,
    getGenres,
    getImageUrl,
    type SearchResult,
    type Genre
} from '../services/tmdb';
import { getTMDBLanguage } from '../utils/languageMapper';

export default function MediaDiscovery() {
    const { t, i18n } = useTranslation();

    // State
    const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [selectedDecade, setSelectedDecade] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [minRuntime, setMinRuntime] = useState<number | ''>('');
    const [maxRuntime, setMaxRuntime] = useState<number | ''>('');
    const [voteAverageRange, setVoteAverageRange] = useState<[number, number]>([0, 10]);
    const [localVoteAverageRange, setLocalVoteAverageRange] = useState<[number, number]>([0, 10]);

    useEffect(() => {
        setLocalVoteAverageRange(voteAverageRange);
    }, [voteAverageRange]);

    const [minVoteCount, setMinVoteCount] = useState<number>(0);
    const [sortBy, setSortBy] = useState<string>('popularity.desc');

    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

    const [items, setItems] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalResults, setTotalResults] = useState(0);

    const observerTarget = useRef<HTMLDivElement>(null);
    const sortDropdownRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    const pageRef = useRef(1);
    const hasMoreRef = useRef(true);

    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const isMobile = window.innerWidth <= 768;

    // Constants
    const decades = [
        '2020s', '2010s', '2000s', '1990s', '1980s', '1970s',
        '1960s', '1950s', '1940s', '1930s', '1920s', '1910s', '1900s'
    ];

    const regions = [
        { code: 'US', name: t('common.countries.US', 'United States') },
        { code: 'CN', name: t('common.countries.CN', 'China') },
        { code: 'JP', name: t('common.countries.JP', 'Japan') },
        { code: 'KR', name: t('common.countries.KR', 'South Korea') },
        { code: 'GB', name: t('common.countries.GB', 'United Kingdom') },
        { code: 'FR', name: t('common.countries.FR', 'France') },
        { code: 'DE', name: t('common.countries.DE', 'Germany') },
        { code: 'IN', name: t('common.countries.IN', 'India') },
        { code: 'ES', name: t('common.countries.ES', 'Spain') },
        { code: 'IT', name: t('common.countries.IT', 'Italy') },
        { code: 'CA', name: t('common.countries.CA', 'Canada') },
        { code: 'AU', name: t('common.countries.AU', 'Australia') },
        { code: 'HK', name: t('common.countries.HK', 'Hong Kong') },
        { code: 'TW', name: t('common.countries.TW', 'Taiwan') },
        { code: 'RU', name: t('common.countries.RU', 'Russia') },
        { code: 'BR', name: t('common.countries.BR', 'Brazil') },
        { code: 'MX', name: t('common.countries.MX', 'Mexico') },
        { code: 'TH', name: t('common.countries.TH', 'Thailand') },
        { code: 'SE', name: t('common.countries.SE', 'Sweden') },
        { code: 'NO', name: t('common.countries.NO', 'Norway') },
        { code: 'DK', name: t('common.countries.DK', 'Denmark') }
    ];

    const languages = [
        { code: 'en', name: t('common.languages.en', 'English') },
        { code: 'zh', name: t('common.languages.zh', 'Chinese') },
        { code: 'ja', name: t('common.languages.ja', 'Japanese') },
        { code: 'ko', name: t('common.languages.ko', 'Korean') },
        { code: 'fr', name: t('common.languages.fr', 'French') },
        { code: 'de', name: t('common.languages.de', 'German') },
        { code: 'es', name: t('common.languages.es', 'Spanish') },
        { code: 'it', name: t('common.languages.it', 'Italian') },
        { code: 'hi', name: t('common.languages.hi', 'Hindi') },
        { code: 'ru', name: t('common.languages.ru', 'Russian') },
        { code: 'pt', name: t('common.languages.pt', 'Portuguese') },
        { code: 'th', name: t('common.languages.th', 'Thai') },
        { code: 'sv', name: t('common.languages.sv', 'Swedish') },
        { code: 'no', name: t('common.languages.no', 'Norwegian') },
        { code: 'da', name: t('common.languages.da', 'Danish') }
    ];

    const minVoteCounts = [0, 50, 100, 500, 1000, 5000, 10000, 20000];

    const productionCompanies = [
        { id: '33', name: 'Universal Pictures' },
        { id: '174', name: 'Warner Bros. Pictures' },
        { id: '4', name: 'Paramount Pictures' },
        { id: '127928', name: '20th Century Studios' },
        { id: '2', name: 'Walt Disney Pictures' },
        { id: '5', name: 'Columbia Pictures' },
        { id: '34', name: 'Sony Pictures' },
        { id: '41077', name: 'A24' },
        { id: '7', name: 'DreamWorks Pictures' },
        { id: '3', name: 'Pixar' },
        { id: '128064', name: 'DC Films' },
        { id: '923', name: 'Legendary Pictures' },
        { id: '12', name: 'New Line Cinema' },
        { id: '10163', name: 'Working Title Films' },
        { id: '3172', name: 'Blumhouse Productions' },
        { id: '508', name: 'Regency Enterprises' },
        { id: '521', name: 'DreamWorks Animation' },
        { id: '420', name: 'Marvel Studios' },
        { id: '194232', name: 'Apple Studios' }
    ];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(target)) {
                setIsSortDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch Genres when mediaType changes
    useEffect(() => {
        const fetchGenres = async () => {
            const currentLanguage = getTMDBLanguage(i18n.language);
            const genreList = await getGenres(mediaType, currentLanguage);
            setGenres(genreList);
            setSelectedGenres([]);
        };
        fetchGenres();
        // Reset production company when switching media type
        setSelectedCompany('');
    }, [mediaType, i18n.language]);

    // Load Data
    const loadData = useCallback(async (pageNum: number, isInitial: boolean) => {
        if (isInitial) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const currentLanguage = getTMDBLanguage(i18n.language);
            const params: Record<string, string> = {
                sort_by: sortBy,
                with_genres: selectedGenres.join(','),
                'vote_average.gte': voteAverageRange[0].toString(),
                'vote_average.lte': voteAverageRange[1].toString(),
                'vote_count.gte': minVoteCount.toString(),
                ...(selectedRegion && { with_origin_country: selectedRegion }),
                ...(selectedLanguage && { with_original_language: selectedLanguage }),
                ...(selectedCompany && { with_companies: selectedCompany })
            };

            if (minRuntime !== '') params['with_runtime.gte'] = minRuntime.toString();
            if (maxRuntime !== '') params['with_runtime.lte'] = maxRuntime.toString();

            if (selectedYear) {
                if (mediaType === 'movie') {
                    params['primary_release_year'] = selectedYear;
                } else {
                    params['first_air_date_year'] = selectedYear;
                }
            } else if (selectedDecade) {
                const startYear = parseInt(selectedDecade.replace('s', ''));
                const endYear = startYear + 9;

                if (mediaType === 'movie') {
                    params['primary_release_date.gte'] = `${startYear}-01-01`;
                    params['primary_release_date.lte'] = `${endYear}-12-31`;
                } else {
                    params['first_air_date.gte'] = `${startYear}-01-01`;
                    params['first_air_date.lte'] = `${endYear}-12-31`;
                }
            }

            const data = await discoverMedia(mediaType, params, currentLanguage, pageNum);

            if (isInitial) {
                setItems(data.results);
                setHasMore(pageNum < data.total_pages);
                setTotalResults(data.total_results);
            } else {
                setItems(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newItems = data.results.filter(item => !existingIds.has(item.id));
                    return [...prev, ...newItems];
                });
                setHasMore(pageNum < data.total_pages);
                hasMoreRef.current = pageNum < data.total_pages;
            }

            pageRef.current = pageNum;
        } catch (error) {
            console.error('Error discovering media:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            loadingRef.current = false;
        }
    }, [mediaType, sortBy, selectedGenres, selectedDecade, selectedYear, selectedRegion, selectedLanguage, selectedCompany, voteAverageRange, minVoteCount, minRuntime, maxRuntime, i18n.language]);

    // Reset and reload when filters change
    useEffect(() => {
        setItems([]);
        pageRef.current = 1;
        setHasMore(true);
        loadData(1, true);
    }, [mediaType, sortBy, selectedGenres, selectedDecade, selectedYear, selectedRegion, selectedLanguage, selectedCompany, voteAverageRange, minVoteCount, minRuntime, maxRuntime, loadData]);

    const loadDataRef = useRef(loadData);
    useEffect(() => {
        loadDataRef.current = loadData;
    }, [loadData]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
                    loadingRef.current = true;
                    loadDataRef.current(pageRef.current + 1, false);
                }
            },
            { threshold: 0.1 }
        );

        const target = observerTarget.current;
        if (target) {
            observer.observe(target);
        }

        return () => {
            if (target) {
                observer.unobserve(target);
            }
        };
    }, []);

    // Handlers
    const toggleGenre = (genreId: number) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        );
    };

    const handleItemClick = (item: SearchResult) => {
        const url = `/${mediaType}/${item.id}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const getCardTitle = (item: SearchResult) => {
        return item.title || item.name || item.original_title || item.original_name || '';
    };

    const getCardImage = (item: SearchResult) => {
        const path = item.poster_path || item.profile_path;
        return path ? getImageUrl(path, 'w500') : null;
    };

    const getSortLabel = (option: string) => {
        const order = option.includes('desc') ? t('common.desc', 'Desc') : t('common.asc', 'Asc');
        if (option.includes('popularity')) return `${t('common.popularity', 'Popularity')} (${order})`;
        if (option.includes('vote_average')) return `${t('common.rating', 'Rating')} (${order})`;
        if (option.includes('vote_count')) return `${t('common.voteCount', 'Vote Count')} (${order})`;
        if (option.includes('revenue')) return `${t('common.revenue', 'Revenue')} (${order})`;
        if (option.includes('date')) return `${t('common.date', 'Date')} (${order})`;
        return option;
    };

    const sortOptions = [
        { value: 'popularity.desc', label: `${t('common.popularity', 'Popularity')} (${t('common.desc', 'Desc')})` },
        { value: 'popularity.asc', label: `${t('common.popularity', 'Popularity')} (${t('common.asc', 'Asc')})` },
        { value: 'vote_average.desc', label: `${t('common.rating', 'Rating')} (${t('common.desc', 'Desc')})` },
        { value: 'vote_average.asc', label: `${t('common.rating', 'Rating')} (${t('common.asc', 'Asc')})` },
        { value: 'vote_count.desc', label: `${t('common.voteCount', 'Vote Count')} (${t('common.desc', 'Desc')})` },
        { value: 'vote_count.asc', label: `${t('common.voteCount', 'Vote Count')} (${t('common.asc', 'Asc')})` },
        { value: 'revenue.desc', label: `${t('common.revenue', 'Revenue')} (${t('common.desc', 'Desc')})` },
        { value: 'revenue.asc', label: `${t('common.revenue', 'Revenue')} (${t('common.asc', 'Asc')})` },
        { value: mediaType === 'movie' ? 'release_date.desc' : 'first_air_date.desc', label: `${t('common.date', 'Date')} (${t('common.desc', 'Desc')})` },
        { value: mediaType === 'movie' ? 'release_date.asc' : 'first_air_date.asc', label: `${t('common.date', 'Date')} (${t('common.asc', 'Asc')})` },
    ];

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
                        {t('common.mediaFilter', 'Media Filter')}
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
                    {/* Media Type */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold', margin: 0 }}>
                            {t('common.mediaType', 'Media Type')}
                        </h3>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button
                                onClick={() => setMediaType('movie')}
                                style={{
                                    backgroundColor: mediaType === 'movie' ? '#fff' : '#2a2a2a',
                                    color: mediaType === 'movie' ? '#000' : '#ccc',
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
                                {t('common.movies', 'Movies')}
                            </button>
                            <button
                                onClick={() => setMediaType('tv')}
                                style={{
                                    backgroundColor: mediaType === 'tv' ? '#fff' : '#2a2a2a',
                                    color: mediaType === 'tv' ? '#000' : '#ccc',
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
                                {t('common.tvShows', 'TV Shows')}
                            </button>
                        </div>
                    </div>

                    {/* Genres */}
                    <div>
                        <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold', margin: 0 }}>
                            {t('common.genres', 'Genres')}
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                            {genres.map(genre => (
                                <button
                                    key={genre.id}
                                    onClick={() => toggleGenre(genre.id)}
                                    style={{
                                        backgroundColor: selectedGenres.includes(genre.id) ? '#fff' : '#2a2a2a',
                                        color: selectedGenres.includes(genre.id) ? '#000' : '#ccc',
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
                                    {t(`common.genreNames.${genre.id}`, genre.name)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Additional Filters */}
                    <div style={{ marginTop: '24px', borderTop: '1px solid #333', paddingTop: '24px' }}>

                        {/* Region Filter */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold', margin: 0 }}>
                                {t('common.region', 'Region')}
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                <button
                                    onClick={() => setSelectedRegion('')}
                                    style={{
                                        backgroundColor: !selectedRegion ? '#fff' : '#2a2a2a',
                                        color: !selectedRegion ? '#000' : '#ccc',
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
                                    {t('common.all', 'All')}
                                </button>
                                {regions.map(region => (
                                    <button
                                        key={region.code}
                                        onClick={() => setSelectedRegion(region.code === selectedRegion ? '' : region.code)}
                                        style={{
                                            backgroundColor: selectedRegion === region.code ? '#fff' : '#2a2a2a',
                                            color: selectedRegion === region.code ? '#000' : '#ccc',
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
                                        {region.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language Filter */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold', margin: 0 }}>
                                {t('common.language', 'Language')}
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                <button
                                    onClick={() => setSelectedLanguage('')}
                                    style={{
                                        backgroundColor: !selectedLanguage ? '#fff' : '#2a2a2a',
                                        color: !selectedLanguage ? '#000' : '#ccc',
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
                                    {t('common.all', 'All')}
                                </button>
                                {languages.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setSelectedLanguage(lang.code === selectedLanguage ? '' : lang.code)}
                                        style={{
                                            backgroundColor: selectedLanguage === lang.code ? '#fff' : '#2a2a2a',
                                            color: selectedLanguage === lang.code ? '#000' : '#ccc',
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
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Production Company Filter (Movies only) */}
                        {mediaType === 'movie' && (
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold', margin: 0 }}>
                                    {t('common.productionCompany', 'Production Company')}
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                    <button
                                        onClick={() => setSelectedCompany('')}
                                        style={{
                                            backgroundColor: !selectedCompany ? '#fff' : '#2a2a2a',
                                            color: !selectedCompany ? '#000' : '#ccc',
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
                                        {t('common.all', 'All')}
                                    </button>
                                    {productionCompanies.map(company => (
                                        <button
                                            key={company.id}
                                            onClick={() => setSelectedCompany(company.id === selectedCompany ? '' : company.id)}
                                            style={{
                                                backgroundColor: selectedCompany === company.id ? '#fff' : '#2a2a2a',
                                                color: selectedCompany === company.id ? '#000' : '#ccc',
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
                                            {company.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rating Range & Min Vote Count */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                {/* Rating Range */}
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold', margin: 0 }}>
                                        {t('common.ratingRange', 'Rating Range')} ({localVoteAverageRange[0]} - {localVoteAverageRange[1]})
                                    </h3>
                                    <div style={{ position: 'relative', marginTop: '12px', padding: '10px 0' }}>
                                        <div className="range-slider-container">
                                            <div className="range-slider-track"></div>
                                            <div
                                                className="range-slider-range"
                                                style={{
                                                    left: `${(localVoteAverageRange[0] / 10) * 100}%`,
                                                    width: `${((localVoteAverageRange[1] - localVoteAverageRange[0]) / 10) * 100}%`
                                                }}
                                            ></div>

                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                step="0.5"
                                                value={localVoteAverageRange[0]}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val <= localVoteAverageRange[1]) {
                                                        setLocalVoteAverageRange([val, localVoteAverageRange[1]]);
                                                    }
                                                }}
                                                onMouseUp={() => setVoteAverageRange(localVoteAverageRange)}
                                                onTouchEnd={() => setVoteAverageRange(localVoteAverageRange)}
                                                className="range-slider-input"
                                                style={{ zIndex: localVoteAverageRange[0] > 9 ? 5 : 3 }}
                                            />
                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                step="0.5"
                                                value={localVoteAverageRange[1]}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val >= localVoteAverageRange[0]) {
                                                        setLocalVoteAverageRange([localVoteAverageRange[0], val]);
                                                    }
                                                }}
                                                onMouseUp={() => setVoteAverageRange(localVoteAverageRange)}
                                                onTouchEnd={() => setVoteAverageRange(localVoteAverageRange)}
                                                className="range-slider-input"
                                                style={{ zIndex: 4 }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: '#888', fontSize: '12px', paddingLeft: '2px', paddingRight: '2px' }}>
                                            <span>0</span>
                                            <span>5</span>
                                            <span>10</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Min Vote Count */}
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold', margin: 0 }}>
                                        {t('common.minVoteCount', 'Min Vote Count')}
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                        {minVoteCounts.map(count => (
                                            <button
                                                key={count}
                                                onClick={() => setMinVoteCount(count)}
                                                style={{
                                                    backgroundColor: minVoteCount === count ? '#fff' : '#2a2a2a',
                                                    color: minVoteCount === count ? '#000' : '#ccc',
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
                                                {count === 0 ? t('common.any', 'Any') : `>${count}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Runtime Filter */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold', margin: 0 }}>
                                {t('common.runtime', 'Runtime')}
                            </h3>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                                <div style={{ flex: 1, maxWidth: '200px' }}>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder={t('common.minRuntime', 'Min Runtime')}
                                        value={minRuntime}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setMinRuntime(isNaN(val) ? '' : val);
                                        }}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#2a2a2a',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            color: '#fff',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'Inter, sans-serif',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <span style={{ color: '#666' }}>-</span>
                                <div style={{ flex: 1, maxWidth: '200px' }}>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder={t('common.maxRuntime', 'Max Runtime')}
                                        value={maxRuntime}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setMaxRuntime(isNaN(val) ? '' : val);
                                        }}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#2a2a2a',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            color: '#fff',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'Inter, sans-serif',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <span style={{ color: '#666', fontSize: '14px' }}>{t('common.minutes', 'min')}</span>
                            </div>
                        </div>

                        {/* Decade / Year Filter */}
                        <div>
                            <h3 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold', margin: 0 }}>
                                {t('common.decade', 'Decade')} / {t('common.year', 'Year')}
                            </h3>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                marginTop: '12px',
                                maxHeight: '140px',
                                overflowY: 'auto',
                                paddingRight: '8px'
                            }}>
                                <button
                                    onClick={() => {
                                        setSelectedDecade('');
                                        setSelectedYear('');
                                    }}
                                    style={{
                                        backgroundColor: !selectedDecade && !selectedYear ? '#fff' : '#2a2a2a',
                                        color: !selectedDecade && !selectedYear ? '#000' : '#ccc',
                                        border: '1px solid #333',
                                        borderRadius: '20px',
                                        padding: '6px 14px',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontWeight: 500,
                                        fontFamily: 'Inter, sans-serif',
                                        height: 'fit-content'
                                    }}
                                >
                                    {t('common.all', 'All')}
                                </button>
                                {decades.map(decade => (
                                    <button
                                        key={decade}
                                        onClick={() => {
                                            setSelectedDecade(decade === selectedDecade ? '' : decade);
                                            setSelectedYear('');
                                        }}
                                        style={{
                                            backgroundColor: selectedDecade === decade ? '#fff' : '#2a2a2a',
                                            color: selectedDecade === decade ? '#000' : '#ccc',
                                            border: '1px solid #333',
                                            borderRadius: '20px',
                                            padding: '6px 14px',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontWeight: 500,
                                            fontFamily: 'Inter, sans-serif',
                                            height: 'fit-content'
                                        }}
                                    >
                                        {decade}
                                    </button>
                                ))}
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder={t('common.enterYear', 'Year')}
                                    value={selectedYear}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (/^\d*$/.test(val)) {
                                            setSelectedYear(val);
                                            if (val) setSelectedDecade('');
                                        }
                                    }}
                                    style={{
                                        backgroundColor: selectedYear ? '#fff' : '#2a2a2a',
                                        color: selectedYear ? '#000' : '#ccc',
                                        border: '1px solid #333',
                                        borderRadius: '20px',
                                        padding: '6px 14px',
                                        fontSize: '13px',
                                        outline: 'none',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 500,
                                        width: '70px',
                                        boxSizing: 'border-box',
                                        height: 'fit-content',
                                        textAlign: 'center'
                                    }}
                                />
                            </div>
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
                        {t('common.found', 'Found')} {totalResults.toLocaleString()} {mediaType === 'movie' ? t('common.movies', 'Movies') : t('common.tvShows', 'TV Shows')}
                    </div>

                    {/* Sort Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px', color: '#999', fontFamily: 'Inter, sans-serif' }}>{t('common.sortBy', 'Sort by')}:</span>
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
                                    minWidth: '180px',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {getSortLabel(sortBy)}
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
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                                    {sortOptions.map(opt => (
                                        <div
                                            key={opt.value}
                                            onClick={() => {
                                                setSortBy(opt.value);
                                                setIsSortDropdownOpen(false);
                                            }}
                                            style={{
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontFamily: 'Inter, sans-serif',
                                                backgroundColor: sortBy === opt.value ? '#333' : 'transparent',
                                                color: sortBy === opt.value ? '#fff' : '#ccc',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#333'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = sortBy === opt.value ? '#333' : 'transparent'}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div style={{ width: '100%' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                            <span style={{ color: '#fff', fontSize: '14px' }}>
                                {t('common.loading', 'Loading...')}
                            </span>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                            gap: isMobile ? '16px' : '24px'
                        }}>
                            {items.map((item) => (
                                <div
                                    key={`${item.id}-${item.media_type}`}
                                    onClick={() => handleItemClick(item)}
                                    style={{
                                        cursor: 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    <div
                                        style={{
                                            position: 'relative',
                                            backgroundColor: '#1E1E1E',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            transition: 'transform 0.2s',
                                            aspectRatio: '2/3',
                                            marginBottom: '8px'
                                        }}
                                        onMouseEnter={e => {
                                            if (!isMobile) {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                const overlay = e.currentTarget.querySelector('.glow-overlay') as HTMLElement;
                                                if (overlay) overlay.style.opacity = '1';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!isMobile) {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                const overlay = e.currentTarget.querySelector('.glow-overlay') as HTMLElement;
                                                if (overlay) overlay.style.opacity = '0';
                                            }
                                        }}
                                        onMouseMove={e => {
                                            if (!isMobile) {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const x = e.clientX - rect.left;
                                                const y = e.clientY - rect.top;
                                                const overlay = e.currentTarget.querySelector('.glow-overlay') as HTMLElement;
                                                if (overlay) {
                                                    overlay.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 50%)`;
                                                }
                                            }
                                        }}
                                    >
                                        <div
                                            className="glow-overlay"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                opacity: 0,
                                                transition: 'opacity 0.2s',
                                                pointerEvents: 'none',
                                                zIndex: 10
                                            }}
                                        />
                                        {getCardImage(item) ? (
                                            <img
                                                src={getCardImage(item)!}
                                                alt={getCardTitle(item)}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#2A2A2A',
                                                color: '#666'
                                            }}>
                                                <Film size={40} />
                                            </div>
                                        )}
                                    </div>
                                    <h3 style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        margin: '0 0 4px 0',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {getCardTitle(item)}
                                    </h3>
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#aaa',
                                        margin: 0
                                    }}>
                                        {new Date(item.release_date || item.first_air_date || '').getFullYear() || 'TBA'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Infinite Scroll Target */}
                    {hasMore && (
                        <div ref={observerTarget} style={{ height: '20px', margin: '20px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {loadingMore && (
                                <Loader size={24} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        backgroundColor: '#fff',
                        color: '#000',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        zIndex: 100,
                        transition: 'all 0.3s ease',
                        opacity: showBackToTop ? 1 : 0,
                        transform: showBackToTop ? 'translateY(0)' : 'translateY(20px)'
                    }}
                    aria-label="Back to top"
                >
                    <ArrowUp size={24} />
                </button>
            )}
        </div>
    );
}
