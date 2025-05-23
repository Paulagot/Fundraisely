import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Game } from './pages/Game';
import { TestCampaign } from './pages/TestCampaign'; // Import the new TestCampaign page
import { Header } from './components/Header';
import { PitchDeck } from './pages/PitchDeck';
import { PitchDeckContent } from './pages/PitchDeckContent';
import { ActionButtonList } from './components/ActionButtonList';
import { InfoList } from './components/InfoList';
import ErrorBoundary from './components/ErrorBoundary';
import HostDashboard from './components/Quiz/dashboard/HostDashboard'; // Import the HostDashboard component}
import QuizChallengePage from './pages/QuizChallengePage';
import QuizGameWaitingPage from './pages/QuizGameWaitingPage';
import JoinQuizWeb2Page from '../src/components/Quiz/joinroom/JoinQuizWeb2Page';
import QuizGamePlayPage from './pages/QuizGamePlayPage';




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

  const showHeader = location.pathname !== '/pitch-deck-content' && location.pathname !== '/BingoBlitz';
  const showAppKit = location.pathname === '/pitch-deck';

  return (
    <ErrorBoundary>
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
            <Route path="/BingoBlitz" element={<TestCampaign />} /> {/* Add the new route */}
            <Route path="/host-dashboard/:roomId" element={<HostDashboard />} />
            <Route path="/quiz" element={<QuizChallengePage />} />
            <Route path="/quiz/game/:roomId/:playerId" element={<QuizGameWaitingPage />} />
            <Route path="/join/:roomId" element={<JoinQuizWeb2Page />} />
            <Route path="/quiz/play/:roomId/:playerId" element={<QuizGamePlayPage />} />
             <Route path="/test" element={<QuizGamePlayPage />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}