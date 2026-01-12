import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function Home() {
    const [query, setQuery] = useState('');
    const [type, setType] = useState<'movie' | 'tv'>('movie');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/${type}/${query}`);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#121212',
            gap: '24px'
        }}>
            <div style={{ display: 'flex', gap: '5px', backgroundColor: '#2A2A2A', padding: '4px', borderRadius: '9999px' }}>
                <button
                    onClick={() => setType('movie')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: '9999px',
                        border: 'none',
                        backgroundColor: type === 'movie' ? '#fff' : 'transparent',
                        color: type === 'movie' ? '#121212' : '#888',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s'
                    }}
                >
                    Movie
                </button>
                <button
                    onClick={() => setType('tv')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: '9999px',
                        border: 'none',
                        backgroundColor: type === 'tv' ? '#fff' : 'transparent',
                        color: type === 'tv' ? '#121212' : '#888',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s'
                    }}
                >
                    TV Show
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder={`Enter ${type === 'movie' ? 'Movie' : 'TV Show'} TMDB ID`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                        width: '400px', // Increased width
                        padding: '20px 30px 20px 60px', // Increased padding
                        borderRadius: '9999px',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: '#2A2A2A',
                        color: '#FFFFFF',
                        fontSize: '24px', // Increased font size
                        fontFamily: 'Inter, sans-serif', // Explicit font
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' // Slightly stronger shadow
                    }}
                />
                <Search
                    style={{
                        position: 'absolute',
                        left: '24px', // Adjusted position
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#888'
                    }}
                    size={28} // Increased icon size
                />
            </form>
        </div>
    );
}

