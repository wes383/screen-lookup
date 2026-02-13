import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPersonDetails, getImageUrl, type PersonDetails, type PersonCreditItem } from '../services/tmdb';
import { User, Film } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLoading } from '../contexts/LoadingContext';
import { getTMDBLanguage, getDateLocale } from '../utils/languageMapper';

export default function PersonDetail() {
    const { t, i18n } = useTranslation();
    const { setIsLoading } = useLoading();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [person, setPerson] = useState<PersonDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        return () => setIsLoading(false);
    }, [setIsLoading]);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            setLoading(true);
            setIsLoading(true);
            const currentLanguage = getTMDBLanguage(i18n.language);
            const data = await getPersonDetails(id, currentLanguage);
            if (data) {
                setPerson(data);
            } else {
                setError('Person not found');
            }
            setLoading(false);
            setIsLoading(false);
        };
        fetchData();
    }, [id, i18n.language]);

    if (loading) {
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#121212', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', zIndex: 9999 }}>
                {t('common.loading')}
            </div>
        );
    }

    if (error || !person) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#121212', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
                {error || t('person.notFound')}
            </div>
        );
    }

    const calculateAge = (birthday: string, deathday?: string | null): number => {
        const birth = new Date(birthday);
        const end = deathday ? new Date(deathday) : new Date();
        let age = end.getFullYear() - birth.getFullYear();
        const monthDiff = end.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const genderText = person.gender === 1 ? t('person.female') : person.gender === 2 ? t('person.male') : person.gender === 3 ? t('person.nonBinary') : t('common.unknown');

    const translateKnownFor = (department: string | undefined): string => {
        if (!department) return t('common.unknown');
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

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        
        const locale = getDateLocale(i18n.language);
        
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(dateString));
    };

    const allCredits = [
        ...(person.combined_credits?.cast || []),
        ...(person.combined_credits?.crew || [])
    ];

    // Define job importance order
    const jobImportance: { [key: string]: number } = {
        'Director': 1,
        'Writer': 2,
        'Screenplay': 3,
        'Producer': 4,
        'Executive Producer': 5,
        'Original Music Composer': 6,
        'Director of Photography': 7,
        'Editor': 8,
        'Production Design': 9,
        'Costume Design': 10
    };

    const creditsMap = new Map<number, { credit: PersonCreditItem; characters: Set<string>; jobs: Set<string> }>();

    allCredits.forEach(c => {
        const existing = creditsMap.get(c.id);
        if (existing) {
            if (c.character) {
                existing.characters.add(c.character);
            }
            if (c.job) {
                existing.jobs.add(c.job);
            }
        } else {
            const characters = new Set<string>();
            const jobs = new Set<string>();
            if (c.character) characters.add(c.character);
            if (c.job) jobs.add(c.job);
            creditsMap.set(c.id, { credit: { ...c }, characters, jobs });
        }
    });

    const sortedCredits = Array.from(creditsMap.values())
        .map(({ credit, characters, jobs }) => {
            // Sort jobs by importance
            const sortedJobs = Array.from(jobs).sort((a, b) => {
                const importanceA = jobImportance[a] || 999;
                const importanceB = jobImportance[b] || 999;
                return importanceA - importanceB;
            });

            const sortedCharacters = Array.from(characters);

            return {
                ...credit,
                character: sortedCharacters.join(', ') || undefined,
                job: sortedJobs.join(', ') || undefined
            };
        })
        .filter((c) => (c.vote_count || 0) > 100)
        .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '24px' : '40px', padding: isMobile ? '40px 20px' : '60px 80px', alignItems: 'flex-start' }}>
                {/* Profile Image */}
                <div style={{ flexShrink: 0, width: isMobile ? '200px' : '300px', margin: isMobile ? '0 auto' : '0' }}>
                    {person.profile_path ? (
                        <img
                            src={getImageUrl(person.profile_path, 'h632')}
                            alt={person.name}
                            style={{ width: '100%', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '450px', backgroundColor: '#333', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={80} color="#666" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    <h1 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: 700, margin: 0, marginBottom: '16px' }}>{person.name}</h1>

                    {/* Meta Info */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '24px', color: '#ccc', fontSize: '16px' }}>
                        {person.known_for_department && (
                            <div>
                                <span style={{ color: '#888' }}>{t('person.knownFor')}: </span>
                                <span>{translateKnownFor(person.known_for_department)}</span>
                            </div>
                        )}
                        <div>
                            <span style={{ color: '#888' }}>{t('person.gender')}: </span>
                            <span>{genderText}</span>
                        </div>
                        {person.birthday && (
                            <div>
                                <span style={{ color: '#888' }}>{t('common.born')}: </span>
                                <span>{formatDate(person.birthday)} ({calculateAge(person.birthday, person.deathday)} {t('common.yearsOld')})</span>
                            </div>
                        )}
                        {person.deathday && (
                            <div>
                                <span style={{ color: '#888' }}>{t('common.died')}: </span>
                                <span>{formatDate(person.deathday)}</span>
                            </div>
                        )}
                        {person.place_of_birth && (
                            <div>
                                <span style={{ color: '#888' }}>{t('common.birthplace')}: </span>
                                <span>{person.place_of_birth}</span>
                            </div>
                        )}
                    </div>


                    {/* External Links */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        {person.homepage && (
                            <a href={person.homepage} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '16px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                                {t('common.homepage')}
                            </a>
                        )}
                        {(person.imdb_id || person.external_ids?.imdb_id) && (
                            <a href={`https://www.imdb.com/name/${person.imdb_id || person.external_ids?.imdb_id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '16px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                                {t('common.imdb')}
                            </a>
                        )}
                        <a href={`https://www.themoviedb.org/person/${person.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '16px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                            {t('common.tmdb')}
                        </a>
                        {person.external_ids?.instagram_id && (
                            <a href={`https://www.instagram.com/${person.external_ids.instagram_id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '16px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                                {t('common.instagram')}
                            </a>
                        )}
                        {person.external_ids?.twitter_id && (
                            <a href={`https://twitter.com/${person.external_ids.twitter_id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '16px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                                {t('common.twitter')}
                            </a>
                        )}
                    </div>

                    {/* Biography */}
                    {person.biography && (
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '12px' }}>{t('common.biography')}</h3>
                            <p style={{ fontSize: '16px', lineHeight: 1.7, color: '#ccc', whiteSpace: 'pre-line' }}>
                                {person.biography}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Filmography */}
            <div style={{ padding: isMobile ? '0 20px 40px' : '0 80px 80px' }}>
                {sortedCredits.length > 0 && (
                    <div style={{ marginBottom: isMobile ? '32px' : '48px' }}>
                        <h3 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 600, marginBottom: isMobile ? '16px' : '24px' }}>{t('person.filmography')}</h3>
                        <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px', flexWrap: 'wrap' }}>
                            {sortedCredits.map(credit => {
                                // Translate job titles
                                const translatedJobs = credit.job?.split(', ').map(job => {
                                    const jobMap: { [key: string]: string } = {
                                        'Director': t('person.knownForDirecting'),
                                        'Writer': t('person.knownForWriting'),
                                        'Screenplay': t('person.knownForWriting'),
                                        'Producer': t('person.knownForProduction'),
                                        'Executive Producer': t('person.knownForProduction'),
                                        'Original Music Composer': t('person.knownForSound'),
                                        'Director of Photography': t('person.knownForCamera'),
                                        'Editor': t('person.knownForEditing'),
                                        'Production Design': t('person.knownForArt'),
                                        'Costume Design': t('person.knownForCostumeMakeUp')
                                    };
                                    return jobMap[job] || job;
                                }).join(', ');

                                const roles = [credit.character, translatedJobs].filter(Boolean);
                                return (
                                    <div
                                        key={`${credit.media_type}-${credit.id}`}
                                        onClick={() => navigate(`/${credit.media_type}/${credit.id}`)}
                                        style={{ minWidth: isMobile ? '120px' : '140px', width: isMobile ? '120px' : '140px', cursor: 'pointer' }}
                                    >
                                        <div style={{ height: isMobile ? '180px' : '210px', backgroundColor: '#333', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                                            {credit.poster_path ? (
                                                <img src={getImageUrl(credit.poster_path, 'w342')} alt={credit.title || credit.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                                    <Film size={48} />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{credit.title || credit.name}</div>
                                        {roles.length > 0 && <div style={{ fontSize: '13px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{roles.join(', ')}</div>}
                                        <div style={{ fontSize: '13px', color: '#666' }}>{(credit.release_date || credit.first_air_date) ? new Date(credit.release_date || credit.first_air_date!).getFullYear() : t('common.tba')}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Images Gallery */}
                {person.images?.profiles && person.images.profiles.length > 1 && (
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px' }}>{t('common.photos')}</h3>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', maxHeight: '432px', overflow: 'hidden' }}>
                            {person.images.profiles.map((img, i) => (
                                <img
                                    key={i}
                                    src={getImageUrl(img.file_path, 'w342')}
                                    alt={`${person.name} photo ${i + 1}`}
                                    style={{ height: '200px', borderRadius: '8px', objectFit: 'cover' }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
