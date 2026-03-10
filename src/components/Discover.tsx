'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function Discover() {
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const renderSectionItems = (items: { label: string; path: string }[]) => (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            {items.map((item, itemIndex) => (
                <Link
                    key={itemIndex}
                    href={item.path}
                    className="nav-button"
                    style={{
                        backgroundColor: '#2A2A2A',
                        border: 'none',
                        borderRadius: '50px',
                        padding: '12px 20px',
                        color: '#fff',
                        fontSize: '15px',
                        fontFamily: 'Inter, sans-serif',
                        textAlign: 'start',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        fontWeight: 500,
                        textDecoration: 'none',
                        minHeight: 0
                    }}
                >
                    {item.label}
                </Link>
            ))}
        </div>
    );

    const sections = mounted ? [
        {
            title: t('common.explore', 'Explore'),
            items: [
                { label: t('common.mediaFilter', 'Media Filter'), path: '/discovery' },
            ]
        },
        {
            title: t('common.trending', 'Trending'),
            items: [
                { label: t('common.all', 'All'), path: '/trending/all' },
                { label: t('common.movies', 'Movies'), path: '/trending/movie' },
                { label: t('common.tvShows', 'TV Shows'), path: '/trending/tv' },
                { label: t('common.people', 'People'), path: '/trending/person' },
            ]
        },
        {
            title: t('common.movies', 'Movies'),
            items: [
                { label: t('common.nowPlaying', 'Now Playing'), path: '/movies/now-playing' },
                { label: t('common.popular', 'Popular'), path: '/movies/popular' },
                { label: t('common.topRated', 'Top Rated'), path: '/movies/top-rated' },
                { label: t('common.upcoming', 'Upcoming'), path: '/movies/upcoming' },
            ]
        },
        {
            title: t('common.tvShows', 'TV Shows'),
            items: [
                { label: t('common.airingToday', 'Airing Today'), path: '/tv-shows/airing-today' },
                { label: t('common.onTheAir', 'On The Air'), path: '/tv-shows/on-the-air' },
                { label: t('common.popular', 'Popular'), path: '/tv-shows/popular' },
                { label: t('common.topRated', 'Top Rated'), path: '/tv-shows/top-rated' },
            ]
        },
        {
            title: t('common.people', 'People'),
            items: [
                { label: t('common.popular', 'Popular'), path: '/person/popular' },
            ]
        }
    ] : [
        {
            title: 'Explore',
            items: [
                { label: 'Media Filter', path: '/discovery' },
            ]
        },
        {
            title: 'Trending',
            items: [
                { label: 'All', path: '/trending/all' },
                { label: 'Movies', path: '/trending/movie' },
                { label: 'TV Shows', path: '/trending/tv' },
                { label: 'People', path: '/trending/person' },
            ]
        },
        {
            title: 'Movies',
            items: [
                { label: 'Now Playing', path: '/movies/now-playing' },
                { label: 'Popular', path: '/movies/popular' },
                { label: 'Top Rated', path: '/movies/top-rated' },
                { label: 'Upcoming', path: '/movies/upcoming' },
            ]
        },
        {
            title: 'TV Shows',
            items: [
                { label: 'Airing Today', path: '/tv-shows/airing-today' },
                { label: 'On The Air', path: '/tv-shows/on-the-air' },
                { label: 'Popular', path: '/tv-shows/popular' },
                { label: 'Top Rated', path: '/tv-shows/top-rated' },
            ]
        },
        {
            title: 'People',
            items: [
                { label: 'Popular', path: '/person/popular' },
            ]
        }
    ];

    return (
        <>
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#121212',
                color: '#fff',
                padding: isMobile ? '80px 16px 40px' : '100px 40px 40px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
            alignItems: 'center',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '800px',
            }}>
                <h1 style={{
                    fontSize: isMobile ? '28px' : '36px',
                    fontWeight: 'bold',
                    marginBottom: '40px',
                    textAlign: 'center'
                }}>
                    {mounted ? t('common.discover', 'Discover') : 'Discover'}
                </h1>

                {isMobile ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '30px'
                    }}>
                        {sections.map((section, index) => (
                            <div key={index} style={{
                                backgroundColor: '#1E1E1E',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '20px',
                                    color: '#E50914'
                                }}>
                                    <h2 style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        margin: 0,
                                        color: '#fff'
                                    }}>
                                        {section.title}
                                    </h2>
                                </div>
                                
                                {renderSectionItems(section.items)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        gap: '30px',
                        alignItems: 'start'
                    }}>
                        {/* Left Column */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            {sections.filter((_, i) => i % 2 === 0).map((section, index) => (
                                <div key={index} style={{
                                    backgroundColor: '#1E1E1E',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '20px',
                                        color: '#E50914'
                                    }}>
                                        <h2 style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            margin: 0,
                                            color: '#fff'
                                        }}>
                                            {section.title}
                                        </h2>
                                    </div>
                                    
                                    {renderSectionItems(section.items)}
                                </div>
                            ))}
                        </div>

                        {/* Right Column */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            {sections.filter((_, i) => i % 2 !== 0).map((section, index) => (
                                <div key={index} style={{
                                    backgroundColor: '#1E1E1E',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '20px',
                                        color: '#E50914'
                                    }}>
                                        <h2 style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            margin: 0,
                                            color: '#fff'
                                        }}>
                                            {section.title}
                                        </h2>
                                    </div>
                                    
                                    {renderSectionItems(section.items)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}
