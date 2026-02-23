import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowDown01, ArrowDown10 } from 'lucide-react';

import tspdtData from '../assets/tspdt-1000-greatest-films-2026.json';
import tspdt21stData from '../assets/tspdt-21st-centurys-top-1000.json';
import sightAndSoundData from '../assets/sight-and-sound-2022-top-250.json';
import afiData from '../assets/afi-100-years-100-movies-10th-anniversary.json';
import cahiersData from '../assets/cahiers-du-cinema-top-10.json';
import oscarData from '../assets/oscar_winners.json';
import cannesData from '../assets/cannes_awards.json';
import veniceData from '../assets/venice_awards.json';
import berlinaleData from '../assets/berlinale_awards.json';

interface ListItem {
    rank?: number | string;
    title: string;
    year: string | number;
    tmdb_id: number;
    genres?: string[];
    // For Cahiers
    rankingYear?: string;
    // For Awards
    Award?: string;
    Director?: string;
    Film?: string;
    name?: string;
}

const getAwardImportance = (award: string | undefined, type: string | undefined): number => {
    if (!award) return 999;
    const awardLower = award.toLowerCase();

    if (type === 'oscar') {
        if (awardLower.includes('outstanding picture') || awardLower.includes('outstanding production') || awardLower.includes('unique and artistic picture') || awardLower.includes('best picture') || awardLower.includes('best motion picture')) return 1;
        if (awardLower.includes('directing') || awardLower.includes('director')) return 2;
        if (awardLower.includes('actor') && !awardLower.includes('supporting')) return 3;
        if (awardLower.includes('actress') && !awardLower.includes('supporting')) return 4;
        if (awardLower.includes('supporting actor')) return 5;
        if (awardLower.includes('supporting actress')) return 6;
        if (awardLower.includes('writing') || awardLower.includes('screenplay')) return 7;
        if (awardLower.includes('cinematography')) return 8;
        return 99;
    }
    
    if (type === 'cannes') {
        if (awardLower.includes('palme')) return 1;
        if (awardLower.includes('grand prix')) return 2;
        if (awardLower.includes('jury prize')) return 3;
        if (awardLower.includes('director')) return 4;
        if (awardLower.includes('actor')) return 5;
        if (awardLower.includes('actress')) return 6;
        if (awardLower.includes('screenplay')) return 7;
        if (awardLower.includes('short film')) return 100;
        return 99;
    }

    if (type === 'venice') {
        if (awardLower.includes('golden lion')) return 1;
        if (awardLower.includes('grand jury')) return 2;
        if (awardLower.includes('silver lion')) return 3;
        if (awardLower.includes('volpi') || awardLower.includes('actor') || awardLower.includes('actress')) return 4;
        if (awardLower.includes('screenplay')) return 5;
        if (awardLower.includes('special jury')) return 6;
        return 99;
    }

    if (type === 'berlinale') {
        if (awardLower.includes('golden bear')) return 1;
        if (awardLower.includes('silver bear') && awardLower.includes('grand jury')) return 2;
        if (awardLower.includes('silver bear') && awardLower.includes('director')) return 3;
        if (awardLower.includes('silver bear') && (awardLower.includes('actor') || awardLower.includes('actress'))) return 4;
        if (awardLower.includes('silver bear') && awardLower.includes('screenplay')) return 5;
        return 99;
    }

    return 999;
};

export default function ListDetail() {
    const { type } = useParams<{ type: string }>();
    const navigate = useNavigate();

    const [listData, setListData] = useState<ListItem[]>([]);
    const [title, setTitle] = useState('');
    const [displayCount, setDisplayCount] = useState(50);
    const [isAscending, setIsAscending] = useState(true);
    const LOAD_MORE_COUNT = 50;

    useEffect(() => {
        let data: any[] = [];
        let pageTitle = '';

        window.scrollTo(0, 0);

        switch (type) {
            case 'tspdt':
                data = tspdtData;
                pageTitle = 'TSPDT 1000 Greatest Films';
                break;
            case 'tspdt21st':
                data = tspdt21stData;
                pageTitle = "TSPDT 21st Century's 1000 Most Acclaimed Films";
                break;
            case 'sightandsound':
                data = sightAndSoundData;
                pageTitle = 'Sight & Sound Greatest Films of All Time';
                break;
            case 'afi':
                data = afiData;
                pageTitle = 'AFI 100 Years... 100 Movies';
                break;
            case 'cahiers':
                let currentYear = '';
                let currentRank = '';

                const resolvedCahiers = cahiersData.map(item => {
                    if (item.year !== currentYear) {
                        currentYear = item.year;
                        currentRank = item.rank === 'Tied' ? '1' : item.rank;
                    }

                    let rank = item.rank;
                    if (rank === 'Tied') {
                        rank = currentRank;
                    } else {
                        currentRank = rank;
                    }

                    return {
                        ...item,
                        rank: rank,
                        rankingYear: item.year
                    };
                });

                data = resolvedCahiers.sort((a, b) => {
                    if (a.year !== b.year) {
                        return parseInt(b.year) - parseInt(a.year);
                    }
                    return parseInt(String(a.rank)) - parseInt(String(b.rank));
                });
                pageTitle = 'Cahiers du Cinéma Top 10';
                setIsAscending(false);
                break;
            case 'oscar':
                data = oscarData.map(item => {
                    const yearParts = String(item.Year).split('/');
                    let baseYear;
                    
                    if (yearParts.length > 1) {
                        const firstPart = yearParts[0];
                        const secondPart = yearParts[1];
                        if (secondPart.length === 2) {
                            baseYear = parseInt(firstPart.substring(0, 2) + secondPart);
                        } else {
                            baseYear = parseInt(secondPart);
                        }
                    } else {
                        baseYear = parseInt(yearParts[0]);
                    }

                    const displayYear = String(baseYear + 1);
                    
                    return {
                        ...item,
                        title: item.Film,
                        year: item.Year,
                        rankingYear: displayYear,
                        name: item.name
                    };
                }).sort((a, b) => {
                    const yearA = parseInt(String(a.rankingYear));
                    const yearB = parseInt(String(b.rankingYear));
                    if (yearA !== yearB) return yearB - yearA;
                    return getAwardImportance(a.Award, 'oscar') - getAwardImportance(b.Award, 'oscar');
                });
                pageTitle = 'Academy Awards';
                setIsAscending(false);
                break;
            case 'cannes':
                data = cannesData.map(item => ({
                    ...item,
                    title: item.Film,
                    year: item.Year,
                    rankingYear: String(item.Year)
                })).sort((a, b) => {
                    const yearA = parseInt(String(a.Year));
                    const yearB = parseInt(String(b.Year));
                    if (yearA !== yearB) return yearB - yearA;
                    return getAwardImportance(a.Award, 'cannes') - getAwardImportance(b.Award, 'cannes');
                });
                pageTitle = 'Cannes Film Festival';
                setIsAscending(false);
                break;
            case 'venice':
                data = veniceData.map(item => ({
                    ...item,
                    title: item.Film,
                    year: item.Year,
                    rankingYear: String(item.Year)
                })).sort((a, b) => {
                    const yearA = parseInt(String(a.Year));
                    const yearB = parseInt(String(b.Year));
                    if (yearA !== yearB) return yearB - yearA;
                    return getAwardImportance(a.Award, 'venice') - getAwardImportance(b.Award, 'venice');
                });
                pageTitle = 'Venice Film Festival';
                setIsAscending(false);
                break;
            case 'berlinale':
                data = berlinaleData.map(item => ({
                    ...item,
                    title: item.Film,
                    year: item.Year,
                    rankingYear: String(item.Year)
                })).sort((a, b) => {
                    const yearA = parseInt(String(a.Year));
                    const yearB = parseInt(String(b.Year));
                    if (yearA !== yearB) return yearB - yearA;
                    return getAwardImportance(a.Award, 'berlinale') - getAwardImportance(b.Award, 'berlinale');
                });
                pageTitle = 'Berlin International Film Festival';
                setIsAscending(false);
                break;
            default:
                navigate('/lists');
                return;
        }

        setListData(data);
        setTitle(pageTitle);
        setDisplayCount(50);
        if (type !== 'cahiers' && type !== 'oscar' && type !== 'cannes' && type !== 'venice' && type !== 'berlinale') {
            setIsAscending(true);
        }
    }, [type, navigate]);

    const handleSort = () => {
        const newIsAscending = !isAscending;
        setIsAscending(newIsAscending);
        
        const sortedData = [...listData];
        if (type === 'cahiers' || type === 'oscar' || type === 'cannes' || type === 'venice' || type === 'berlinale') {
            sortedData.sort((a, b) => {
                const yearA = parseInt(String(a.rankingYear || a.year).split('/')[0]);
                const yearB = parseInt(String(b.rankingYear || b.year).split('/')[0]);
                
                if (yearA !== yearB) {
                    return newIsAscending 
                        ? yearA - yearB 
                        : yearB - yearA;
                }
                
                if (type === 'cahiers' && a.rank && b.rank) {
                    return parseInt(String(a.rank)) - parseInt(String(b.rank));
                }

                return getAwardImportance(a.Award, type) - getAwardImportance(b.Award, type);
            });
        } else {
            sortedData.reverse();
        }
        setListData(sortedData);
        setDisplayCount(50);
    };

    const handleJumpToRank = (targetRank: number) => {
        if (type !== 'tspdt' && type !== 'tspdt21st' && type !== 'sightandsound') return;
        
        let targetIndex = -1;
        
        if (isAscending) {
            targetIndex = listData.findIndex(item => Number(item.rank) === targetRank);
        } else {
            targetIndex = listData.findIndex(item => Number(item.rank) === targetRank);
        }

        if (targetIndex !== -1) {
            if (displayCount <= targetIndex) {
                setDisplayCount(targetIndex + 50);
            }

            setTimeout(() => {
                const element = document.getElementById(`rank-${listData[targetIndex].rank}`);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    window.scrollTo({
                        top: window.scrollY + rect.top - 20,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        } else if (type === 'sightandsound') {
            // Find the closest rank
            const closestIndex = listData.findIndex(item => Number(item.rank) >= targetRank);
            if (closestIndex !== -1) {
                if (displayCount <= closestIndex) {
                    setDisplayCount(closestIndex + 50);
                }

                setTimeout(() => {
                    const element = document.getElementById(`rank-${listData[closestIndex].rank}`);
                    if (element) {
                        const rect = element.getBoundingClientRect();
                        window.scrollTo({
                            top: window.scrollY + rect.top - 20,
                            behavior: 'smooth'
                        });
                    }
                }, 100);
            }
        }
    };

    const handleJumpToYear = (targetYear: string) => {
        if (type !== 'cahiers' && type !== 'oscar' && type !== 'cannes' && type !== 'venice' && type !== 'berlinale') return;

        const targetIndex = listData.findIndex(item => {
            const yearStr = String(item.rankingYear || item.year);
            return yearStr.startsWith(targetYear.substring(0, 3));
        });

        if (targetIndex !== -1) {
            if (displayCount <= targetIndex) {
                setDisplayCount(targetIndex + 50);
            }

            setTimeout(() => {
                const yearItem = listData[targetIndex];
                const yearId = String(yearItem.rankingYear || yearItem.year).replace('/', '-');
                
                const element = document.getElementById(`year-${yearId}`);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    window.scrollTo({
                        top: window.scrollY + rect.top - 20,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (listData.length === 0) return;
            
            if (
                window.innerHeight + document.documentElement.scrollTop
                >= document.documentElement.offsetHeight - 200
            ) {
                setDisplayCount(prev => Math.min(prev + LOAD_MORE_COUNT, listData.length));
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [listData.length]);

    const formatTitle = (title: string) => {
        const pattern = /^(.*), (The|A|An)$/;
        const match = title.match(pattern);
        if (match) {
            return `${match[2]} ${match[1]}`;
        }
        return title;
    };

    // Generate year range buttons for Cahiers and Awards
    const getDecades = () => {
        if (listData.length === 0) return [];
        
        const years = listData.map(item => {
            const yearStr = String(item.rankingYear || item.year);
            return parseInt(yearStr.split('/')[0]);
        }).filter(y => y > 0);
        
        if (years.length === 0) return [];
        
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        
        const startDecade = Math.floor(minYear / 10) * 10;
        const endDecade = Math.floor(maxYear / 10) * 10;
        
        const decades = [];
        for (let y = startDecade; y <= endDecade; y += 10) {
            decades.push(y);
        }
        
        return isAscending ? decades : [...decades].reverse();
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#121212',
            color: '#fff',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                paddingTop: '20px'
            }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    marginBottom: '24px'
                }}>
                    {title}
                </h1>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        {(type === 'tspdt' || type === 'tspdt21st') && [100, 200, 300, 400, 500, 600, 700, 800, 900].map(rank => (
                            <button
                                key={rank}
                                onClick={() => handleJumpToRank(rank)}
                                style={{
                                    backgroundColor: '#2a2a2a',
                                    border: '1px solid #333',
                                    borderRadius: '16px',
                                    padding: '8px 16px',
                                    color: '#ccc',
                                    fontSize: '14px',
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#3a3a3a';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                                    e.currentTarget.style.color = '#ccc';
                                }}
                            >
                                #{rank}
                            </button>
                        ))}

                        {type === 'sightandsound' && [50, 100, 150, 200].map(rank => (
                            <button
                                key={rank}
                                onClick={() => handleJumpToRank(rank)}
                                style={{
                                    backgroundColor: '#2a2a2a',
                                    border: '1px solid #333',
                                    borderRadius: '16px',
                                    padding: '8px 16px',
                                    color: '#ccc',
                                    fontSize: '14px',
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#3a3a3a';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                                    e.currentTarget.style.color = '#ccc';
                                }}
                            >
                                #{rank}
                            </button>
                        ))}
                        
                        {type !== 'tspdt' && type !== 'tspdt21st' && type !== 'sightandsound' && type !== 'afi' && getDecades().map(year => (
                            <button
                                key={year}
                                onClick={() => handleJumpToYear(String(year))}
                                style={{
                                    backgroundColor: '#2a2a2a',
                                    border: '1px solid #333',
                                    borderRadius: '16px',
                                    padding: '8px 16px',
                                    color: '#ccc',
                                    fontSize: '14px',
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#3a3a3a';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                                    e.currentTarget.style.color = '#ccc';
                                }}
                            >
                                {year}s
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSort}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            padding: '8px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252525'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                        title={(type === 'cahiers' || type === 'oscar' || type === 'cannes' || type === 'venice' || type === 'berlinale')
                            ? (isAscending ? 'Oldest First' : 'Newest First')
                            : (isAscending ? 'Rank Ascending' : 'Rank Descending')
                        }
                    >
                        {isAscending ? <ArrowDown01 size={20} /> : <ArrowDown10 size={20} />}
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {listData.slice(0, displayCount).map((item, index) => {
                        const showYearHeader = item.rankingYear && (index === 0 || listData[index - 1].rankingYear !== item.rankingYear);
                        const yearId = item.rankingYear ? String(item.rankingYear).replace('/', '-') : '';
                        
                        // Check if we should show the Award header
                        const isAwardList = type === 'oscar' || type === 'cannes' || type === 'venice' || type === 'berlinale';
                        const showAwardHeader = isAwardList && item.Award && (
                            index === 0 || 
                            listData[index - 1].rankingYear !== item.rankingYear ||
                            listData[index - 1].Award !== item.Award
                        );

                        return (
                            <div key={`${item.tmdb_id}-${index}`}>
                                {showYearHeader && (
                                    <div
                                        id={`year-${yearId}`}
                                        style={{
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            color: '#999',
                                            marginTop: index === 0 ? '0' : '32px',
                                            marginBottom: '16px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        {item.rankingYear}
                                    </div>
                                )}

                                {showAwardHeader && (
                                    <div style={{ 
                                        fontSize: '16px', 
                                        color: '#fff',
                                        marginBottom: '12px',
                                        marginTop: showYearHeader ? '0' : '16px',
                                        fontWeight: 'bold',
                                        textAlign: 'left',
                                        paddingLeft: '16px'
                                    }}>
                                        {item.Award}
                                    </div>
                                )}

                                <Link
                                    id={`rank-${item.rank}`}
                                    to={item.title.includes('[TV]') ? `/tv/${item.tmdb_id}` : `/movie/${item.tmdb_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '32px',
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
                                    {!isAwardList && (
                                        <div style={{
                                            width: '40px',
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            color: '#666',
                                            textAlign: 'center'
                                        }}>
                                            {item.rank}
                                        </div>
                                    )}
                                    
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                                            {item.name && <span>{item.name} - </span>}
                                            {formatTitle(item.title)}
                                        </div>
                                        
                                        <div style={{ fontSize: '14px', color: '#999', marginTop: '4px', display: 'flex', alignItems: 'center' }}>
                                            {!isAwardList && type !== 'cahiers' && (
                                                <span>{item.year}</span>
                                            )}
                                            
                                            {item.genres && (
                                                <>
                                                    {(!isAwardList && type !== 'cahiers') && <span style={{ margin: '0 8px' }}>•</span>}
                                                    
                                                    <span>{item.genres.join(', ')}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
