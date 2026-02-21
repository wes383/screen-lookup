import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Lists() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const lists = [
        {
            id: 'recommendations',
            name: 'Recommendations',
            color: '#fff'
        },
        {
            id: 'sightandsound',
            name: 'Sight & Sound Greatest Films of All Time',
            color: '#fff'
        },
        {
            id: 'tspdt',
            name: 'TSPDT 1000 Greatest Films',
            color: '#fff'
        },
        {
            id: 'afi',
            name: 'AFI 100 Years... 100 Movies',
            color: '#fff'
        },
        {
            id: 'cahiers',
            name: 'Cahiers du Cinéma Top 10',
            color: '#fff'
        },
        {
            id: 'tspdt21st',
            name: "TSPDT 21st Century's 1000 Most Acclaimed Films",
            color: '#fff'
        },
        {
            id: 'oscar',
            name: 'Academy Awards',
            color: '#fff'
        },
        {
            id: 'cannes',
            name: 'Cannes Film Festival',
            color: '#fff'
        },
        {
            id: 'venice',
            name: 'Venice Film Festival',
            color: '#fff'
        },
        {
            id: 'berlinale',
            name: 'Berlin International Film Festival',
            color: '#fff'
        }
    ];

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
                    fontSize: '32px',
                    fontWeight: 'bold',
                    marginBottom: '32px'
                }}>
                    {t('common.lists', 'Lists')}
                </h1>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {lists.map(list => (
                        <div
                            key={list.id}
                            onClick={() => navigate(`/lists/${list.id}`)}
                            style={{
                                backgroundColor: '#1a1a1a',
                                borderRadius: '12px',
                                padding: '24px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                border: '1px solid #333'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = '#252525';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = '#1a1a1a';
                            }}
                        >
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#fff',
                                margin: 0
                            }}>
                                {list.name}
                            </h2>
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: '40px',
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '14px',
                    padding: '20px 0'
                }}>
                    These lists may not be complete or fully accurate.
                </div>
            </div>
        </div>
    );
}
