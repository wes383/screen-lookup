import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findByImdbId } from '../services/tmdb';
import { useTranslation } from 'react-i18next';

export default function ImdbRedirect() {
    const { imdbId } = useParams<{ imdbId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [error, setError] = useState(false);

    useEffect(() => {
        const redirect = async () => {
            if (!imdbId) {
                navigate('/');
                return;
            }

            // Ensure IMDb ID has 'tt' prefix
            const formattedImdbId = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;

            const result = await findByImdbId(formattedImdbId);

            if (result.type && result.id) {
                navigate(`/${result.type}/${result.id}`, { replace: true });
            } else {
                setError(true);
            }
        };

        redirect();
    }, [imdbId, navigate]);

    if (error) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: 'white',
                backgroundColor: '#121212'
            }}>
                <p style={{ marginBottom: '20px' }}>
                    {t('common.notFound') || 'Content not found'}
                </p>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: 'none',
                        background: '#333',
                        color: 'white',
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif'
                    }}
                >
                    {t('common.goBack') || 'Go Back'}
                </button>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            backgroundColor: '#121212',
            zIndex: 9999
        }}>
            {t('common.loading')}
        </div>
    );
}
