import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPersonDetails, getImageUrl, type PersonDetails, type PersonCreditItem } from '../services/tmdb';
import { User } from 'lucide-react';

export default function PersonDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [person, setPerson] = useState<PersonDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            setLoading(true);
            const data = await getPersonDetails(id);
            if (data) {
                setPerson(data);
            } else {
                setError('Person not found');
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#121212', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
                Loading...
            </div>
        );
    }

    if (error || !person) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#121212', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
                {error || 'Something went wrong'}
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

    const genderText = person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : person.gender === 3 ? 'Non-binary' : 'Unknown';

    const allCredits = person.combined_credits?.cast
        .filter((c): c is PersonCreditItem => (c.popularity || 0) > 10)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0)) || [];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', gap: '40px', padding: '60px 80px', alignItems: 'flex-start' }}>
                {/* Profile Image */}
                <div style={{ flexShrink: 0, width: '300px' }}>
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
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 700, margin: 0, marginBottom: '16px' }}>{person.name}</h1>

                    {/* Meta Info */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '24px', color: '#ccc', fontSize: '16px' }}>
                        {person.known_for_department && (
                            <div>
                                <span style={{ color: '#888' }}>Known For: </span>
                                <span>{person.known_for_department}</span>
                            </div>
                        )}
                        <div>
                            <span style={{ color: '#888' }}>Gender: </span>
                            <span>{genderText}</span>
                        </div>
                        {person.birthday && (
                            <div>
                                <span style={{ color: '#888' }}>Born: </span>
                                <span>{new Date(person.birthday).toLocaleDateString()} ({calculateAge(person.birthday, person.deathday)} years old)</span>
                            </div>
                        )}
                        {person.deathday && (
                            <div>
                                <span style={{ color: '#888' }}>Died: </span>
                                <span>{new Date(person.deathday).toLocaleDateString()}</span>
                            </div>
                        )}
                        {person.place_of_birth && (
                            <div>
                                <span style={{ color: '#888' }}>Birthplace: </span>
                                <span>{person.place_of_birth}</span>
                            </div>
                        )}
                    </div>


                    {/* External Links */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        {person.homepage && (
                            <a href={person.homepage} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '16px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                                Homepage
                            </a>
                        )}
                        {(person.imdb_id || person.external_ids?.imdb_id) && (
                            <a href={`https://www.imdb.com/name/${person.imdb_id || person.external_ids?.imdb_id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '16px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                                IMDb
                            </a>
                        )}
                        <a href={`https://www.themoviedb.org/person/${person.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '16px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                            TMDB
                        </a>
                        {person.external_ids?.instagram_id && (
                            <a href={`https://www.instagram.com/${person.external_ids.instagram_id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '16px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                                Instagram
                            </a>
                        )}
                        {person.external_ids?.twitter_id && (
                            <a href={`https://twitter.com/${person.external_ids.twitter_id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '16px' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                                Twitter
                            </a>
                        )}
                    </div>

                    {/* Biography */}
                    {person.biography && (
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '12px' }}>Biography</h3>
                            <p style={{ fontSize: '16px', lineHeight: 1.7, color: '#ccc', whiteSpace: 'pre-line' }}>
                                {person.biography}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Filmography */}
            <div style={{ padding: '0 80px 80px' }}>
                {/* Movie Credits */}
                {sortedMovieCredits.length > 0 && (
                    <div style={{ marginBottom: '48px' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px' }}>Movie Credits ({sortedMovieCredits.length})</h3>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {sortedMovieCredits.map(credit => (
                                <div
                                    key={`movie-${credit.id}-${credit.character}`}
                                    onClick={() => navigate(`/movie/${credit.id}`)}
                                    style={{ minWidth: '140px', width: '140px', cursor: 'pointer' }}
                                >
                                    <div style={{ height: '210px', backgroundColor: '#333', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                                        {credit.poster_path ? (
                                            <img src={getImageUrl(credit.poster_path, 'w342')} alt={credit.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '12px' }}>No Poster</div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{credit.title}</div>
                                    {credit.character && <div style={{ fontSize: '13px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{credit.character}</div>}
                                    <div style={{ fontSize: '13px', color: '#666' }}>{credit.release_date ? new Date(credit.release_date).getFullYear() : 'TBA'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TV Credits */}
                {sortedTVCredits.length > 0 && (
                    <div style={{ marginBottom: '48px' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px' }}>TV Credits ({sortedTVCredits.length})</h3>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {sortedTVCredits.map(credit => (
                                <div
                                    key={`tv-${credit.id}-${credit.character}`}
                                    onClick={() => navigate(`/tv/${credit.id}`)}
                                    style={{ minWidth: '140px', width: '140px', cursor: 'pointer' }}
                                >
                                    <div style={{ height: '210px', backgroundColor: '#333', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                                        {credit.poster_path ? (
                                            <img src={getImageUrl(credit.poster_path, 'w342')} alt={credit.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '12px' }}>No Poster</div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{credit.name}</div>
                                    {credit.character && <div style={{ fontSize: '13px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{credit.character}</div>}
                                    <div style={{ fontSize: '13px', color: '#666' }}>{credit.first_air_date ? new Date(credit.first_air_date).getFullYear() : 'TBA'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Images Gallery */}
                {person.images?.profiles && person.images.profiles.length > 1 && (
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px' }}>Photos ({person.images.profiles.length})</h3>
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
