// src/pages/TestCampaign.tsx
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useAppKitAccount } from '@reown/appkit/react';
import { useReownRoomPayment } from '../hooks/useReownRoomPayments';
import { useRoomVerification } from '../hooks/useRoomVerification';
import {
  isLocalStorageAvailable,
  saveRoomCreationData,
  saveRoomJoiningData,
  clearAllRoomData,
} from '../utils/localStorageUtils';
import { chainInfo } from '../constants/contractFactoryAddresses';
import SimpleHeader from '../components/SimpleHeader';
import CreateRoomCard from '../components/CreateRoomCard';
import JoinRoomCard from '../components/JoinRoomCard';
import Hfooter from '../components/hFooter';

// Initialize Socket.IO client
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(SOCKET_URL, { autoConnect: false });

export function TestCampaign() {
  console.log('[TestCampaign] 🚀 Rendering TestCampaign component');

  const [isGenerating, setIsGenerating] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [roomId, setRoomId] = useState('');
  const [currentChainId, setCurrentChainId] = useState<string | number>('');

  console.log('[TestCampaign] 📋 Initial state', {
    isGenerating,
    joinError,
    roomId,
    currentChainId,
  });

  const navigate = useNavigate();
  const { setPlayerName, resetGameState } = useGameStore((state) => ({
    setPlayerName: state.setPlayerName,
    resetGameState: state.resetGameState,
  }));

  const { address, isConnected: isReownConnected } = useAppKitAccount();
  const {
    makeRoomPayment: makeReownPayment,
    paymentStatus: reownPaymentStatus,
    transactionHash: reownTransactionHash,
    error: reownPaymentError,
  } = useReownRoomPayment();

  const formattedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  const {
    verifyRoom,
    status: roomVerificationStatus,
    error: roomVerificationError,
  } = useRoomVerification();

  console.log('[TestCampaign] 📋 External state', {
    address,
    isReownConnected,
    formattedAddress,
    reownPaymentStatus,
    reownTransactionHash,
    reownPaymentError,
    roomVerificationStatus,
    roomVerificationError,
  });

  // Socket event listeners
  useEffect(() => {
    console.log('[TestCampaign] 🔌 Setting up socket event listeners', { socketId: socket.id });

    const handleConnect = () => {
      console.log('[TestCampaign] ✅ Socket connected', { socketId: socket.id });
    };

    const handleDisconnect = (reason: string) => {
      console.error('[TestCampaign] 🚫 Socket disconnected', { reason, socketId: socket.id });
    };

    const handleError = (error: any) => {
      console.error('[TestCampaign] ❌ Socket error', { error });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);

    return () => {
      console.log('[TestCampaign] 🧹 Cleaning up socket event listeners', { socketId: socket.id });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
    };
  }, []);

  useEffect(() => {
    console.log('[TestCampaign] 🔄 Initializing component');
    resetGameState();
    clearAllRoomData();

    try {
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('@appkit/portfolio_cache');
      localStorage.removeItem('lace-wallet-mode');
      localStorage.removeItem('debug');
      console.log('[TestCampaign] ✅ Cleared localStorage items');
    } catch (e) {
      console.error('[TestCampaign] ❌ Error cleaning up storage', e);
    }

    // Generate random roomId
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomId(result);
    console.log('[TestCampaign] 🆕 Generated roomId', { roomId: result });

    socket.connect();
    console.log('[TestCampaign] 📡 Socket connecting');

    return () => {
      console.log('[TestCampaign] 🧹 Disconnecting socket on cleanup');
      socket.disconnect();
    };
  }, [resetGameState]);

  const handleCreateRoom = async (roomData: {
    playerName: string;
    entryFee: string;
    chain: number;
    walletAddress: string;
    roomId: string;
    contractAddress: string;
  }) => {
    console.log('[TestCampaign] 🚀 handleCreateRoom called', { roomData });

    if (!isLocalStorageAvailable()) {
      console.error('[TestCampaign] 🚫 Local storage unavailable');
      alert("Your browser's local storage is not available. Please enable cookies or try a different browser.");
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    setPlayerName(roomData.playerName);
    clearAllRoomData();
    console.log('[TestCampaign] ✅ Set playerName and cleared room data', { playerName: roomData.playerName });

    const factoryAddress = chainInfo[roomData.chain]?.factoryAddress;
    if (!factoryAddress) {
      console.error('[TestCampaign] 🚫 No factory contract for chain', { chain: roomData.chain });
      alert('No factory contract found for this chain.');
      setIsGenerating(false);
      return;
    }

    const roomCreationData = {
      isCreator: true as const,
      playerName: roomData.playerName,
      roomId: roomData.roomId,
      entryFee: roomData.entryFee,
      chain: roomData.chain,
      contractAddress: roomData.contractAddress,
      walletAddress: roomData.walletAddress,
    };

    console.log('[TestCampaign] 🧩 Saving roomCreationData', roomCreationData);
    const saved = saveRoomCreationData(roomCreationData);
    if (!saved) {
      console.error('[TestCampaign] ❌ Failed to save roomCreationData');
      alert('There was a problem storing room creation data.');
      setIsGenerating(false);
      return;
    }

    // Store walletAddress for rejoin
    localStorage.setItem('walletAddress', roomData.walletAddress);
    console.log('[TestCampaign] 💾 Stored walletAddress', { walletAddress: roomData.walletAddress });

    console.log('[TestCampaign] ➡️ Navigating to game', { roomId: roomData.roomId });
    navigate(`/game/${roomData.roomId}`);
  };

  const handleJoinRoom = async (roomData: { playerName: string; roomCode: string }) => {
    console.log('[TestCampaign] 🚀 handleJoinRoom called', { roomData });
    setJoinError('');

    try {
      console.log('[TestCampaign] 🔍 Verifying room', { roomCode: roomData.roomCode });
      setJoinError('Verifying room exists...');
      const { exists, chainId, contractAddress } = await verifyRoom(roomData.roomCode.toUpperCase());

      if (!exists) {
        console.error('[TestCampaign] 🚫 Room does not exist', { roomCode: roomData.roomCode });
        setJoinError(roomVerificationError || 'Room does not exist. Please check the room code.');
        return;
      }

      if (!chainId || !contractAddress) {
        console.error('[TestCampaign] 🚫 Invalid room configuration', { chainId, contractAddress });
        setJoinError('Room configuration invalid.');
        return;
      }

      setCurrentChainId(chainId);
      console.log('[TestCampaign] ✅ Room verified', { chainId, contractAddress });

      console.log('[TestCampaign] 💸 Initiating payment for room', { roomCode: roomData.roomCode, chainId });
      setJoinError('Room verified. Setting Spending Limit then requesting payment...');

      const payment = await makeReownPayment(roomData.roomCode, chainId);

      if (!payment.success) {
        console.error('[TestCampaign] ❌ Payment failed', { error: payment.error });
        setJoinError(payment.error || 'Payment failed');
        return;
      }

      if (payment.txHash === 'already-joined') {
        console.log('[TestCampaign] 🔄 Player already joined, proceeding to room', { txHash: payment.txHash });
        proceedToJoinRoom(roomData, payment.txHash, contractAddress, chainId);
      } else {
        console.log('[TestCampaign] ⏳ Payment sent, waiting for confirmation', { txHash: payment.txHash });
        setJoinError('Payment sent! Waiting for confirmation...');
        setTimeout(() => {
          console.log('[TestCampaign] 🔄 Proceeding to room after payment confirmation');
          proceedToJoinRoom(roomData, payment.txHash, contractAddress, chainId);
        }, 15000);
      }
    } catch (error) {
      console.error('[TestCampaign] ❌ Payment error', error);
      setJoinError(error instanceof Error ? error.message : 'Failed to process payment');
    }
  };

  const proceedToJoinRoom = (
    roomData: { playerName: string; roomCode: string },
    txHash: string,
    contractAddress: string,
    chainId: string | number
  ) => {
    console.log('[TestCampaign] 🚀 proceedToJoinRoom called', {
      roomData,
      txHash,
      contractAddress,
      chainId,
    });
    setPlayerName(roomData.playerName);
    clearAllRoomData();
    console.log('[TestCampaign] ✅ Set playerName and cleared room data', { playerName: roomData.playerName });

    const roomJoiningData = {
      isCreator: false,
      playerName: roomData.playerName,
      roomId: roomData.roomCode.toUpperCase(),
      walletAddress: address || '',
      contractAddress: contractAddress,
      chain: chainId,
    };

    console.log('[TestCampaign] 🧩 Saving roomJoiningData', roomJoiningData);
    saveRoomJoiningData(roomJoiningData);

    console.log('[TestCampaign] 💾 Saving paymentProof', {
      roomId: roomData.roomCode.toUpperCase(),
      address,
      txHash,
    });
    localStorage.setItem(
      'paymentProof',
      JSON.stringify({
        roomId: roomData.roomCode.toUpperCase(),
        address: address,
        txHash: txHash,
      })
    );

    console.log('[TestCampaign] ➡️ Navigating to game', { roomId: roomData.roomCode.toUpperCase() });
    navigate(`/game/${roomData.roomCode.toUpperCase()}`);
  };

  console.log('[TestCampaign] ↩️ Rendering component', {
    isGenerating,
    joinError,
    roomId,
    currentChainId,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-20">
      <SimpleHeader />

      {/* Action Cards Section - Side by side on large screens, stacked on small */}
      <section className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">Bingo Blitz: Chain Challenge</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Create Room Card */}
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-indigo-800">Create Bingo Blitz Room</h3>
              <CreateRoomCard
                onCreateRoom={handleCreateRoom}
                isGenerating={isGenerating}
                roomId={roomId}
              />
            </div>

            {/* Join Room Card */}
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-indigo-800">Join Bingo Blitz Room</h3>
              <JoinRoomCard
                onJoinRoom={handleJoinRoom}
                isReownConnected={isReownConnected}
                formattedAddress={formattedAddress}
                paymentStatus={reownPaymentStatus === 'pending' ? 'pending' : reownPaymentStatus === 'success' ? 'success' : 'idle'}
                roomVerificationStatus={roomVerificationStatus}
                transactionHash={reownTransactionHash}
                paymentError={reownPaymentError || joinError}
                chainId={currentChainId}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Info Section */}
      <section id="about-campaign" className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">About This Campaign</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <p className="text-xl font-semibold text-indigo-800 mb-4">
                Welcome to the <span className="font-bold">Fundraisely Test Drive!</span> 🚀🎉
              </p>
              <p className="text-lg text-gray-700 mb-4">
                We've built a Web3 bingo game where <em>anyone</em> can host, <em>everyone</em> can play, and <strong>we all</strong> help decide where to launch the real thing.
              </p>
            </div>

            <div className="mb-6">
              <p className="text-lg font-semibold text-indigo-700 mb-2">Here's the deal:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>We're testing on a few different blockchains.</li>
                <li>Whichever chain earns the most wins the full launch. 🏆</li>
                <li>Every game = one bingo card, one shot at winning, tons of fun.</li>
              </ul>
            </div>

            <div className="mb-6">
              <p className="text-lg font-semibold text-indigo-700 mb-2">When you host a game:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Set your own card price 💸</li>
                <li>Pick a chain 🌐</li>
                <li>Confirm the transaction ✅</li>
                <li>Get a room number to share with players.</li>
              </ul>
              <p className="text-lg text-indigo-600 font-medium mt-2">
                ⚡ Rooms are created instantly — no waiting around.
              </p>
            </div>

            <div className="mb-6">
              <p className="text-lg font-semibold text-indigo-700 mb-2">
                Each game has a <span className="font-bold">max pot of 1,000 USDC</span>, and the split goes like this:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><span className="font-bold">15%</span> helps us build the full Fundraisely app.</li>
                <li><span className="font-bold">25%</span> goes straight to the host.</li>
                <li><span className="font-bold">60%</span> goes to the winners (30% for line winners, 70% for full house).</li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="text-lg font-semibold text-indigo-700 mb-2">
                <span className="font-bold">Zero cheating. Zero shady stuff.</span>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Numbers are drawn by the system.</li>
                <li>The host <em>calls out</em> numbers, but the system auto-checks wins behind the scenes.</li>
                <li>Payouts happen automatically when the game's done.</li>
              </ul>
            </div>

            <p className="text-lg text-indigo-800 font-medium mt-6">
              All you need is a little USDC and a few cents for blockchain fees. Let's go! 🏁
            </p>
          </div>
        </div>
      </section>

      {/* Hosts Section */}
      <section id="for-hosts" className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">For Hosts</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-lg text-gray-700 mb-4">
              Want to bring your community together <em>and</em> earn some rewards? Hosting a bingo game is super easy:
            </p>

            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Pick your card price.</li>
              <li>Pick your chain.</li>
              <li>Confirm the setup.</li>
              <li>Share your room number.</li>
              <li>Play live on Zoom, Twitter Spaces, Discord — wherever you hang out.</li>
            </ul>

            <p className="text-lg text-indigo-700 font-semibold">
              As the Host, you earn <span className="font-bold">32%</span> of the total game intake just for running the game. 🙌 No tech skills needed — just your wallet and some good vibes.
            </p>
          </div>
        </div>
      </section>

      {/* Players Section */}
      <section id="for-players" className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">For Players</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-lg text-gray-700 mb-4">
              Ready to join the fun? 🎉 Here's what you'll need:
            </p>

            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>A little USDC for your card.</li>
              <li>A couple cents (or less) for gas fees.</li>
              <li>The room number from your Host.</li>
            </ul>

            <p className="text-lg text-gray-700 mb-4">
              Once you join:
            </p>

            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Play with one bingo card.</li>
              <li>Chase that Line Win or Full House!</li>
              <li>Winnings are paid out automatically when the game wraps up.</li>
            </ul>

            <p className="text-lg text-indigo-700 font-semibold">
              Simple, fun, and fair — the way bingo <em>should</em> be.
            </p>
          </div>
        </div>
      </section>

      {/* About Fundraisely Section */}
      <section id="about-fundraisely" className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-900">About Fundraisely</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-lg text-gray-700 mb-6">
              This isn't just about bingo. We're building <span className="font-bold">Fundraisely</span> — a full platform to help communities and charities run legit fundraising events like bingo, raffles, and more — all on blockchain for transparency and fairness.
            </p>

            <p className="text-lg text-gray-700 mb-6">
              This test campaign helps us get there — faster. 🛠️
            </p>

            <p className="text-lg text-indigo-700">
              Want the full inside scoop? Check out our <span className="font-bold">Pitch Deck</span> (you'll need an access code — DM us if you want it!)
            </p>
          </div>
        </div>
      </section>

      <Hfooter />
    </div>
  );
}