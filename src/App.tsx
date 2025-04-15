import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Game } from './pages/Game';
import { Header } from './components/Header';
import { PitchDeck } from './pages/PitchDeck';
import { PitchDeckContent } from './pages/PitchDeckContent';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (location.pathname.startsWith('/game/')) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location]);
  
  useEffect(() => {
    const handlePopState = () => {
      if (location.pathname.startsWith('/game/')) {
        if (window.confirm('Are you sure you want to leave the game? All progress will be lost.')) {
          navigate('/');
        } else {
          window.history.pushState(null, '', location.pathname);
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate, location]);
  
  // Determine whether to show header based on current route
  const showHeader = location.pathname !== '/pitch-deck-content';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {showHeader && <Header />}
      <main className={showHeader ? 'pt-16' : ''}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/game/:roomId" element={<Game />} />
          <Route path="/pitch-deck" element={<PitchDeck />} />
          <Route path="/pitch-deck-content" element={<PitchDeckContent />} />
        </Routes>
      </main>
    </div>
  );
}