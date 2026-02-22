import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { getPopularPeople, getImageUrl, type SearchResult } from '../services/tmdb';
import { getTMDBLanguage } from '../utils/languageMapper';

export default function PersonList() {
    const { t, i18n } = useTranslation();
    
    const [items, setItems] = useState<SearchResult[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    
    const observerTarget = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<SearchResult[]>([]);

    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    const loadData = useCallback(async (pageNum: number, isInitial: boolean) => {
        const currentItems = isInitial ? [] : itemsRef.current;
        const limit = 100;

        if (!isInitial && currentItems.length >= limit) {
            setHasMore(false);
            return;
        }

        if (isInitial) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const currentLanguage = getTMDBLanguage(i18n.language);
            const data = await getPopularPeople(currentLanguage, pageNum);
            
            if (isInitial) {
                const limited = data.results.slice(0, limit);
                setItems(limited);
                setHasMore(pageNum < data.total_pages && limited.length < limit);
            } else {
                const existingIds = new Set(currentItems.map(p => p.id));
                const newItems = data.results.filter(item => !existingIds.has(item.id));
                const remaining = limit - currentItems.length;
                const toAdd = newItems.slice(0, remaining);
                const finalCount = currentItems.length + toAdd.length;

                setItems(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newItems = data.results.filter(item => !existingIds.has(item.id));
                    const remaining = limit - prev.length;
                    if (remaining <= 0) return prev;
                    
                    const toAdd = newItems.slice(0, remaining);
                    return [...prev, ...toAdd];
                });

                setHasMore(pageNum < data.total_pages && finalCount < limit);
            }
            
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching popular people:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [i18n.language]);

    useEffect(() => {
        window.scrollTo(0, 0);
        setItems([]);
        setPage(1);
        setHasMore(true);
        loadData(1, true);
    }, [i18n.language, loadData]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    loadData(page + 1, false);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading, loadingMore, page, loadData]);

    const getCardTitle = (item: SearchResult) => {
        return item.name || item.original_name || '';
    };

    const getCardImage = (item: SearchResult) => {
        const path = item.profile_path;
        return path ? getImageUrl(path, 'w500') : null;
    };

    const handleItemClick = (item: SearchResult) => {
        const url = `/person/${item.id}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const isMobile = window.innerWidth <= 768;

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#121212',
            color: '#fff',
            padding: isMobile ? '80px 16px 20px' : '100px 40px 40px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div style={{
                    marginBottom: '30px'
                }}>
                    <h1 style={{
                        fontSize: isMobile ? '24px' : '32px',
                        fontWeight: 'bold',
                        margin: 0
                    }}>
                        {t('common.popular', 'Popular')} {t('common.people', 'People')}
                    </h1>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                        <span style={{ color: '#fff', fontSize: '14px' }}>
                            {t('common.loading', 'Loading...')}
                        </span>
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                            gap: isMobile ? '16px' : '24px'
                        }}>
                            {items.map((item) => (
                                <div
                                    key={`${item.id}`}
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
                                                <User size={40} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#fff',
                                        textAlign: 'center',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        lineHeight: '1.4'
                                    }}>
                                        {getCardTitle(item)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {hasMore && (
                            <div 
                                ref={observerTarget} 
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    padding: '40px',
                                    width: '100%',
                                    minHeight: '100px'
                                }}
                            >
                                {loadingMore && (
                                    <span style={{ color: '#fff', fontSize: '14px' }}>
                                        {t('common.loading', 'Loading...')}
                                    </span>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
