import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { clearAllRoomData } from '../utils/localStorageUtils';
import Headers from '../components/Headers';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import CTASection from '../components/CTASection';
import Benefit from '../components/Benefits';
import Hfooter from '../components/hFooter';
import { Link } from 'react-router-dom';
import FundRaiselyWhereYouSave from './savings';
import SolanaWalletOperations from '../components/SolanaWalletOperations';



export function Landing() {
  const { resetGameState } = useGameStore((state) => ({
    resetGameState: state.resetGameState,
  }));
  
  useEffect(() => {
    resetGameState();
    clearAllRoomData();
    
    try {
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('@appkit/portfolio_cache');
      localStorage.removeItem('lace-wallet-mode');
      localStorage.removeItem('debug');
    } catch (e) {
      console.error('Error cleaning up storage:', e);
    }
  }, [resetGameState]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-20">
      <SolanaWalletOperations />
   
      <Headers />
      <HeroSection />
      
      {/* Campaign Link Section - Reduced padding from py-12 to py-8 */}
      <div className="container mx-auto px-4 max-w-6xl mt-4 mb-4">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-8 py-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Try Our Bingo Blitz: Chain Challenge?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-6">
              We've created a special Bingo Blitz: Chain Challenge.
              Whether you want to host a game or join as a player, you can experience our blockchain-based
              gaming platform in action.
            </p>
            <Link 
              to="/BingoBlitz"
              className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-50 transition inline-block"
            >
              Check Out Our Bingo Blitz: Chain Challenge
            </Link>
          </div>
        </div>
      </div>
     
         
      <HowItWorks />
      <Benefit />
      <FAQ />
       <FundRaiselyWhereYouSave />
      <CTASection />
      <Hfooter />
    </div>
  );
}



