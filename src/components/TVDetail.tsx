import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTVDetails, getTVLogos, getTVContentRatings, getTVWatchProviders, getTVKeywords, getTVCredits, getTVAlternativeTitles, getTVVideos, getTVSeasonDetails, getTVEpisodeDetails, getImageUrl, getIMDbRating, type TVDetails, type MovieLogo, type WatchProviderData, type WatchProvider, type Keyword, type MovieCredits, type AlternativeTitle, type ContentRating, type MovieVideo, type SeasonDetails } from '../services/tmdb';
import { X, User, PlayCircle, Film, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLoading } from '../contexts/LoadingContext';
import { getTMDBLanguage, getTMDBImageLanguage, getCountryCode, getDateLocale } from '../utils/languageMapper';

export default function TVDetail() {
    const { t, i18n } = useTranslation();
    const { setIsLoading } = useLoading();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const translateStatus = (status: string | undefined): string => {
        if (!status) return t('common.unknown');
        
        const statusMap: { [key: string]: string } = {
            'Returning Series': t('tv.returningSeries'),
            'Planned': t('tv.planned'),
            'In Production': t('tv.inProduction'),
            'Pilot': t('tv.pilot'),
            'Canceled': t('tv.canceled'),
            'Ended': t('tv.ended')
        };
        
        return statusMap[status] || status;
    };

    const translateType = (type: string | undefined): string => {
        if (!type) return t('common.unknown');
        const typeMap: { [key: string]: string } = {
            'Scripted': t('tv.typeScripted'),
            'Reality': t('tv.typeReality'),
            'Documentary': t('tv.typeDocumentary'),
            'News': t('tv.typeNews'),
            'Talk Show': t('tv.typeTalkShow'),
            'Miniseries': t('tv.typeMiniseries'),
            'Video': t('tv.typeVideo')
        };
        return typeMap[type] || type;
    };

    const translateLanguageSafe = (langCode: string | undefined): string => {
        if (!langCode) return t('common.unknown');
        const translation = t(`common.languages.${langCode}`);
        return translation !== `common.languages.${langCode}` ? translation : langCode;
    };

    const translateCountrySafe = (countryCode: string | undefined): string => {
        if (!countryCode) return t('common.unknown');
        const translation = t(`common.countries.${countryCode}`);
        return translation !== `common.countries.${countryCode}` ? translation : countryCode;
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        
        const locale = getDateLocale(i18n.language);
        
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(dateString));
    };

    const [tv, setTV] = useState<TVDetails | null>(null);
    const [englishName, setEnglishName] = useState<string>('');
    const [logo, setLogo] = useState<MovieLogo | null>(null);
    const [contentRating, setContentRating] = useState<string | null>(null);
    const [contentRatings, setContentRatings] = useState<ContentRating[]>([]);
    const [watchProviders, setWatchProviders] = useState<WatchProviderData | null>(null);
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [credits, setCredits] = useState<MovieCredits>({ cast: [], crew: [] });
    const [showFullCast, setShowFullCast] = useState(false);
    const [isFullCastHovered, setIsFullCastHovered] = useState(false);
    const [alternativeTitles, setAlternativeTitles] = useState<AlternativeTitle[]>([]);
    const [showAlternativeTitles, setShowAlternativeTitles] = useState(false);
    const [showTrailers, setShowTrailers] = useState(false);
    const [showContentRatings, setShowContentRatings] = useState(false);
    const [videos, setVideos] = useState<MovieVideo[]>([]);
    const [isCertHovered, setIsCertHovered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imdbRating, setImdbRating] = useState<{ aggregateRating: number; voteCount: number } | null>(null);

    useEffect(() => {
        setIsLoading(true);
        return () => setIsLoading(false);
    }, [setIsLoading]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [selectedSeasonDetails, setSelectedSeasonDetails] = useState<SeasonDetails | null>(null);
    const [showSeasonDetails, setShowSeasonDetails] = useState(false);
    const [loadingSeason, setLoadingSeason] = useState(false);
    const [episodeImdbRatings, setEpisodeImdbRatings] = useState<{ [key: string]: { aggregateRating: number; voteCount: number } }>({});

    const handleSeasonClick = async (seasonNumber: number) => {
        if (!id) return;
        setLoadingSeason(true);
        setSelectedSeasonDetails(null);
        setEpisodeImdbRatings({});
        setShowSeasonDetails(true);
        try {
            const currentLanguage = getTMDBLanguage(i18n.language);
            const data = await getTVSeasonDetails(id, seasonNumber, currentLanguage);
            setSelectedSeasonDetails(data);
            
            // Fetch IMDb ratings for all episodes
            if (data?.episodes) {
                const ratingsPromises = data.episodes.map(async (episode) => {
                    const episodeDetails = await getTVEpisodeDetails(id, seasonNumber, episode.episode_number, currentLanguage);
                    if (episodeDetails?.external_ids?.imdb_id) {
                        const rating = await getIMDbRating(episodeDetails.external_ids.imdb_id);
                        return { episodeId: episode.id, rating };
                    }
                    return { episodeId: episode.id, rating: null };
                });
                
                const ratings = await Promise.all(ratingsPromises);
                const ratingsMap: { [key: string]: { aggregateRating: number; voteCount: number } } = {};
                ratings.forEach(({ episodeId, rating }) => {
                    if (rating) {
                        ratingsMap[episodeId] = rating;
                    }
                });
                setEpisodeImdbRatings(ratingsMap);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSeason(false);
        }
    };

    useEffect(() => {
        const toggleOverflow = (shouldHide: boolean) => {
            document.body.style.overflow = shouldHide ? 'hidden' : '';
        };
        toggleOverflow(showFullCast || showAlternativeTitles || showContentRatings || showTrailers || showSeasonDetails);
        return () => { document.body.style.overflow = ''; };
    }, [showFullCast, showAlternativeTitles, showContentRatings, showTrailers, showSeasonDetails]);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setIsLoading(true);
        setError('');

        const currentLanguage = getTMDBLanguage(i18n.language);
        const imageLanguage = getTMDBImageLanguage(i18n.language);
        const countryCode = getCountryCode(i18n.language);

        Promise.all([
            getTVDetails(id, currentLanguage),
            getTVLogos(id, imageLanguage),
            getTVContentRatings(id),
            getTVWatchProviders(id, countryCode),
            getTVKeywords(id),
            getTVCredits(id, currentLanguage),
            getTVAlternativeTitles(id),
            getTVVideos(id),
            getTVDetails(id, 'en-US')
        ])
            .then(([tvData, logos, ratings, providers, kw, creds, altTitles, vids, englishData]) => {
                setTV(tvData);
                setEnglishName(englishData.name);
                const currentLogo = logos.find(l => l.iso_639_1 === imageLanguage) || logos[0] || null;
                setLogo(currentLogo);

                setContentRatings(ratings);
                const countryRating = ratings.find(r => r.iso_3166_1 === countryCode)?.rating ||
                    ratings.find(r => r.iso_3166_1 === 'US')?.rating ||
                    ratings[0]?.rating || null;
                setContentRating(countryRating);

                setWatchProviders(providers);
                setKeywords(kw);
                setCredits(creds);
                setAlternativeTitles(altTitles);
                setVideos(vids);

                if (tvData.external_ids?.imdb_id) {
                    getIMDbRating(tvData.external_ids.imdb_id).then(rating => {
                        if (rating) setImdbRating(rating);
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to load TV details.');
            })
            .finally(() => {
                setLoading(false);
                setIsLoading(false);
            });
    }, [id, i18n.language]);

    const translateJob = (job: string): string => {
        const jobMap: { [key: string]: string } = {
            'Director': t('person.knownForDirecting'),
            'Writer': t('person.knownForWriting'),
            'Screenplay': t('person.knownForWriting'),
            'Story': t('person.knownForWriting'),
            'Producer': t('person.knownForProduction'),
            'Executive Producer': t('person.knownForProduction'),
            'Original Music Composer': t('person.knownForSound'),
            'Music': t('person.knownForSound'),
            'Director of Photography': t('person.knownForCamera'),
            'Cinematography': t('person.knownForCamera'),
            'Editor': t('person.knownForEditing'),
            'Production Design': t('person.knownForArt'),
            'Art Direction': t('person.knownForArt'),
            'Costume Design': t('person.knownForCostumeMakeUp'),
            'Makeup Artist': t('person.knownForCostumeMakeUp'),
            'Casting': t('person.knownForProduction'),
            'Sound Designer': t('person.knownForSound'),
            'Visual Effects': t('person.knownForVisualEffects'),
            'Novel': t('person.knownForWriting')
        };
        return jobMap[job] || job;
    };

    const translateDepartment = (department: string): string => {
        const deptMap: { [key: string]: string } = {
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
        return deptMap[department] || department;
    };

    if (loading) {
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', backgroundColor: '#121212', zIndex: 9999 }}>
                {t('common.loading')}
            </div>
        );
    }

    if (error || !tv) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', backgroundColor: '#121212' }}>
                <p>{error || t('tv.notFound')}</p>
                <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#333', color: 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    {t('common.goBack')}
                </button>
            </div>
        );
    }

    const backgroundUrl = getImageUrl(tv.backdrop_path || tv.poster_path, 'original');
    const runtime = tv.episode_run_time?.[0] || 0;

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#121212',
            fontFamily: 'Inter, sans-serif',
            color: 'white',
            overflowX: 'hidden'
        }}>
            {/* Hero Section */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: isMobile ? '50vh' : '80vh',
            }}>
                {/* Background Image */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${backgroundUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'top center',
                    opacity: 0.85
                }} />

                {/* Gradient Fade */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, transparent 0%, rgba(18,18,18,0.01) 20%, rgba(18,18,18,0.1) 40%, rgba(18,18,18,0.4) 60%, rgba(18,18,18,0.8) 80%, #121212 100%)'
                }} />
            </div>

            {/* Content Section */}
            <div style={{
                padding: isMobile ? '0 20px 40px 20px' : '0 60px 80px 80px',
                marginTop: isMobile ? '-80px' : '-120px',
                position: 'relative',
                zIndex: 10
            }}>
                {logo ? (
                    <img
                        onClick={() => setShowAlternativeTitles(true)}
                        src={getImageUrl(logo.file_path, 'original')}
                        alt={tv.name}
                        style={{
                            maxHeight: isMobile ? '80px' : '120px',
                            maxWidth: isMobile ? '280px' : '400px',
                            marginBottom: '16px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                            cursor: 'pointer'
                        }}
                    />
                ) : (
                    <h1
                        onClick={() => setShowAlternativeTitles(true)}
                        style={{
                            fontSize: isMobile ? '2rem' : '4rem',
                            margin: '0 0 16px 0',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            cursor: 'pointer'
                        }}>
                        {tv.name}
                    </h1>
                )}

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '8px' : '12px',
                    color: '#e0e0e0',
                    marginBottom: isMobile ? '24px' : '32px',
                    fontSize: isMobile ? '14px' : '18px',
                    fontWeight: 500,
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    flexWrap: 'wrap'
                }}>
                    {contentRating && (
                        <>
                            <span
                                onClick={() => setShowContentRatings(true)}
                                onMouseEnter={() => setIsCertHovered(true)}
                                onMouseLeave={() => setIsCertHovered(false)}
                                style={{
                                    cursor: 'pointer',
                                    border: '1.5px solid rgba(255, 255, 255, 0.6)',
                                    padding: '0px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: isCertHovered ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                                    color: isCertHovered ? '#121212' : 'inherit',
                                    transition: 'background-color 0.2s, color 0.2s',
                                    display: 'inline-block',
                                    fontSize: '16px',
                                    textShadow: 'none'
                                }}>
                                {contentRating}
                            </span>
                            <span>•</span>
                        </>
                    )}
                    <span
                        style={{
                            cursor: 'default',
                        }}>
                        {new Date(tv.first_air_date).getFullYear()}
                    </span>
                    <span>•</span>
                    <span>{tv.number_of_seasons} {t('tv.seasons')}</span>
                    <span>•</span>
                    <span>{tv.number_of_episodes} {t('tv.episodes')}</span>
                    {runtime > 0 && (
                        <>
                            <span>•</span>
                            <span>{runtime >= 60 ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : `${runtime}m`}</span>
                        </>
                    )}
                    <span>•</span>
                    <span>{tv.genres.map(g => g.name).join(', ')}</span>
                </div>

                <div style={{ maxWidth: '800px' }}>
                    {tv.tagline && (
                        <p style={{
                            fontSize: '18px',
                            fontStyle: 'italic',
                            color: 'rgba(255, 255, 255, 0.6)',
                            marginBottom: '24px',
                            fontWeight: 300,
                            lineHeight: 1.4
                        }}>
                            {tv.tagline}
                        </p>
                    )}
                </div>

                {(tv.vote_average > 0 || imdbRating) && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '16px' : '24px',
                        marginBottom: isMobile ? '20px' : '24px',
                        flexWrap: 'wrap'
                    }}>
                        {tv.vote_average > 0 && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    fontSize: isMobile ? '16px' : '18px',
                                    fontWeight: 600,
                                    color: '#01b4e4'
                                }}>
                                    TMDB
                                </span>
                                <span style={{
                                    fontSize: isMobile ? '16px' : '18px',
                                    fontWeight: 600,
                                    color: '#fff'
                                }}>
                                    {tv.vote_average.toFixed(1)}
                                </span>
                            </div>
                        )}
                        {imdbRating && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    fontSize: isMobile ? '16px' : '18px',
                                    fontWeight: 600,
                                    color: '#DBA506'
                                }}>
                                    IMDb
                                </span>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <span style={{
                                        fontSize: isMobile ? '16px' : '18px',
                                        fontWeight: 600,
                                        color: '#fff'
                                    }}>
                                        {imdbRating.aggregateRating.toFixed(1)}
                                    </span>
                                    <span style={{
                                        fontSize: isMobile ? '13px' : '14px',
                                        color: '#999'
                                    }}>
                                        ({(() => {
                                            const count = imdbRating.voteCount;
                                            if (count < 1000) {
                                                return count.toString();
                                            } else if (count < 10000) {
                                                const k = count / 1000;
                                                return `${k.toFixed(1)}K`;
                                            } else if (count < 1000000) {
                                                const k = Math.round(count / 1000);
                                                return `${k}K`;
                                            } else {
                                                const m = count / 1000000;
                                                return `${m.toFixed(1)}M`;
                                            }
                                        })()})
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ maxWidth: '800px' }}>
                    <h3 style={{
                        fontSize: '1.2rem',
                        marginBottom: '16px',
                        fontWeight: 600,
                        color: '#fff'
                    }}>
                        {t('tv.overview')}
                    </h3>
                    <p style={{
                        fontSize: '1.125rem',
                        lineHeight: 1.6,
                        color: '#ccc',
                    }}>
                        {tv.overview}
                    </p>
                </div>

                {/* External Links */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {tv.homepage && (
                        <a
                            href={tv.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            {t('common.homepage')}
                        </a>
                    )}

                    {(() => {
                        const validTrailers = videos.filter(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official);
                        if (validTrailers.length > 1) {
                            return (
                                <span
                                    onClick={() => setShowTrailers(true)}
                                    style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px', cursor: 'pointer' }}
                                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                                >
                                    {t('tv.trailers')}
                                </span>
                            );
                        } else if (validTrailers.length === 1) {
                            return (
                                <a
                                    href={`https://www.youtube.com/watch?v=${validTrailers[0].key}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                                >
                                    {t('common.trailer')}
                                </a>
                            );
                        }
                        return null;
                    })()}
                    {(i18n.language === 'zh-CN') && (
                        <a
                            href={`https://www.douban.com/search?cat=1002&q=${encodeURIComponent(tv.original_name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            {t('common.douban')}
                        </a>
                    )}
                    {tv.external_ids?.imdb_id && (
                        <a
                            href={`https://www.imdb.com/title/${tv.external_ids.imdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            {t('common.imdb')}
                        </a>
                    )}
                    {tv.external_ids?.imdb_id && (
                        <a
                            href={`https://www.imdb.com/title/${tv.external_ids.imdb_id}/parentalguide`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            Parents Guide
                        </a>
                    )}
                    <a
                        href={`https://www.themoviedb.org/tv/${tv.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {t('common.tmdb')}
                    </a>
                    {tv.external_ids?.imdb_id && (
                        <a
                            href={`https://trakt.tv/shows/${tv.external_ids.imdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            {t('common.trakt')}
                        </a>
                    )}
                    <a
                        href={`https://www.metacritic.com/search/${encodeURIComponent(englishName || tv.original_name)}/?page=1&category=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {t('common.metacritic')}
                    </a>
                    <a
                        href={`https://www.rottentomatoes.com/search?search=${encodeURIComponent(englishName || tv.original_name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {t('common.rottentomatoes')}
                    </a>
                    <a
                        href={`https://www.justwatch.com/us/search?q=${encodeURIComponent(englishName || tv.original_name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {t('tv.justWatch')}
                    </a>
                </div>

                <div style={{ maxWidth: '800px' }}>
                    {/* Created By */}
                    {tv.created_by.length > 0 && (
                        <div style={{ marginTop: '32px' }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                marginBottom: '16px',
                                fontWeight: 600,
                                color: '#fff'
                            }}>
                                {t('tv.createdBy')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {tv.created_by.map(c => (
                                    <div key={c.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div
                                            onClick={() => navigate(`/person/${c.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {c.profile_path ? (
                                                <img
                                                    src={getImageUrl(c.profile_path, 'w185')}
                                                    alt={c.name}
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#333',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#888'
                                                }}>
                                                    <User size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <span onClick={() => navigate(`/person/${c.id}`)} style={{ fontSize: '18px', color: '#ccc', cursor: 'pointer', textUnderlineOffset: '4px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{c.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}



                    {/* Cast */}
                    {credits.cast.length > 0 && (
                        <div style={{ marginTop: '32px' }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                marginBottom: '16px',
                                fontWeight: 600,
                                color: '#fff'
                            }}>
                                {t('tv.cast')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {credits.cast.slice(0, 10).map(c => (
                                    <div key={c.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div
                                            onClick={() => navigate(`/person/${c.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {c.profile_path ? (
                                                <img
                                                    src={getImageUrl(c.profile_path, 'w185')}
                                                    alt={c.name}
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#333',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#888'
                                                }}>
                                                    <User size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                            <span onClick={() => navigate(`/person/${c.id}`)} style={{ fontSize: '18px', color: '#ccc', whiteSpace: 'nowrap', cursor: 'pointer', textUnderlineOffset: '4px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{c.name}</span>
                                            <span style={{ fontSize: '16px', color: '#666', whiteSpace: 'nowrap' }}>{t('common.as')}</span>
                                            <span style={{ fontSize: '18px', color: '#999', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }} title={c.character}>{c.character}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowFullCast(true)}
                                onMouseEnter={() => setIsFullCastHovered(true)}
                                onMouseLeave={() => setIsFullCastHovered(false)}
                                style={{
                                    marginTop: '16px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    textDecoration: isFullCastHovered ? 'underline' : 'none',
                                    textUnderlineOffset: '4px',
                                    padding: 0,
                                    fontFamily: 'Inter, sans-serif'
                                }}
                            >
                                {t('tv.fullCastAndCrew')}
                            </button>
                        </div>
                    )}

                </div>

                {/* Seasons */}
                {tv.seasons.length > 0 && (
                    <div style={{ marginTop: '32px', marginBottom: '32px' }}>
                        <h3 style={{
                            fontSize: '1.2rem',
                            marginBottom: '16px',
                            fontWeight: 600,
                            color: '#fff'
                        }}>
                            {t('tv.seasons')}
                        </h3>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {tv.seasons.filter(season => season.episode_count > 0).map(season => (
                                <div
                                    key={season.id}
                                    onClick={() => handleSeasonClick(season.season_number)}
                                    style={{ width: '140px', cursor: 'pointer' }}
                                >
                                    <div style={{
                                        height: '210px',
                                        backgroundColor: '#333',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        marginBottom: '8px'
                                    }}>
                                        {season.poster_path ? (
                                            <img
                                                src={getImageUrl(season.poster_path, 'w342')}
                                                alt={season.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                                <Film size={48} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{season.name}</div>
                                    <div style={{ fontSize: '13px', color: '#999' }}>
                                        {season.episode_count} {t('tv.episodes')}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#999' }}>
                                        {season.air_date ? new Date(season.air_date).getFullYear() : t('common.tba')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ maxWidth: '800px' }}>

                    {/* Watch Providers */}
                    {watchProviders && (watchProviders.flatrate || watchProviders.rent || watchProviders.buy) && (
                        <div style={{ marginTop: '32px' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: 600, color: '#fff' }}>
                                {t('tv.whereToWatch')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['flatrate', 'rent', 'buy'].map(type => {
                                    const items = watchProviders[type as keyof WatchProviderData] as WatchProvider[];
                                    if (!items || items.length === 0) return null;
                                    const label = type === 'flatrate' ? t('common.stream') : type === 'rent' ? t('common.rent') : t('common.buy');
                                    return (
                                        <div key={type} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                            <span style={{ fontSize: '14px', color: '#999', minWidth: '50px', paddingTop: '2px' }}>{label}</span>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {items.map((p: WatchProvider) => (
                                                    <span key={p.provider_id} style={{ fontSize: '13px', color: '#ccc', border: '1px solid rgba(255,255,255,0.8)', padding: '2px 5px', borderRadius: '6px' }}>
                                                        {p.provider_name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p style={{ fontSize: '14px', color: '#666', marginTop: '12px' }}>{t('common.providedBy')} JustWatch</p>
                        </div>
                    )}

                    {/* TV Info */}
                    {(() => {
                        const infoItems = [
                            { label: t('tv.status'), value: translateStatus(tv.status) },
                            { label: t('tv.firstAirDate'), value: tv.first_air_date ? formatDate(tv.first_air_date) : t('common.unknown') },
                            { label: t('tv.lastAirDate'), value: tv.last_air_date ? formatDate(tv.last_air_date) : t('common.unknown') },
                            { label: t('tv.type'), value: translateType(tv.type) },
                            tv.next_episode_to_air ? {
                                label: t('tv.nextEpisode'),
                                value: `${tv.next_episode_to_air.name} (S${tv.next_episode_to_air.season_number}E${tv.next_episode_to_air.episode_number}) - ${formatDate(tv.next_episode_to_air.air_date)}`
                            } : null,
                            runtime > 0 ? { label: t('tv.episodeRuntime'), value: `${runtime}m` } : null,
                            { label: t('common.originalLanguage'), value: translateLanguageSafe(tv.original_language) },
                            { label: t('common.spokenLanguages'), value: tv.spoken_languages.map(l => translateLanguageSafe(l.iso_639_1)).join(', ') || t('common.unknown') },
                            { label: t('common.productionCountries'), value: tv.production_countries.map(c => translateCountrySafe(c.iso_3166_1)).join(', ') || t('common.unknown') },
                            { label: t('tv.network'), value: tv.networks.map(n => n.name).join(', ') || t('common.unknown') }
                        ].filter((item): item is { label: string; value: string } => item !== null && item.value !== undefined);

                        const gridCols = infoItems.length <= 4 ? 'auto auto' : 'auto auto auto';

                        return (
                            <div style={{
                                marginTop: '24px',
                                display: 'grid',
                                gridTemplateColumns: gridCols,
                                gap: '10px 80px',
                                justifyContent: 'start'
                            }}>
                                {infoItems.map((item, index) => (
                                    <div key={index}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: 600, color: '#fff' }}>{item.label}</h3>
                                        <p style={{ fontSize: '14px', color: '#ccc' }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {/* Production Companies */}
                    {tv.production_companies.length > 0 && (
                        <div style={{ marginTop: '24px' }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                marginBottom: '16px',
                                fontWeight: 600,
                                color: '#fff'
                            }}>
                                {t('common.productionCompanies')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {tv.production_companies.map(c => (
                                    <span key={c.id} style={{ fontSize: '14px', color: '#ccc' }}>
                                        {c.name} {c.origin_country ? `(${(() => {
                                            const translated = t(`common.countries.${c.origin_country}`);
                                            if (!translated.startsWith('common.countries.')) {
                                                return translated;
                                            }
                                            try {
                                                return new Intl.DisplayNames(['en'], { type: 'region' }).of(c.origin_country) || c.origin_country;
                                            } catch {
                                                return c.origin_country;
                                            }
                                        })()})` : ''}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Keywords */}
                    {keywords.length > 0 && (
                        <div style={{ marginTop: '24px' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: 600, color: '#fff' }}>{t('tv.keywords')}</h3>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {keywords.map(k => (
                                    <span key={k.id} style={{ fontSize: '13px', color: '#ccc', border: '1px solid rgba(255,255,255,0.8)', padding: '2px 5px', borderRadius: '6px' }}>{k.name}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full Cast & Crew Modal */}
            {showFullCast && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: isMobile ? '20px' : '40px' }} onClick={() => setShowFullCast(false)}>
                    <div style={{ backgroundColor: '#1a1a1a', borderRadius: isMobile ? '16px' : '24px', width: '100%', maxWidth: '800px', height: isMobile ? '85vh' : '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: isMobile ? '16px' : '24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ color: '#fff', margin: 0, fontSize: isMobile ? '1.2rem' : '1.5rem' }}>{t('tv.fullCastAndCrew')}</h2>
                            <button onClick={() => setShowFullCast(false)} style={{ background: 'none', border: 'none', color: '999', fontSize: isMobile ? '20px' : '24px', cursor: 'pointer' }}><X size={isMobile ? 20 : 24} /></button>
                        </div>
                        <div style={{ padding: isMobile ? '16px' : '24px', overflowY: 'auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '24px' : '40px' }}>
                            <div>
                                <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1.2rem' }}>{t('tv.cast')}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {credits.cast.map(c => (
                                        <div key={c.id} onClick={() => navigate(`/person/${c.id}`)} style={{ cursor: 'pointer' }}>
                                            <div style={{ color: '#ccc', fontWeight: 500, textUnderlineOffset: '4px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{c.name}</div>
                                            <div style={{ color: '#666', fontSize: '14px' }}>{c.character}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1.2rem' }}>{t('tv.crew')}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {credits.crew.map((c, idx) => (
                                        <div key={`${c.id}-${idx}`} onClick={() => navigate(`/person/${c.id}`)} style={{ cursor: 'pointer' }}>
                                            <div style={{ color: '#ccc', fontWeight: 500, textUnderlineOffset: '4px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{c.name}</div>
                                            <div style={{ color: '#666', fontSize: '14px' }}>{translateJob(c.job)} ({translateDepartment(c.department)})</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Alternative Titles Modal */}
            {showAlternativeTitles && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: isMobile ? '20px' : '40px' }} onClick={() => setShowAlternativeTitles(false)}>
                    <div style={{ backgroundColor: '#1a1a1a', borderRadius: isMobile ? '16px' : '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: isMobile ? '16px' : '24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ color: '#fff', margin: 0, fontSize: isMobile ? '1.2rem' : '1.5rem' }}>{t('tv.alternativeTitles')}</h2>
                            <button onClick={() => setShowAlternativeTitles(false)} style={{ background: 'none', border: 'none', color: '999', fontSize: isMobile ? '20px' : '24px', cursor: 'pointer' }}><X size={isMobile ? 20 : 24} /></button>
                        </div>
                        <div style={{ padding: isMobile ? '16px' : '24px', overflowY: 'auto' }}>
                            {alternativeTitles.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
                                        <span style={{ color: '#fff', fontWeight: 500 }}>{tv?.original_name}</span>
                                        <span style={{ color: '#999', fontSize: '14px' }}>
                                            {tv?.original_language && (t(`common.languages.${tv.original_language}`) || tv.original_language)} ({t('tv.original')})
                                        </span>
                                    </div>
                                    {alternativeTitles.map((title, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
                                            <span style={{ color: '#fff', fontWeight: 500 }}>{title.title}</span>
                                            <span style={{ color: '#999', fontSize: '14px' }}>
                                                {(() => {
                                                    const translated = t(`common.countries.${title.iso_3166_1}`);
                                                    if (!translated.startsWith('common.countries.')) {
                                                        return translated;
                                                    }
                                                    try {
                                                        return new Intl.DisplayNames(['en'], { type: 'region' }).of(title.iso_3166_1) || title.iso_3166_1;
                                                    } catch {
                                                        return title.iso_3166_1;
                                                    }
                                                })()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (<p style={{ color: '#ccc' }}>{t('tv.noAlternativeTitlesFound')}</p>)}
                        </div>
                    </div>
                </div>
            )}

            {/* Trailers Modal */}
            {showTrailers && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }} onClick={() => setShowTrailers(false)}>
                    <div style={{ backgroundColor: '#1a1a1a', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ color: '#fff', margin: 0 }}>{t('tv.trailers')}</h2>
                            <button onClick={() => setShowTrailers(false)} style={{ background: 'none', border: 'none', color: '999', fontSize: '24px', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <div style={{ padding: '24px', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {videos.filter(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official).map((video, idx) => (
                                    <a key={idx} href={`https://www.youtube.com/watch?v=${video.key}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '12px', textDecoration: 'none', alignItems: 'center' }}>
                                        <span style={{ color: '#fff', fontWeight: 500 }}>{video.name}</span>
                                        <span style={{ color: '#999', fontSize: '14px' }}>{t('common.watch')}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Ratings Modal */}
            {showContentRatings && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }} onClick={() => setShowContentRatings(false)}>
                    <div style={{ backgroundColor: '#1a1a1a', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ color: '#fff', margin: 0 }}>{t('tv.contentRatings')}</h2>
                            <button onClick={() => setShowContentRatings(false)} style={{ background: 'none', border: 'none', color: '999', fontSize: '24px', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <div style={{ padding: '24px', overflowY: 'auto' }}>
                            {contentRatings.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {contentRatings.map((r, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
                                            <span style={{ color: '#fff', fontWeight: 500 }}>
                                                {(() => {
                                                    const translated = t(`common.countries.${r.iso_3166_1}`);
                                                    if (!translated.startsWith('common.countries.')) {
                                                        return translated;
                                                    }
                                                    try {
                                                        return new Intl.DisplayNames(['en'], { type: 'region' }).of(r.iso_3166_1) || r.iso_3166_1;
                                                    } catch {
                                                        return r.iso_3166_1;
                                                    }
                                                })()}
                                            </span>
                                            <span style={{ color: '#999', fontSize: '14px', border: '1px solid #666', padding: '0 4px', borderRadius: '2px' }}>{r.rating}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (<p style={{ color: '#ccc' }}>{t('tv.noContentRatingsFound')}</p>)}
                        </div>
                    </div>
                </div>
            )}
            {/* Season Details Modal */}
            {showSeasonDetails && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }} onClick={() => setShowSeasonDetails(false)}>
                    <div style={{ backgroundColor: '#1a1a1a', borderRadius: '24px', width: '100%', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '76px' }}>
                            <div style={{ flex: 1 }}>
                                {selectedSeasonDetails ? (
                                    <>
                                        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem' }}>
                                            {selectedSeasonDetails.name}
                                        </h2>
                                        <p style={{ color: '#999', margin: '2px 0 0 0', fontSize: '13px' }}>
                                            {selectedSeasonDetails.air_date ? new Date(selectedSeasonDetails.air_date).getFullYear() : ''} • {selectedSeasonDetails.episodes.length} {t('tv.episodes')}
                                        </p>
                                    </>
                                ) : (
                                    <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem' }}>
                                        {t('tv.seasonDetails')}
                                    </h2>
                                )}
                            </div>
                            <button onClick={() => setShowSeasonDetails(false)} style={{ background: 'none', border: 'none', color: '#999', fontSize: '24px', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            {loadingSeason ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <p style={{ color: '#fff' }}>{t('common.loading')}</p>
                                </div>
                            ) : selectedSeasonDetails ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {selectedSeasonDetails.episodes.map(episode => (
                                        <div key={episode.id} style={{ display: 'flex', gap: '20px', borderRadius: '12px', backgroundColor: '#222', padding: '16px', border: '1px solid #333' }}>
                                            <div style={{ minWidth: '227px', width: '227px', height: '127px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                                {episode.still_path ? (
                                                    <img
                                                        src={getImageUrl(episode.still_path, 'w500')}
                                                        alt={episode.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                                        <PlayCircle size={32} />
                                                    </div>
                                                )}
                                                <div style={{ position: 'absolute', bottom: '8px', left: '8px', padding: '2px 6px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: '4px', color: '#000', fontSize: '12px', fontWeight: 500 }}>
                                                    {episode.episode_number}
                                                </div>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '24px' }}>
                                                    <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem', flex: 1 }}>{episode.name}</h3>
                                                    {episodeImdbRatings[episode.id] && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                                            <Star size={14} fill="#fff" color="#fff" />
                                                            <span style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{episodeImdbRatings[episode.id].aggregateRating.toFixed(1)}</span>
                                                            {episodeImdbRatings[episode.id].voteCount > 0 && (
                                                                <span style={{ fontSize: '13px', color: '#666' }}>
                                                                    ({(() => {
                                                                        const count = episodeImdbRatings[episode.id].voteCount;
                                                                        if (count < 1000) {
                                                                            return count.toString();
                                                                        } else if (count < 10000) {
                                                                            const k = count / 1000;
                                                                            return `${k.toFixed(1)}K`;
                                                                        } else if (count < 1000000) {
                                                                            const k = Math.round(count / 1000);
                                                                            return `${k}K`;
                                                                        } else {
                                                                            const m = count / 1000000;
                                                                            return `${m.toFixed(1)}M`;
                                                                        }
                                                                    })()})
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <p style={{ color: '#ccc', fontSize: '14px', lineHeight: 1.5, margin: 0, flex: 1 }}>
                                                    {episode.overview || t('common.noOverview')}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                                    {episode.runtime > 0 && (
                                                        <span style={{ fontSize: '13px', color: '#999' }}>{episode.runtime}m</span>
                                                    )}
                                                    {episode.runtime > 0 && episode.air_date && (
                                                        <span style={{ fontSize: '13px', color: '#666' }}>•</span>
                                                    )}
                                                    {episode.air_date && (
                                                        <span style={{ color: '#999', fontSize: '13px' }}>
                                                            {formatDate(episode.air_date)}
                                                        </span>
                                                    )}
                                                    {!episode.air_date && (
                                                        <span style={{ color: '#999', fontSize: '13px' }}>
                                                            {t('common.tba')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#ccc', textAlign: 'center' }}>{t('tv.failedToLoadSeasonDetails')}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
