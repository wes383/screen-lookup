import './i18n';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Analytics } from '@vercel/analytics/react';
import { HelmetProvider } from 'react-helmet-async';
import Home from './components/Home';
import MovieDetail from './components/MovieDetail';
import TVDetail from './components/TVDetail';
import PersonDetail from './components/PersonDetail';
import ImdbRedirect from './components/ImdbRedirect';
import LanguageSwitcher from './components/LanguageSwitcher';
import Lists from './components/Lists';
import ListDetail from './components/ListDetail';
import Recommendations from './components/Recommendations';
import TrendingList from './components/TrendingList';
import MovieList from './components/MovieList';
import TVList from './components/TVList';
import PersonList from './components/PersonList';
import Discover from './components/Discover';
import MediaDiscovery from './components/MediaDiscovery';
import { LoadingProvider } from './contexts/LoadingContext';

function AppContent() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const isHomePage = location.pathname === '/';
  const isListPage = location.pathname.startsWith('/lists');
  const isDiscoveryRelatedPage = location.pathname === '/discovery' || 
                                  location.pathname.startsWith('/trending/') ||
                                  location.pathname.startsWith('/movies/') ||
                                  location.pathname.startsWith('/tv-shows/') ||
                                  location.pathname === '/person/popular';
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const isRTL = i18n.language === 'ar' || i18n.language.startsWith('ar-');
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    }
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/tv/:id" element={<TVDetail />} />
        <Route path="/person/popular" element={<PersonList />} />
        <Route path="/person/:id" element={<PersonDetail />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/lists/recommendations" element={<Recommendations />} />
        <Route path="/lists/:type" element={<ListDetail />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/discovery" element={<MediaDiscovery />} />
        <Route path="/trending/:type" element={<TrendingList />} />
        <Route path="/movies/:type" element={<MovieList />} />
        <Route path="/tv-shows/:type" element={<TVList />} />
        <Route path="/:imdbId" element={<ImdbRedirect />} />
      </Routes>
      {!isListPage && !isDiscoveryRelatedPage && <LanguageSwitcher variant={isHomePage ? 'fixed' : 'bottom'} />}
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <LoadingProvider>
          <AppContent />
        </LoadingProvider>
        <Analytics />
      </Router>
    </HelmetProvider>
  );
}

export default App
