import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getMovieLogos, getMovieCertification, getWatchProviders, getMovieKeywords, getMovieCredits, getMovieAlternativeTitles, getMovieReleaseDates, getMovieVideos, getImageUrl, type MovieDetails, type MovieLogo, type WatchProviderData, type Keyword, type MovieCredits, type AlternativeTitle, type CountryReleaseDates, type MovieVideo } from '../services/tmdb';
import { X, User } from 'lucide-react';

export default function MovieDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
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

        setLoading(true);
        setError('');

        Promise.all([
            getMovieDetails(id),
            getMovieLogos(id),
            getMovieCertification(id),
            getWatchProviders(id),
            getMovieKeywords(id),
            getMovieCredits(id),
            getMovieAlternativeTitles(id),
            getMovieReleaseDates(id),
            getMovieVideos(id)
        ])
            .then(([movieData, logos, cert, providers, kw, creds, altTitles, releases, vids]) => {
                setMovie(movieData);
                // Prefer English logo, otherwise first available
                const engLogo = logos.find(l => l.iso_639_1 === 'en') || logos[0] || null;
                setLogo(engLogo);
                setCertification(cert);
                setWatchProviders(providers);
                setKeywords(kw);
                setCredits(creds);
                setAlternativeTitles(altTitles);
                setReleaseDates(releases);
                setVideos(vids);
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to load movie details. Check ID or API Key.');
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', backgroundColor: '#121212' }}>
                Loading...
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', backgroundColor: '#121212' }}>
                <p>{error || 'Movie not found'}</p>
                <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#333', color: 'white', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Go Back
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
                height: '80vh', // Occupy top portion of viewport
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

                {/* Gradient Fade to Background Color */}
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
                padding: '0 60px 80px 80px',
                marginTop: '-120px',
                position: 'relative',
                zIndex: 10
            }}>
                {logo ? (
                    <img
                        onClick={() => setShowAlternativeTitles(true)}
                        src={getImageUrl(logo.file_path, 'original')}
                        alt={movie.title}
                        style={{
                            maxHeight: '120px',
                            maxWidth: '400px',
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
                            fontSize: '4rem',
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
                    gap: '12px',
                    color: '#e0e0e0',
                    marginBottom: '32px',
                    fontSize: '18px',
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
                                    textDecoration: isCertHovered ? 'underline' : 'none',
                                    textUnderlineOffset: '4px'
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
                        {movie.release_date}
                    </span>
                    <span>•</span>
                    <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                    <span>•</span>
                    <span>{movie.genres.map(g => g.name).join(', ')}</span>
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
                        Overview
                    </h3>
                    <p style={{
                        fontSize: '1.125rem',
                        lineHeight: 1.6,
                        color: '#ccc',
                    }}>
                        {movie.overview}
                    </p>

                </div>
                {/* External Links */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {movie.homepage && (
                        <a
                            href={movie.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            Homepage
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
                                    Trailers
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
                                    Trailer
                                </a>
                            );
                        }
                        return null;
                    })()}
                    {movie.imdb_id && (
                        <a
                            href={`https://www.imdb.com/title/${movie.imdb_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            IMDb
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
                        TMDB
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
                            Trakt
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
                        Letterboxd
                    </a>
                    <a
                        href={`https://www.metacritic.com/search/${encodeURIComponent(movie.title)}/?page=1&category=2`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        Metacritic
                    </a>
                    <a
                        href={`https://www.douban.com/search?cat=1002&q=${encodeURIComponent(movie.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        Douban
                    </a>
                    <a
                        href={`https://www.rottentomatoes.com/search?search=${encodeURIComponent(movie.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        Rotten Tomatoes
                    </a>
                    <a
                        href={`https://www.justwatch.com/us/search?q=${encodeURIComponent(movie.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#fff', textDecoration: 'none', fontSize: '16px', textUnderlineOffset: '5px' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        JustWatch
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
                                Director
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {credits.crew.filter(c => c.job === 'Director').map(c => (
                                    <div key={c.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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
                                        <span onClick={() => navigate(`/person/${c.id}`)} style={{ fontSize: '18px', color: '#ccc', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{c.name}</span>
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
                                Cast
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {credits.cast.slice(0, 10).map(c => (
                                    <div key={c.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                                            <span onClick={() => navigate(`/person/${c.id}`)} style={{ fontSize: '18px', color: '#ccc', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{c.name}</span>
                                            <span style={{ fontSize: '16px', color: '#666' }}>as</span>
                                            <span style={{ fontSize: '18px', color: '#999' }}>{c.character}</span>
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
                                Full Cast & Crew
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
                                Where to Watch
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {watchProviders.flatrate && watchProviders.flatrate.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        <span style={{ fontSize: '14px', color: '#999', minWidth: '50px', paddingTop: '2px' }}>Stream</span>
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
                                        <span style={{ fontSize: '14px', color: '#999', minWidth: '50px', paddingTop: '2px' }}>Rent</span>
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
                                        <span style={{ fontSize: '14px', color: '#999', minWidth: '50px', paddingTop: '2px' }}>Buy</span>
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
                                Provided by JustWatch
                            </p>
                        </div>
                    )}

                    {/* Movie Info */}
                    {(() => {
                        const infoItems = [
                            { label: 'Status', value: movie.status },
                            { label: 'Original Language', value: new Intl.DisplayNames(['en'], { type: 'language' }).of(movie.original_language) },
                            { label: 'Spoken Languages', value: movie.spoken_languages.map(l => l.name).join(', ') },
                            movie.budget > 0 ? { label: 'Budget', value: `$${movie.budget.toLocaleString()}` } : null,
                            movie.revenue > 0 ? { label: 'Revenue', value: `$${movie.revenue.toLocaleString()}` } : null,
                            { label: 'Production Countries', value: movie.production_countries.map(c => c.name).join(', ') }
                        ].filter((item): item is { label: string; value: string | undefined } => Boolean(item));

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
                                        <h3 style={{
                                            fontSize: '1.2rem',
                                            marginBottom: '8px',
                                            fontWeight: 600,
                                            color: '#fff'
                                        }}>
                                            {item.label}
                                        </h3>
                                        <p style={{ fontSize: '14px', color: '#ccc' }}>
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
                                Production Companies
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {movie.production_companies.map(c => (
                                    <span key={c.id} style={{ fontSize: '14px', color: '#ccc' }}>
                                        {c.name} {c.origin_country ? `(${c.origin_country})` : ''}
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
                                Keywords
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
                        padding: '40px'
                    }} onClick={() => setShowFullCast(false)}>
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '800px',
                            height: '90vh',
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
                                <h2 style={{ color: '#fff', margin: 0 }}>Full Cast & Crew</h2>
                                <button
                                    onClick={() => setShowFullCast(false)}
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
                                overflowY: 'auto',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '40px'
                            }}>
                                {/* Full Cast Column */}
                                <div>
                                    <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1.2rem' }}>Cast</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {credits.cast.map(c => (
                                            <div key={c.id}>
                                                <div style={{ color: '#ccc', fontWeight: 500 }}>{c.name}</div>
                                                <div style={{ color: '#666', fontSize: '14px' }}>{c.character}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Full Crew Column */}
                                <div>
                                    <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1.2rem' }}>Crew</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {credits.crew.map((c, idx) => (
                                            <div key={`${c.id}-${idx}`}>
                                                <div style={{ color: '#ccc', fontWeight: 500 }}>{c.name}</div>
                                                <div style={{ color: '#666', fontSize: '14px' }}>{c.job} ({c.department})</div>
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
                                <h2 style={{ color: '#fff', margin: 0 }}>Alternative Titles</h2>
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
                                                {movie?.original_language && new Intl.DisplayNames(['en'], { type: 'language' }).of(movie.original_language)} (Original)
                                            </span>
                                        </div>
                                        {alternativeTitles.map((t, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
                                                <span style={{ color: '#fff', fontWeight: 500 }}>{t.title}</span>
                                                <span style={{ color: '#999', fontSize: '14px' }}>{new Intl.DisplayNames(['en'], { type: 'region' }).of(t.iso_3166_1)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#ccc' }}>No alternative titles found.</p>
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
                                <h2 style={{ color: '#fff', margin: 0 }}>Release Information</h2>
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
                                {releaseDates.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                                        {releaseDates.map((country, idx) => (
                                            <div key={idx} style={{ marginBottom: '16px' }}>
                                                <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
                                                    {new Intl.DisplayNames(['en'], { type: 'region' }).of(country.iso_3166_1)}
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {country.release_dates.map((date, dIdx) => (
                                                        <div key={dIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                            <span style={{ color: '#ccc' }}>{new Date(date.release_date).toLocaleDateString()}</span>
                                                            <span style={{ color: '#999' }}>
                                                                {date.certification ? <span style={{ border: '1px solid #666', padding: '0 4px', borderRadius: '2px', marginRight: '6px' }}>{date.certification}</span> : ''}
                                                                {/* Map type to string if desired, or simpler display */}
                                                                {/* Type 1: Premiere, 2: Theatrical (Ltd), 3: Theatrical, 4: Digital, 5: Physical, 6: TV */}
                                                                {date.type === 1 ? 'Premiere' :
                                                                    date.type === 2 ? 'Theatrical (Ltd)' :
                                                                        date.type === 3 ? 'Theatrical' :
                                                                            date.type === 4 ? 'Digital' :
                                                                                date.type === 5 ? 'Physical' :
                                                                                    date.type === 6 ? 'TV' : ''}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#ccc' }}>No release dates found.</p>
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
                                <h2 style={{ color: '#fff', margin: 0 }}>Trailers</h2>
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
                                            <span style={{ color: '#999', fontSize: '14px' }}>Watch</span>
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
