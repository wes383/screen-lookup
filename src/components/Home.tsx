import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Home() {
    const { t } = useTranslation();
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
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#121212',
            gap: '24px',
            overflow: 'hidden'
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
                    {t('common.movie')}
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
                    {t('common.tvShow')}
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder={t('common.enterId', { type: type === 'movie' ? t('common.movie') : t('common.tvShow') })}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                        width: '400px',
                        padding: '20px 30px 20px 60px',
                        borderRadius: '9999px',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: '#2A2A2A',
                        color: '#FFFFFF',
                        fontSize: '24px',
                        fontFamily: 'Inter, sans-serif',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                    }}
                />
                <Search
                    style={{
                        position: 'absolute',
                        left: '24px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#888'
                    }}
                    size={28}
                />
            </form>
        </div>
    );
}

