import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getMovieLogos, getMovieCertification, getWatchProviders, getMovieKeywords, getMovieCredits, getMovieAlternativeTitles, getMovieReleaseDates, getMovieVideos, getImageUrl, getIMDbRating, type MovieDetails, type MovieLogo, type WatchProviderData, type Keyword, type MovieCredits, type AlternativeTitle, type CountryReleaseDates, type MovieVideo } from '../services/tmdb';
import { X, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLoading } from '../contexts/LoadingContext';
import { getTSPDTRanking } from '../utils/tspdtRanking';
import { getTSPDT21stRanking } from '../utils/tspdt21stRanking';
import { getSightAndSoundRanking } from '../utils/sightAndSoundRanking';
import { getAFIRanking } from '../utils/afiRanking';
import { getCahiersRanking } from '../utils/cahiersRanking';
import { getTMDBLanguage, getTMDBImageLanguage, getCountryCode, getDateLocale } from '../utils/languageMapper';
import { getMovieAwards, type Award } from '../utils/awardsInfo';
import { translateAward } from '../utils/awardTranslations';

export default function MovieDetail() {
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
        const statusKey = status.replace(/([A-Z])/g, '$1').toLowerCase();
        const translation = t(`movie.${statusKey}`);
        return translation !== `movie.${statusKey}` ? translation : status;
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

    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [englishTitle, setEnglishTitle] = useState<string>('');
    const [logo, setLogo] = useState<MovieLogo | null>(null);
    const [certification, setCertification] = useState<string | null>(null);
    const [watchProviders, setWatchProviders] = useState<WatchProviderData | null>(null);
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [credits, setCredits] = useState<MovieCredits>({ cast: [], crew: [] });
    const [showFullCast, setShowFullCast] = useState(false);
    const [isFullCastHovered, setIsFullCastHovered] = useState(false);
    const [alternativeTitles, setAlternativeTitles] = useState<AlternativeTitle[]>([]);
    const [showAlternativeTitles, setShowAlternativeTitles] = useState(false);
    const [showTrailers, setShowTrailers] = useState(false);
    const [releaseDates, setReleaseDates] = useState<CountryReleaseDates[]>([]);
    const [showReleaseDates, setShowReleaseDates] = useState(false);
    const [videos, setVideos] = useState<MovieVideo[]>([]);
    const [isCertHovered, setIsCertHovered] = useState(false);
    const [isDateHovered, setIsDateHovered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imdbRating, setImdbRating] = useState<{ aggregateRating: number; voteCount: number } | null>(null);
    const [tspdtRank, setTspdtRank] = useState<number | null>(null);
    const [tspdt21stRank, setTspdt21stRank] = useState<number | null>(null);
    const [sightAndSoundRank, setSightAndSoundRank] = useState<number | null>(null);
    const [afiRank, setAfiRank] = useState<number | null>(null);
    const [cahiersRank, setCahiersRank] = useState<{ rank: number; year: string } | null>(null);
    const [awards, setAwards] = useState<Award[]>([]);

    useEffect(() => {
        setIsLoading(true);
        return () => setIsLoading(false);
    }, [setIsLoading]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (showFullCast) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showFullCast]);

    useEffect(() => {
        if (showAlternativeTitles) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showAlternativeTitles]);

    useEffect(() => {
        if (showReleaseDates) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showReleaseDates]);

    useEffect(() => {
        if (showTrailers) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showTrailers]);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            setIsLoading(true);
            setError('');

            try {
                const currentLanguage = getTMDBLanguage(i18n.language);
                const imageLanguage = getTMDBImageLanguage(i18n.language);
                const countryCode = getCountryCode(i18n.language);

                const [movieData, logos, cert, providers, kw, creds, altTitles, releases, vids, englishData] = await Promise.all([
                    getMovieDetails(id, currentLanguage),
                    getMovieLogos(id, imageLanguage),
                    getMovieCertification(id, countryCode),
                    getWatchProviders(id, countryCode),
                    getMovieKeywords(id),
                    getMovieCredits(id, currentLanguage),
                    getMovieAlternativeTitles(id),
                    getMovieReleaseDates(id),
                    getMovieVideos(id),
                    getMovieDetails(id, 'en-US')
                ]);

                setMovie(movieData);
                setEnglishTitle(englishData.title);
                const currentLogo = logos.find(l => l.iso_639_1 === imageLanguage) || logos[0] || null;
                setLogo(currentLogo);
                setCertification(cert);
                setWatchProviders(providers);
                setKeywords(kw);
                setCredits(creds);
                setAlternativeTitles(altTitles);
                setReleaseDates(releases);
                setVideos(vids);

                // Get TSPDT ranking
                const tspdtRanking = getTSPDTRanking(movieData.id);
                setTspdtRank(tspdtRanking);

                // Get TSPDT 21st Century ranking
                const tspdt21stRanking = getTSPDT21stRanking(movieData.id);
                setTspdt21stRank(tspdt21stRanking);

                // Get Sight and Sound ranking
                const sightAndSoundRanking = getSightAndSoundRanking(movieData.id);
                setSightAndSoundRank(sightAndSoundRanking);
                
                // Get AFI ranking
                const afiRanking = getAFIRanking(movieData.id);
                setAfiRank(afiRanking);
                
                // Get Cahiers du Cinéma ranking
                const cahiersRanking = getCahiersRanking(movieData.id);
                setCahiersRank(cahiersRanking);

                // Get awards information
                const movieAwards = getMovieAwards(movieData.id);
                setAwards(movieAwards);

                if (movieData.imdb_id) {
                    getIMDbRating(movieData.imdb_id).then(rating => {
                        if (rating) setImdbRating(rating);
                    });
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load movie details.');
            } finally {
                setLoading(false);
                setIsLoading(false);
            }
        };

        fetchData();
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

    if (error || !movie) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', backgroundColor: '#121212' }}>
                <p>{error || t('movie.notFound')}</p>
                <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#333', color: 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    {t('common.goBack')}
                </button>
            </div>
        );
    }

    const backgroundUrl = getImageUrl(movie.backdrop_path || movie.poster_path, 'original');

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
                        alt={movie.title}
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
                        {movie.title}
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
                    {certification && (
                        <>
                            <span
                                onClick={() => setShowReleaseDates(true)}
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
                                {certification}
                            </span>
                            <span>•</span>
                        </>
                    )}
                    <span
                        onClick={() => setShowReleaseDates(true)}
                        onMouseEnter={() => setIsDateHovered(true)}
                        onMouseLeave={() => setIsDateHovered(false)}
                        style={{
                            cursor: 'pointer',
                            textDecoration: isDateHovered ? 'underline' : 'none',
                            textUnderlineOffset: '4px'
                        }}>
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : ''}
                    </span>
                    <span>•</span>
                    <span>{movie.runtime >= 60 ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : `${movie.runtime}m`}</span>
                    <span>•</span>
                    <span>{movie.genres.map(g => t(`common.genreNames.${g.id}`, g.name)).join(', ')}</span>
                </div>

                <div style={{ maxWidth: '800px' }}>
                    {movie.tagline && (
                        <p style={{
                            fontSize: '18px',
                            fontStyle: 'italic',
                            color: 'rgba(255, 255, 255, 0.6)',
                            marginBottom: '24px',
                            fontWeight: 300,
                            lineHeight: 1.4
                        }}>
                            {movie.tagline}
                        </p>
                    )}
                    
                    <h3 style={{
                        fontSize: '1.2rem',
                        marginBottom: '16px',
                        fontWeight: 600,
                        color: '#fff'
                    }}>
                        {t('movie.overview')}
                    </h3>
                    <p style={{
                        fontSize: '1.125rem',
                        lineHeight: 1.6,
                        color: '#ccc',
                        marginBottom: '24px'
                    }}>
                        {movie.overview}
                    </p>
                </div>

                {(movie.vote_average > 0 || imdbRating || tspdtRank || tspdt21stRank || sightAndSoundRank || afiRank) && (
                    <div style={{
                        display: isMobile ? 'flex' : 'grid',
                        gridTemplateColumns: isMobile ? 'auto' : 'auto 1fr',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        gap: isMobile ? '12px' : '32px',
                        marginBottom: isMobile ? '20px' : '24px',
                        flexWrap: 'wrap',
                        flexDirection: isMobile ? 'column' : 'row'
                    }}>
                        {/* Ratings column */}
                        {(movie.vote_average > 0 || imdbRating) && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: isMobile ? '16px' : '24px',
                                flexWrap: 'wrap'
                            }}>
                                {movie.vote_average > 0 && (
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
                                            {movie.vote_average.toFixed(1)}
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
                        
                        {/* Rankings column */}
                        {(() => {
                            // Translate ranking labels
                            const getRankingLabel = (name: string, year?: string) => {
                                const labels: { [key: string]: { [lang: string]: string } } = {
                                    'afi': {
                                        'en': "on AFI's 100 Years...\n100 Movies",
                                        'zh-CN': 'AFI百年百大电影',
                                        'zh-TW': 'AFI百年百大電影',
                                        'zh-HK': 'AFI百年百大電影',
                                        'ja': 'AFI アメリカ映画100年\nベスト100',
                                        'ko': 'AFI 100년 100대 영화',
                                        'es': 'en AFI 100 Años...\n100 Películas',
                                        'fr': 'sur AFI 100 Ans...\n100 Films',
                                        'de': 'auf AFI 100 Jahre...\n100 Filme',
                                        'it': 'su AFI 100 Anni...\n100 Film',
                                        'pt': 'em AFI 100 Anos...\n100 Filmes',
                                        'ru': 'в AFI 100 лет...\n100 фильмов',
                                        'tr': 'AFI 100 Yıl...\n100 Film'
                                    },
                                    'sightandsound': {
                                        'en': 'on The Sight and Sound\nGreatest Films of All Time',
                                        'zh-CN': 'Sight and Sound\n史上最伟大电影',
                                        'zh-TW': 'Sight and Sound\n史上最偉大電影',
                                        'zh-HK': 'Sight and Sound\n史上最偉大電影',
                                        'ja': 'サイト&サウンド\n史上最高の映画',
                                        'ko': 'Sight and Sound\n역대 최고의 영화',
                                        'es': 'en Sight and Sound\nMejores Películas',
                                        'fr': 'sur Sight and Sound\nMeilleurs Films',
                                        'de': 'auf Sight and Sound\nBeste Filme',
                                        'it': 'su Sight and Sound\nMigliori Film',
                                        'pt': 'em Sight and Sound\nMelhores Filmes',
                                        'ru': 'в Sight and Sound\nЛучшие фильмы',
                                        'tr': 'Sight and Sound\nEn İyi Filmler'
                                    },
                                    'tspdt': {
                                        'en': 'on TSPDT 1000\nGreatest Films',
                                        'zh-CN': 'TSPDT 1000\n最伟大电影',
                                        'zh-TW': 'TSPDT 1000\n最偉大電影',
                                        'zh-HK': 'TSPDT 1000\n最偉大電影',
                                        'ja': 'TSPDT 1000\n最高の映画',
                                        'ko': 'TSPDT 1000\n최고의 영화',
                                        'es': 'en TSPDT 1000\nMejores Películas',
                                        'fr': 'sur TSPDT 1000\nMeilleurs Films',
                                        'de': 'auf TSPDT 1000\nBeste Filme',
                                        'it': 'su TSPDT 1000\nMigliori Film',
                                        'pt': 'em TSPDT 1000\nMelhores Filmes',
                                        'ru': 'в TSPDT 1000\nЛучших фильмов',
                                        'tr': 'TSPDT 1000\nEn İyi Film'
                                    },
                                    'tspdt21st': {
                                        'en': "on TSPDT 21st Century's\n1000 Most Acclaimed Films",
                                        'zh-CN': 'TSPDT 21世纪\n1000部最受好评电影',
                                        'zh-TW': 'TSPDT 21世紀\n1000部最受好評電影',
                                        'zh-HK': 'TSPDT 21世紀\n1000部最受好評電影',
                                        'ja': 'TSPDT 21世紀\n最も評価された1000本',
                                        'ko': 'TSPDT 21세기\n가장 호평받은 1000편',
                                        'es': 'en TSPDT Siglo XXI\n1000 Películas Aclamadas',
                                        'fr': 'sur TSPDT 21e Siècle\n1000 Films Acclamés',
                                        'de': 'auf TSPDT 21. Jahrhundert\n1000 Gefeierte Filme',
                                        'it': 'su TSPDT XXI Secolo\n1000 Film Acclamati',
                                        'pt': 'em TSPDT Século XXI\n1000 Filmes Aclamados',
                                        'ru': 'в TSPDT XXI век\n1000 признанных фильмов',
                                        'tr': 'TSPDT 21. Yüzyıl\n1000 Beğenilen Film'
                                    },
                                    'cahiers': {
                                        'en': `on Cahiers du Cinéma\n${year} Top 10`,
                                        'zh-CN': year?.endsWith('s') ? `电影手册\n${year.slice(0, -1)}年代十佳` : `电影手册\n${year}年十佳`,
                                        'zh-TW': year?.endsWith('s') ? `電影筆記\n${year.slice(0, -1)}年代十佳` : `電影筆記\n${year}年十佳`,
                                        'zh-HK': year?.endsWith('s') ? `電影筆記\n${year.slice(0, -1)}年代十佳` : `電影筆記\n${year}年十佳`,
                                        'ja': year?.endsWith('s') ? `カイエ・デュ・シネマ\n${year.slice(0, -1)}年代トップ10` : `カイエ・デュ・シネマ\n${year}年トップ10`,
                                        'ko': year?.endsWith('s') ? `카이에 뒤 시네마\n${year.slice(0, -1)}년대 톱 10` : `카이에 뒤 시네마\n${year}년 톱 10`,
                                        'es': `en Cahiers du Cinéma\nTop 10 de ${year}`,
                                        'fr': `sur Cahiers du Cinéma\nTop 10 ${year}`,
                                        'de': `auf Cahiers du Cinéma\nTop 10 ${year}`,
                                        'it': `su Cahiers du Cinéma\nTop 10 ${year}`,
                                        'pt': `em Cahiers du Cinéma\nTop 10 de ${year}`,
                                        'ru': year?.endsWith('s') ? `в Cahiers du Cinéma\nТоп-10 ${year.slice(0, -1)}-х` : `в Cahiers du Cinéma\nТоп-10 ${year}`,
                                        'tr': `Cahiers du Cinéma\n${year} En İyi 10`
                                    }
                                };
                                
                                const langMap: { [key: string]: string } = {
                                    'zh-CN': 'zh-CN',
                                    'zh-TW': 'zh-TW',
                                    'zh-HK': 'zh-HK',
                                    'en-US': 'en',
                                    'en': 'en',
                                    'ja': 'ja',
                                    'ja-JP': 'ja',
                                    'ko': 'ko',
                                    'ko-KR': 'ko',
                                    'es': 'es',
                                    'es-ES': 'es',
                                    'es-MX': 'es',
                                    'fr': 'fr',
                                    'fr-FR': 'fr',
                                    'de': 'de',
                                    'de-DE': 'de',
                                    'it': 'it',
                                    'it-IT': 'it',
                                    'pt': 'pt',
                                    'pt-PT': 'pt',
                                    'pt-BR': 'pt',
                                    'ru': 'ru',
                                    'ru-RU': 'ru',
                                    'tr': 'tr',
                                    'tr-TR': 'tr'
                                };
                                
                                const lang = langMap[i18n.language] || 'en';
                                return labels[name]?.[lang] || labels[name]?.['en'] || '';
                            };
                            
                            // Create array of rankings and sort by rank number
                            const rankings = [];
                            if (afiRank) {
                                rankings.push({ rank: afiRank, name: 'afi', label: getRankingLabel('afi') });
                            }
                            if (sightAndSoundRank) {
                                rankings.push({ rank: sightAndSoundRank, name: 'sightandsound', label: getRankingLabel('sightandsound') });
                            }
                            if (tspdtRank) {
                                rankings.push({ rank: tspdtRank, name: 'tspdt', label: getRankingLabel('tspdt') });
                            }
                            // Only show TSPDT 21st Century if not in TSPDT 1000
                            if (tspdt21stRank && !tspdtRank) {
                                rankings.push({ rank: tspdt21stRank, name: 'tspdt21st', label: getRankingLabel('tspdt21st') });
                            }
                            if (cahiersRank) {
                                rankings.push({ rank: cahiersRank.rank, name: 'cahiers', label: getRankingLabel('cahiers', cahiersRank.year) });
                            }
                            
                            // Sort by rank number (ascending)
                            rankings.sort((a, b) => a.rank - b.rank);
                            
                            if (rankings.length === 0) return null;
                            
                            return isMobile ? (
                                // Mobile: each ranking on separate line
                                rankings.map((ranking) => (
                                    <div key={ranking.name} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            color: '#fff',
                                            flexShrink: 0
                                        }}>
                                            #{ranking.rank}
                                        </span>
                                        <span style={{
                                            fontSize: '13px',
                                            color: '#fff',
                                            lineHeight: 1.3
                                        }}>
                                            {ranking.label.replace(/\n/g, ' ')}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                // Desktop: all rankings in one row
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '24px',
                                    flexWrap: 'wrap'
                                }}>
                                    {rankings.map((ranking) => (
                                        <div key={ranking.name} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{
                                                fontSize: '18px',
                                                fontWeight: 600,
                                                color: '#fff'
                                            }}>
                                                #{ranking.rank}
                                            </span>
                                            <span style={{
                                                fontSize: '14px',
                                                color: '#fff',
                                                lineHeight: 1.3,
                                                display: 'inline-block',
                                                whiteSpace: 'pre-line'
                                            }}>
                                                {ranking.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Awards */}
                {awards.length > 0 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: isMobile ? '16px' : '20px',
                        alignItems: 'flex-start',
                        marginBottom: isMobile ? '20px' : '24px'
                    }}>
                        {(() => {
                            const groupedAwards: { [key: string]: string[] } = {};
                            awards.forEach(award => {
                                if (!groupedAwards[award.festival]) {
                                    groupedAwards[award.festival] = [];
                                }
                                groupedAwards[award.festival].push(award.award);
                            });

                            return Object.entries(groupedAwards).map(([festival, awardsList], index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    <span style={{
                                        fontSize: isMobile ? '14px' : '16px',
                                        color: '#999',
                                        fontWeight: 600,
                                        textAlign: 'left'
                                    }}>
                                        {festival === 'Oscar' && t('movie.festivalOscar')}
                                        {festival === 'Cannes' && t('movie.festivalCannes')}
                                        {festival === 'Venice' && t('movie.festivalVenice')}
                                        {festival === 'Berlinale' && t('movie.festivalBerlinale')}
                                    </span>
                                    <span style={{
                                        fontSize: isMobile ? '14px' : '16px',
                                        color: '#fff',
                                        fontWeight: 600,
                                        textAlign: 'left',
                                        lineHeight: 1.4,
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {awardsList.map(award => translateAward(award, i18n.language)).join('   •   ')}
                                    </span>
                                </div>
                            ));
                        })()}
                    </div>
                )}

                {/* External Links */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '32px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {movie.homepage && (
                        <a
                            href={movie.homepage}
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
                                    {t('movie.trailers')}
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
                            href={`https://www.douban.com/search?cat=1002&q=${encodeURIComponent(movie.original_title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            {t('common.douban')}
                        </a>
                    )}
                    {movie.imdb_id && (
                        <a
                            href={`https://www.imdb.com/title/${movie.imdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            {t('common.imdb')}
                        </a>
                    )}
                    {movie.imdb_id && (
                        <a
                            href={`https://www.imdb.com/title/${movie.imdb_id}/parentalguide`}
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
                        href={`https://www.themoviedb.org/movie/${movie.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {t('common.tmdb')}
                    </a>
                    {movie.imdb_id && (
                        <a
                            href={`https://trakt.tv/movies/${movie.imdb_id}`}
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
                        href={`https://letterboxd.com/tmdb/${movie.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {t('common.letterboxd')}
                    </a>
                    <a
                        href={`https://www.metacritic.com/search/${encodeURIComponent(englishTitle || movie.original_title)}/?page=1&category=2`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {t('common.metacritic')}
                    </a>
                    <a
                        href={`https://www.rottentomatoes.com/search?search=${encodeURIComponent(englishTitle || movie.original_title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {t('common.rottentomatoes')}
                    </a>
                    <a
                        href={`https://www.justwatch.com/us/search?q=${encodeURIComponent(englishTitle || movie.original_title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {t('movie.justWatch')}
                    </a>
                </div>



                <div style={{ maxWidth: '800px' }}>
                    {/* Director */}
                    {credits.crew.filter(c => c.job === 'Director').length > 0 && (
                        <div style={{ marginTop: '32px' }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                marginBottom: '16px',
                                fontWeight: 600,
                                color: '#fff'
                            }}>
                                {t('movie.director')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {credits.crew.filter(c => c.job === 'Director').map(c => (
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
                                        <span onClick={() => navigate(`/person/${c.id}`)} style={{ fontSize: isMobile ? '16px' : '18px', color: '#ccc', cursor: 'pointer', textUnderlineOffset: '4px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{c.name}</span>
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
                                {t('movie.cast')}
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
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                                            <span onClick={() => navigate(`/person/${c.id}`)} style={{ fontSize: isMobile ? '16px' : '18px', color: '#ccc', cursor: 'pointer', textUnderlineOffset: '4px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{c.name}</span>
                                            <span style={{ fontSize: isMobile ? '14px' : '16px', color: '#666' }}>{t('common.as')}</span>
                                            <span style={{ fontSize: isMobile ? '16px' : '18px', color: '#999' }}>{c.character}</span>
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
                                {t('movie.fullCastAndCrew')}
                            </button>
                        </div>
                    )}

                    {watchProviders && (watchProviders.flatrate || watchProviders.rent || watchProviders.buy) && (
                        <div style={{ marginTop: '32px' }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                marginBottom: '24px',
                                fontWeight: 600,
                                color: '#fff'
                            }}>
                                {t('movie.whereToWatch')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {watchProviders.flatrate && watchProviders.flatrate.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        <span style={{ fontSize: '14px', color: '#999', minWidth: '60px', paddingTop: '2px' }}>{t('common.stream')}</span>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {watchProviders.flatrate.map(p => (
                                                <span key={p.provider_id} style={{
                                                    fontSize: '13px',
                                                    color: '#ccc',
                                                    border: '1px solid rgba(255,255,255,0.8)',
                                                    padding: '2px 5px',
                                                    borderRadius: '6px'
                                                }}>
                                                    {p.provider_name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {watchProviders.rent && watchProviders.rent.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        <span style={{ fontSize: '14px', color: '#999', minWidth: '60px', paddingTop: '2px' }}>{t('common.rent')}</span>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {watchProviders.rent.map(p => (
                                                <span key={p.provider_id} style={{
                                                    fontSize: '13px',
                                                    color: '#ccc',
                                                    border: '1px solid rgba(255,255,255,0.8)',
                                                    padding: '2px 5px',
                                                    borderRadius: '6px'
                                                }}>
                                                    {p.provider_name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {watchProviders.buy && watchProviders.buy.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        <span style={{ fontSize: '14px', color: '#999', minWidth: '60px', paddingTop: '2px' }}>{t('common.buy')}</span>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {watchProviders.buy.map(p => (
                                                <span key={p.provider_id} style={{
                                                    fontSize: '13px',
                                                    color: '#ccc',
                                                    border: '1px solid rgba(255,255,255,0.8)',
                                                    padding: '2px 5px',
                                                    borderRadius: '6px'
                                                }}>
                                                    {p.provider_name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p style={{ fontSize: '14px', color: '#666', marginTop: '12px' }}>
                                {t('common.providedBy')} JustWatch
                            </p>
                        </div>
                    )}

                    {/* Movie Info */}
                    {(() => {
                        const infoItems = [
                            { label: t('movie.status'), value: translateStatus(movie.status) },
                            { label: t('common.originalLanguage'), value: translateLanguageSafe(movie.original_language) },
                            { label: t('common.spokenLanguages'), value: movie.spoken_languages.map(l => translateLanguageSafe(l.iso_639_1)).join(', ') || t('common.unknown') },
                            movie.budget > 0 ? { label: t('movie.budget'), value: `$${movie.budget.toLocaleString()}` } : null,
                            movie.revenue > 0 ? { label: t('movie.revenue'), value: `$${movie.revenue.toLocaleString()}` } : null,
                            { label: t('common.productionCountries'), value: movie.production_countries.map(c => translateCountrySafe(c.iso_3166_1)).join(', ') || t('common.unknown') }
                        ].filter((item): item is { label: string; value: string } => item !== null && item.value !== undefined);

                        const gridCols = isMobile ? 'auto auto' : (infoItems.length <= 4 ? 'auto auto' : 'auto auto auto');

                        return (
                            <div style={{
                                marginTop: isMobile ? '20px' : '24px',
                                display: 'grid',
                                gridTemplateColumns: gridCols,
                                gap: isMobile ? '10px 40px' : '10px 80px',
                                justifyContent: 'start'
                            }}>
                                {infoItems.map((item, index) => (
                                    <div key={index}>
                                        <h3 style={{
                                            fontSize: isMobile ? '1rem' : '1.2rem',
                                            marginBottom: '8px',
                                            fontWeight: 600,
                                            color: '#fff'
                                        }}>
                                            {item.label}
                                        </h3>
                                        <p style={{ fontSize: isMobile ? '13px' : '14px', color: '#ccc' }}>
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}

                    {/* Production Companies */}
                    {movie.production_companies.length > 0 && (
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
                                {movie.production_companies.map(c => (
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
                            <h3 style={{
                                fontSize: '1.2rem',
                                marginBottom: '24px',
                                fontWeight: 600,
                                color: '#fff'
                            }}>
                                {t('movie.keywords')}
                            </h3>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {keywords.map(k => (
                                    <span key={k.id} style={{
                                        fontSize: '13px',
                                        color: '#ccc',
                                        border: '1px solid rgba(255,255,255,0.8)',
                                        padding: '2px 5px',
                                        borderRadius: '6px'
                                    }}>
                                        {k.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full Cast & Crew Modal */}
            {
                showFullCast && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: isMobile ? '20px' : '40px'
                    }} onClick={() => setShowFullCast(false)}>
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: isMobile ? '16px' : '24px',
                            width: '100%',
                            maxWidth: '800px',
                            height: isMobile ? '85vh' : '90vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{
                                padding: isMobile ? '16px' : '24px',
                                borderBottom: '1px solid #333',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h2 style={{ color: '#fff', margin: 0, fontSize: isMobile ? '1.2rem' : '1.5rem' }}>{t('movie.fullCastAndCrew')}</h2>
                                <button
                                    onClick={() => setShowFullCast(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#999',
                                        fontSize: isMobile ? '20px' : '24px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <X size={isMobile ? 20 : 24} />
                                </button>
                            </div>
                            <div style={{
                                padding: isMobile ? '16px' : '24px',
                                overflowY: 'auto',
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                gap: isMobile ? '24px' : '40px'
                            }}>
                                {/* Full Cast Column */}
                                <div>
                                    <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1.2rem' }}>{t('movie.cast')}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {credits.cast.map(c => (
                                            <div key={c.id} onClick={() => navigate(`/person/${c.id}`)} style={{ cursor: 'pointer' }}>
                                                <div style={{ color: '#ccc', fontWeight: 500, textUnderlineOffset: '4px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{c.name}</div>
                                                <div style={{ color: '#666', fontSize: '14px' }}>{c.character}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Full Crew Column */}
                                <div>
                                    <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1.2rem' }}>{t('movie.crew')}</h3>
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
                )
            }
            {/* Alternative Titles Modal */}
            {
                showAlternativeTitles && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '40px'
                    }} onClick={() => setShowAlternativeTitles(false)}>
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{
                                padding: '24px',
                                borderBottom: '1px solid #333',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h2 style={{ color: '#fff', margin: 0 }}>{t('movie.alternativeTitles')}</h2>
                                <button
                                    onClick={() => setShowAlternativeTitles(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#999',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div style={{
                                padding: '24px',
                                overflowY: 'auto'
                            }}>
                                {alternativeTitles.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {/* Original Title */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
                                            <span style={{ color: '#fff', fontWeight: 500 }}>{movie?.original_title}</span>
                                            <span style={{ color: '#999', fontSize: '14px' }}>
                                                {movie?.original_language && (t(`common.languages.${movie.original_language}`) || movie.original_language)} ({t('movie.original')})
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
                                ) : (
                                    <p style={{ color: '#ccc' }}>{t('movie.noAlternativeTitlesFound')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Release Dates Modal */}
            {
                showReleaseDates && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '40px'
                    }} onClick={() => setShowReleaseDates(false)}>
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '800px',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{
                                padding: '24px',
                                borderBottom: '1px solid #333',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h2 style={{ color: '#fff', margin: 0 }}>{t('movie.releaseInformation')}</h2>
                                <button
                                    onClick={() => setShowReleaseDates(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#999',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div style={{
                                padding: '24px',
                                overflowY: 'auto'
                            }}>
                                {/* Primary Release Date */}
                                {movie.release_date && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '8px', fontWeight: 600 }}>
                                            {t('movie.releaseDate')}
                                        </h4>
                                        <div style={{ fontSize: '18px', color: '#e0e0e0', fontWeight: 500 }}>
                                            {formatDate(movie.release_date)}
                                        </div>
                                    </div>
                                )}
                                
                                {releaseDates.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                                        {releaseDates.map((country, idx) => (
                                            <div key={idx} style={{ marginBottom: '16px' }}>
                                                <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
                                                    {(() => {
                                                        const translated = t(`common.countries.${country.iso_3166_1}`);
                                                        if (!translated.startsWith('common.countries.')) {
                                                            return translated;
                                                        }
                                                        try {
                                                            return new Intl.DisplayNames(['en'], { type: 'region' }).of(country.iso_3166_1) || country.iso_3166_1;
                                                        } catch {
                                                            return country.iso_3166_1;
                                                        }
                                                    })()}
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {country.release_dates.map((date, dIdx) => (
                                                        <div key={dIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                            <span style={{ color: '#ccc' }}>{formatDate(date.release_date)}</span>
                                                            <span style={{ color: '#999' }}>
                                                                {date.certification ? <span style={{ border: '1px solid #666', padding: '0 4px', borderRadius: '2px', marginRight: '6px' }}>{date.certification}</span> : ''}
                                                                {date.type === 1 ? t('movie.releaseTypePremiere') :
                                                                    date.type === 2 ? t('movie.releaseTypeTheatricalLimited') :
                                                                        date.type === 3 ? t('movie.releaseTypeTheatrical') :
                                                                            date.type === 4 ? t('movie.releaseTypeDigital') :
                                                                                date.type === 5 ? t('movie.releaseTypePhysical') :
                                                                                    date.type === 6 ? t('movie.releaseTypeTV') : ''}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#ccc' }}>{t('movie.noReleaseDatesFound')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Trailers Modal */}
            {
                showTrailers && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '40px'
                    }} onClick={() => setShowTrailers(false)}>
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{
                                padding: '24px',
                                borderBottom: '1px solid #333',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <h2 style={{ color: '#fff', margin: 0 }}>{t('movie.trailers')}</h2>
                                <button
                                    onClick={() => setShowTrailers(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#999',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div style={{
                                padding: '24px',
                                overflowY: 'auto'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {videos.filter(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official).map((video, idx) => (
                                        <a
                                            key={idx}
                                            href={`https://www.youtube.com/watch?v=${video.key}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '12px', textDecoration: 'none', alignItems: 'center' }}
                                        >
                                            <span style={{ color: '#fff', fontWeight: 500 }}>{video.name}</span>
                                            <span style={{ color: '#999', fontSize: '14px' }}>{t('common.watch')}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
