import './i18n';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Home from './components/Home';
import MovieDetail from './components/MovieDetail';
import TVDetail from './components/TVDetail';
import PersonDetail from './components/PersonDetail';
import ImdbRedirect from './components/ImdbRedirect';
import LanguageSwitcher from './components/LanguageSwitcher';
import Lists from './components/Lists';
import ListDetail from './components/ListDetail';
import Recommendations from './components/Recommendations';
import { LoadingProvider } from './contexts/LoadingContext';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isListPage = location.pathname.startsWith('/lists');
  const prevPathRef = useRef(location.pathname);


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
        <Route path="/person/:id" element={<PersonDetail />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/lists/recommendations" element={<Recommendations />} />
        <Route path="/lists/:type" element={<ListDetail />} />
        <Route path="/:imdbId" element={<ImdbRedirect />} />
      </Routes>
      {!isListPage && <LanguageSwitcher variant={isHomePage ? 'fixed' : 'bottom'} />}
    </>
  );
}

function App() {
  return (
    <Router>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </Router>
  );
}

export default App
