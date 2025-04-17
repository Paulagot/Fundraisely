import  { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Game } from './pages/Game';
import { Header } from './components/Header';
import { PitchDeck } from './pages/PitchDeck';
import { PitchDeckContent } from './pages/PitchDeckContent';
import { ActionButtonList } from './components/ActionButtonList'; 
import { InfoList } from './components/InfoList';

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
  
  // Determine whether to show AppKit features
  // Customize this logic based on which pages should show AppKit
  const showAppKit = location.pathname === '/pitch-deck';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {showHeader && <Header />}
      <main className={showHeader ? 'pt-16' : ''}>
        {showAppKit && (
          <div className="appkit-container p-4 bg-white rounded shadow my-4 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Wallet Connection</h2>
            <appkit-button />
            <ActionButtonList />
            <InfoList />
          </div>
        )}
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