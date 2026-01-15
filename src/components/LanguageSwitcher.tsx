import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TMDbLogo from '../assets/tmdb-logo.svg';

interface LanguageSwitcherProps {
  variant?: 'fixed' | 'bottom';
}

const LanguageSwitcher = ({ variant = 'fixed' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setIsOpen(false);
  };

  const languages = [
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'zh', name: '简体中文', flag: '简' },
    { code: 'zh-TW', name: '繁體中文', flag: '繁' },
    { code: 'ja', name: '日本語', flag: '日' },
    { code: 'ko', name: '한국어', flag: '한' },
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'fr', name: 'Français', flag: 'FR' },
    { code: 'de', name: 'Deutsch', flag: 'DE' },
    { code: 'ru', name: 'Русский', flag: 'RU' },
    { code: 'it', name: 'Italiano', flag: 'IT' },
    { code: 'pt', name: 'Português', flag: 'PT' }
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  if (variant === 'bottom') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '40px 80px',
        backgroundColor: '#121212',
        gap: '40px'
      }}>
        {/* Home Button - Left */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 16px',
            backgroundColor: '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'background-color 0.2s',
            flexShrink: 0,
            marginTop: '2px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
        >
          <Home size={18} />
        </button>

        {/* TMDB Attribution - Center */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          paddingTop: '12px'
        }}>
          <a 
            href="https://www.themoviedb.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            <img 
              src={TMDbLogo} 
              alt="TMDB Logo" 
              style={{ 
                height: '20px',
                opacity: 0.8,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            />
          </a>
          <p style={{
            fontSize: '12px',
            color: '#888',
            margin: 0,
            lineHeight: 1.5
          }}>
            This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.
          </p>
        </div>

        {/* Language Switcher - Right */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={containerRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
          >
            <Globe size={18} />
            <span>{currentLanguage.flag}</span>
          </button>

            {isOpen && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                right: '0',
                marginBottom: '8px',
                backgroundColor: '#222',
                border: '1px solid #444',
                borderRadius: '12px',
                overflow: 'hidden',
                minWidth: '140px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                zIndex: 9999
              }}>
                {languages.map(language => (
                  <button
                    key={language.code}
                    onClick={() => changeLanguage(language.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: i18n.language === language.code ? '#444' : 'transparent',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textAlign: 'left',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (i18n.language !== language.code) {
                        e.currentTarget.style.backgroundColor = '#333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (i18n.language !== language.code) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontWeight: i18n.language === language.code ? 600 : 400 }}>
                      {language.flag}
                    </span>
                    <span style={{ fontWeight: i18n.language === language.code ? 600 : 400, fontFamily: 'Inter, sans-serif' }}>
                      {language.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9998
    }}>
      <div style={{ position: 'relative' }} ref={containerRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          <Globe size={18} />
          <span>{currentLanguage.flag}</span>
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            right: '0',
            marginBottom: '8px',
            backgroundColor: '#222',
            border: '1px solid #444',
            borderRadius: '12px',
            overflow: 'hidden',
            minWidth: '140px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 9999
          }}>
            {languages.map(language => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: i18n.language === language.code ? '#444' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (i18n.language !== language.code) {
                    e.currentTarget.style.backgroundColor = '#333';
                  }
                }}
                onMouseLeave={(e) => {
                  if (i18n.language !== language.code) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontWeight: i18n.language === language.code ? 600 : 400 }}>
                  {language.flag}
                </span>
                <span style={{ fontWeight: i18n.language === language.code ? 600 : 400, fontFamily: 'Inter, sans-serif' }}>
                  {language.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSwitcher;