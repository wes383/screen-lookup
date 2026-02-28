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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    { code: 'en-US', name: 'English (US)', flag: 'EN' },
    { code: 'en-GB', name: 'English (UK)', flag: 'GB' },
    { code: 'zh-CN', name: '简体中文', flag: '简' },
    { code: 'zh-TW', name: '繁體中文 (台灣)', flag: '繁' },
    { code: 'zh-HK', name: '繁體中文 (香港)', flag: '繁' },
    { code: 'ja', name: '日本語', flag: '日' },
    { code: 'ko', name: '한국어', flag: '한' },
    { code: 'fr', name: 'Français', flag: 'FR' },
    { code: 'de', name: 'Deutsch', flag: 'DE' },
    { code: 'es-ES', name: 'Español (ES)', flag: 'ES' },
    { code: 'es-MX', name: 'Español (MX)', flag: 'MX' },
    { code: 'it', name: 'Italiano', flag: 'IT' },
    { code: 'pt-PT', name: 'Português (PT)', flag: 'PT' },
    { code: 'pt-BR', name: 'Português (BR)', flag: 'BR' },
    { code: 'ru', name: 'Русский', flag: 'RU' },
    { code: 'tr', name: 'Türkçe', flag: 'TR' }
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  if (variant === 'bottom') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'flex-start',
        padding: isMobile ? '20px' : '40px 80px',
        backgroundColor: 'transparent',
        gap: isMobile ? '20px' : '40px'
      }}>
        {/* Top row on mobile */}
        {isMobile && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 14px',
                backgroundColor: 'transparent',
                color: '#fff',
                border: '1px solid transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'background-color 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Home size={16} />
            </button>

            {/* Language Switcher */}
            <div style={{ position: 'relative', flexShrink: 0 }} ref={containerRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: '1px solid transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Globe size={16} />
                <span>{currentLanguage.flag}</span>
              </button>

              {isOpen && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: isMobile ? '0' : '0',
                  left: isMobile ? 'auto' : 'auto',
                  transform: 'none',
                  marginBottom: '8px',
                  backgroundColor: '#222',
                  border: '1px solid #444',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  zIndex: 9999,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0',
                  maxHeight: isMobile ? '60vh' : 'none',
                  overflowY: isMobile ? 'auto' : 'visible',
                  width: isMobile ? 'calc(100vw - 40px)' : 'auto',
                  maxWidth: isMobile ? '400px' : 'none'
                }}>
                  {languages.map(language => (
                    <button
                      key={language.code}
                      onClick={() => changeLanguage(language.code)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
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
                      <span style={{ fontWeight: i18n.language === language.code ? 600 : 400, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                        {language.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Desktop layout: Home button */}
        {!isMobile && (
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: '#fff',
              border: '1px solid transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'background-color 0.2s',
              flexShrink: 0,
              marginTop: '2px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Home size={18} />
          </button>
        )}

        {/* TMDB Attribution */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? '8px' : '12px',
          paddingTop: isMobile ? '0' : '12px',
          flexDirection: 'row'
        }}>
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            <img
              src={TMDbLogo}
              alt="TMDB Logo"
              style={{
                height: isMobile ? '16px' : '20px',
                opacity: 0.8,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            />
          </a>
          <p style={{
            fontSize: isMobile ? '10px' : '12px',
            color: '#888',
            margin: 0,
            lineHeight: 1.2,
            textAlign: 'left',
            maxWidth: isMobile ? '280px' : 'none'
          }}>
            This product uses TMDB and the TMDB APIs but
            <br />
            is not endorsed, certified, or otherwise approved by TMDB.
          </p>
        </div>

        {/* Desktop layout: Language Switcher */}
        {!isMobile && (
          <div style={{ position: 'relative', flexShrink: 0 }} ref={containerRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: 'transparent',
                color: '#fff',
                border: '1px solid transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                zIndex: 9999,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0'
              }}>
                {languages.map(language => (
                  <button
                    key={language.code}
                    onClick={() => changeLanguage(language.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
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
                    <span style={{ fontWeight: i18n.language === language.code ? 600 : 400, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                      {language.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? '12px' : '20px',
      right: isMobile ? '12px' : '20px',
      zIndex: 9998
    }}>
      <div style={{ position: 'relative' }} ref={containerRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '6px' : '8px',
            padding: isMobile ? '8px 12px' : '10px 16px',
            backgroundColor: 'transparent',
            color: '#fff',
            border: '1px solid transparent',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: 500,
            boxShadow: 'none',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Globe size={isMobile ? 16 : 18} />
          <span>{currentLanguage.flag}</span>
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            right: isMobile ? '0' : '0',
            left: isMobile ? 'auto' : 'auto',
            transform: 'none',
            marginBottom: '8px',
            backgroundColor: '#222',
            border: '1px solid #444',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0',
            maxHeight: isMobile ? '60vh' : 'none',
            overflowY: isMobile ? 'auto' : 'visible',
            width: isMobile ? 'calc(100vw - 40px)' : 'auto',
            maxWidth: isMobile ? '400px' : 'none'
          }}>
            {languages.map(language => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
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
                <span style={{ fontWeight: i18n.language === language.code ? 600 : 400, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
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