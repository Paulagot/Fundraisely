import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Dices, 
  ArrowRight, 
  Gamepad2, 
  Shield, 
  Heart, 
  Info,
  Wallet,
  CheckCircle
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useWeb3 } from '../context/Web3Context';
import WalletConnect from '../components/WalletConnect';
import { useRoomPayment } from '../hooks/useRoomPayments';
import { useRoomVerification } from '../hooks/useRoomVerification';

/**
 * Tests if localStorage is available and working
 * @returns {boolean} True if localStorage is available
 */
function isLocalStorageAvailable() {
  const testKey = '__test__';
  
  try {
    // Try to set a test item
    localStorage.setItem(testKey, testKey);
    // If it worked, remove it
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage is not available:', e);
    return false;
  }
}

export function Landing() {
  // Separate state for create and join forms
  const [createName, setCreateName] = useState('');
  const [joinName, setJoinName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [joinError, setJoinError] = useState('');
  const navigate = useNavigate();
  const setPlayerName = useGameStore(state => state.setPlayerName);
  
  // Web3 integration
  const { isConnected, account } = useWeb3();
  const { 
    makeRoomPayment, 
    paymentStatus, 
    transactionHash, 
    error: paymentError 
  } = useRoomPayment();
  
  // Room verification hook
  const { 
    verifyRoom, 
    status: roomVerificationStatus, 
    error: roomVerificationError 
  } = useRoomVerification();

  const generateRoomCode = () => {
    if (!createName.trim()) return;
    
    // Test localStorage availability
    if (!isLocalStorageAvailable()) {
      alert("Your browser's local storage is not available. Please enable cookies or try a different browser.");
      return;
    }
    
    setIsGenerating(true);
    setPlayerName(createName);
    
    // Generate a random 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Clear any existing data that might interfere
    localStorage.removeItem('roomJoining');
    localStorage.removeItem('paymentProof');
    
    // Create room data object
    const roomData = {
      isCreator: true,
      playerName: createName,
      roomId: code
    };
    
    try {
      // Store with try/catch to catch any errors
      localStorage.setItem('roomCreation', JSON.stringify(roomData));
      
      // Verify it was stored correctly
      const storedData = localStorage.getItem('roomCreation');
      console.log('Stored room creation data:', storedData);
      
      if (!storedData) {
        throw new Error('Data was not stored in localStorage');
      }
      
      // Navigate to game page after confirmation
      navigate(`/game/${code}`);
    } catch (e) {
      console.error('Error storing room data:', e);
      alert('There was a problem creating the room. Please try again.');
      setIsGenerating(false);
    }
  };

  // UPDATED: joinRoom function now verifies room exists before payment
  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    
    if (!roomCode.trim() || !joinName.trim()) {
      return;
    }
    
    // Check wallet connection
    if (!isConnected) {
      setJoinError('Please connect your wallet first');
      return;
    }
    
    // FIRST VERIFY THE ROOM EXISTS BEFORE PAYMENT
    setJoinError('Verifying room exists...');
    const roomExists = await verifyRoom(roomCode.toUpperCase());
    
    if (!roomExists) {
      setJoinError(roomVerificationError || 'Room does not exist. Please check the room code.');
      return;
    }
    
    // Room exists, now process payment
    setJoinError('Room verified. Processing payment...');
    
    // Process payment
    try {
      const payment = await makeRoomPayment(roomCode);
      
      if (!payment.success) {
        setJoinError(payment.error || 'Payment failed');
        return;
      }
      
      // Payment successful, proceed to join the room
      setPlayerName(joinName);
      
      // Clear any existing room creation data
      localStorage.removeItem('roomCreation');
      
      // Store payment proof in localStorage so we can send it when socket connects
      localStorage.setItem('paymentProof', JSON.stringify({
        address: account,
        txHash: payment.txHash,
        roomId: roomCode.toUpperCase()
      }));
      
      // Store joining info
      localStorage.setItem('roomJoining', JSON.stringify({
        isCreator: false,
        playerName: joinName,
        roomId: roomCode.toUpperCase()
      }));
      
      navigate(`/game/${roomCode.toUpperCase()}`);
    } catch {
      setJoinError('Failed to process payment');
    }
  };

  const handleCreateKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && createName.trim()) {
      generateRoomCode();
    }
  };
  
  // Helper function to get the appropriate button text
  const getJoinButtonText = () => {
    if (paymentStatus === 'pending') {
      return <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />;
    }
    
    if (roomVerificationStatus === 'checking') {
      return 'Verifying Room...';
    }
    
    return (
      <>
        Pay & Join Room
        <ArrowRight className="w-5 h-5" />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
  <div className="container mx-auto px-4 h-16 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Gamepad2 className="h-6 w-6 text-indigo-600" />
      <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">FundRaisely</h1>
    </div>
    <div className="flex items-center gap-4">
      <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">How It Works</a>
      <a href="#benefits" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Benefits</a>
      <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">FAQ</a>
      {/* Add the new Pitch Deck link here */}
      <Link to="/pitch-deck" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Pitch Deck</Link>
    </div>
  </div>
</header>
      
      {/* Hero Section */}
      <div className="pt-24 pb-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="relative">
            {/* Background Elements */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-300 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute top-20 -right-10 w-40 h-40 bg-indigo-300 rounded-full opacity-20 blur-2xl"></div>
            
            {/* Hero Content */}
            <div className="text-center relative z-10">
              <div className="inline-block p-3 bg-indigo-100 rounded-full mb-6 animate-pulse">
                <Gamepad2 className="h-12 w-12 text-indigo-600" />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent leading-tight">
                FundRaisely: Compliant Fundraising for Clubs & Charities
              </h1>
              
              <p className="text-lg md:text-xl text-indigo-900/70 max-w-3xl mx-auto mb-8">
                Host bingo, lotteries and quizzes with built-in compliance checks, automatically enforced limits, and comprehensive reporting for all regulatory requirements.
              </p>
              
              <p className="text-xl font-semibold text-indigo-700 mb-6 italic">
                "A world where fundraising is fun, fair, and fraud-proof."
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-medium">Regulatory Enforcement</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                  <Heart className="h-5 w-5 text-pink-600" />
                  <span className="text-sm font-medium">License Tracking</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Complete Audit Trail</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Room Creation/Joining Cards */}
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Room Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition hover:shadow-2xl hover:-translate-y-1">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6 mx-auto">
                <Dices className="h-8 w-8 text-indigo-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Fundraising Event</h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    onKeyPress={handleCreateKeyPress}
                    placeholder="Enter Charity/Club Name"
                    className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                    maxLength={20}
                  />
                  <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                
                <button
                  type="button"
                  onClick={generateRoomCode}
                  disabled={isGenerating || !createName.trim()}
                  className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold
                         hover:from-indigo-700 hover:to-purple-700 transform transition
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 shadow-md"
                >
                  {isGenerating ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Bingo Event
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Info className="h-4 w-4" />
                  <p>Free setup - all compliance checks & reporting included</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Join Room Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition hover:shadow-2xl hover:-translate-y-1">
            <div className="h-2 bg-gradient-to-r from-green-500 to-teal-500"></div>
            <div className="p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Join Event</h2>
              
              {/* Wallet Connection */}
              <div className="mb-6">
                <WalletConnect 
                  buttonText="Connect Payment Method" 
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold
                          hover:from-indigo-700 hover:to-purple-700 transform transition shadow-md"
                />
              </div>
              
              <form onSubmit={joinRoom} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    placeholder="Enter Your Name"
                    className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                    maxLength={20}
                  />
                  <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter Event Code"
                    className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                    maxLength={6}
                  />
                  <Dices className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                
                {/* Payment status */}
                {paymentStatus === 'success' && (
                  <div className="bg-green-100 text-green-800 p-3 rounded-lg">
                    <p className="font-medium">Payment Successful!</p>
                    {transactionHash && (
                      <a 
                        href={`#receipt-${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline"
                      >
                        View Receipt
                      </a>
                    )}
                  </div>
                )}
                
                {/* Error message */}
                {(paymentError || joinError) && (
                  <div className="bg-red-100 text-red-800 p-3 rounded-lg">
                    {paymentError || joinError}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={
                    !roomCode.trim() || 
                    !joinName.trim() || 
                    !isConnected || 
                    paymentStatus === 'pending' ||
                    roomVerificationStatus === 'checking'
                  }
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold
                         hover:from-green-700 hover:to-teal-700 transform transition
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 shadow-md"
                >
                  {getJoinButtonText()}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Wallet className="h-4 w-4" />
                  <p>Entry Fee: £5-£20 (secure card payment)</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div id="how-it-works" className="container mx-auto px-4 max-w-6xl mt-20 pt-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">A complete regulatory compliance system for all your fundraising activities</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Register & Verify</h3>
            <p className="text-gray-600">Organizations register with required licenses and permits for various fundraising activities</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Configure Events</h3>
            <p className="text-gray-600">Set up bingo games, lotteries or quizzes with built-in compliance parameters automatically enforced</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Run & Report</h3>
            <p className="text-gray-600">Host events with automatic compliance tracking and generate complete regulatory reports</p>
          </div>
        </div>
      </div>
      
      {/* Benefits Section */}
      <div id="benefits" className="container mx-auto px-4 max-w-6xl mt-20 pt-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Benefits for Clubs & Charities</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive compliance and management for all regulated fundraising activities</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">License & Permit Tracking</h3>
              <p className="text-gray-600">Automatically track and verify all required licenses and permits for each type of fundraising event</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Fraud Prevention</h3>
              <p className="text-gray-600">Eliminate accusations of favoritism with verifiable random selections and transparent winner determination</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Multiple Event Types</h3>
              <p className="text-gray-600">Run bingo games, lotteries, or skill-based quizzes - each with appropriate compliance controls built in</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Complete Audit Trail</h3>
              <p className="text-gray-600">Permanent, tamper-proof records of all transactions and winners for full regulatory compliance</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Enforced Compliance</h3>
              <p className="text-gray-600">System automatically enforces legal requirements like maximum stakes, minimum charity percentages, and age restrictions</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Public Trust Builder</h3>
              <p className="text-gray-600">Build donor confidence with transparent processes and verifiable audit trails that showcase your integrity</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div id="faq" className="container mx-auto px-4 max-w-6xl mt-20 pt-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Get answers to common questions about FundRaisely</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-2 text-gray-800">What fundraising events can I run?</h3>
            <p className="text-gray-600">Our platform supports bingo games, lotteries, and skill-based quizzes - each with appropriate compliance controls built in.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-2 text-gray-800">How does it ensure compliance?</h3>
            <p className="text-gray-600">We automatically enforce legal limits on stakes, minimum charity percentages, and age verification based on your jurisdiction.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-2 text-gray-800">What reporting features are included?</h3>
            <p className="text-gray-600">Comprehensive regulatory-ready reports showing all transactions, winners, and charitable distributions with verified audit trails.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-2 text-gray-800">Do I need special licenses?</h3>
            <p className="text-gray-600">Our system will guide you through the necessary permits for your organization and activity type, ensuring full compliance.</p>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="container mx-auto px-4 max-w-6xl mt-20 pt-10">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-8 py-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Run Compliant Fundraising Events?</h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">Join clubs and charities using FundRaisely to manage bingo, lotteries, and quizzes with automatic compliance controls</p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                type="button"
                onClick={() => document.getElementById('create-room-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-50 transition"
              >
                Host an Event
              </button>
              <button 
                type="button"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-800 transition"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="container mx-auto px-4 max-w-6xl mt-20 pt-10 pb-8">
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Gamepad2 className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-800">FundRaisely</h1>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 md:mb-0">
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Contact Us</a>
          </div>
          
          <div className="text-sm text-gray-500">
            © 2025 FundRaisely. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}