// src/components/GameOverScreen.tsx
import { useNavigate } from 'react-router-dom';
import { Trophy, Home, Check, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAccount, useWalletClient } from 'wagmi';
import { readContract, writeContract } from 'viem/actions';
import FundRaiselyBingoRoomABI from '../abis/FundRaiselyBingoRoom.json';
import { getExplorerBaseUrl } from '../utils/chainHelpers';
import WinnerSection from './WinnerSection';
import { useSupportedNetworks } from '../hooks/useSupportedNetworks';

interface GameOverScreenProps {
  lineWinners: Array<{ id: string; name: string; wallet?: string }>;
  fullHouseWinners: Array<{ id: string; name: string; wallet?: string }>;
  onStartNewGame?: () => void;
  isHost: boolean;
}

export function GameOverScreen({
  lineWinners,
  fullHouseWinners,
  isHost,
}: GameOverScreenProps) {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { currentNetwork } = useSupportedNetworks();
  const { socket, paymentsFinalized, setPaymentsFinalized } = useGameStore();
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [finalizeStep, setFinalizeStep] = useState<'line' | 'fullHouse' | 'payments' | 'done'>('line');

  useEffect(() => {
    const roomId = localStorage.getItem('roomId');
    const paymentStatus = localStorage.getItem(`payment_finalized_${roomId}`);
    if (paymentStatus === 'true') {
      setPaymentsFinalized(true);
      setFinalizeStep('done');
    }
  }, [setPaymentsFinalized]);

  useEffect(() => {
    if (!socket) return;

    const handlePaymentsFinalized = (data: { roomId: string; txHash?: string }) => {
      const roomId = localStorage.getItem('roomId');
      if (roomId && roomId === data.roomId) {
        setPaymentsFinalized(true);
        setFinalizeStep('done');
        if (data.txHash) {
          setTransactionHash(data.txHash);
          localStorage.setItem(`payment_tx_${roomId}`, data.txHash);
        }
        localStorage.setItem(`payment_finalized_${roomId}`, 'true');
      }
    };

    socket.on('payments_finalized', handlePaymentsFinalized);
    return () => socket.off('payments_finalized', handlePaymentsFinalized);
  }, [socket, setPaymentsFinalized]);

  const extractErrorMessage = (error: any): string => {
    if (!error) return 'Unknown error';
    if (error.shortMessage) return error.shortMessage;
    if (typeof error.message === 'string') return error.message;
    return 'Unknown contract error';
  };

  const handleFinalizePayments = async () => {
    const contractAddress = localStorage.getItem('contractAddress') as `0x${string}`;
    if (!contractAddress || !walletClient || !address) {
      setError('Missing contract address or wallet connection.');
      return;
    }

    try {
      setIsFinalizing(true);
      setError('');

      // Step 1: Declare Line Winners
      if (finalizeStep === 'line' && lineWinners.length > 0) {
        setStatus('Declaring line winners...');
        console.log('[GameOverScreen] 📤 Preparing declareRowWinners', { winners: lineWinners.map(w => w.wallet) });
        const rowDeclared = await readContract(walletClient, {
          address: contractAddress,
          abi: FundRaiselyBingoRoomABI,
          functionName: 'rowDeclared',
        });
        console.log('[GameOverScreen] 📡 rowDeclared', { rowDeclared });
        if (!rowDeclared) {
          const txHash = await writeContract(walletClient, {
            address: contractAddress,
            abi: FundRaiselyBingoRoomABI,
            functionName: 'declareRowWinners',
            args: [lineWinners.map(w => w.wallet).filter((w): w is string => !!w)],
            account: address,
          });
          setTransactionHash(txHash);
          console.log('[GameOverScreen] ✅ Declared row winners', { txHash });
          setFinalizeStep('fullHouse');
        } else {
          setFinalizeStep('fullHouse');
        }
        setStatus('');
        return;
      }

      // Step 2: Declare Full House Winners
      if (finalizeStep === 'fullHouse' && fullHouseWinners.length > 0) {
        setStatus('Declaring full house winners...');
        console.log('[GameOverScreen] 📤 Preparing declareFullHouseWinners', { winners: fullHouseWinners.map(w => w.wallet) });
        const fullHouseDeclared = await readContract(walletClient, {
          address: contractAddress,
          abi: FundRaiselyBingoRoomABI,
          functionName: 'fullHouseDeclared',
        });
        console.log('[GameOverScreen] 📡 fullHouseDeclared', { fullHouseDeclared });
        if (!fullHouseDeclared) {
          const txHash = await writeContract(walletClient, {
            address: contractAddress,
            abi: FundRaiselyBingoRoomABI,
            functionName: 'declareFullHouseWinners',
            args: [fullHouseWinners.map(w => w.wallet).filter((w): w is string => !!w)],
            account: address,
          });
          setTransactionHash(txHash);
          console.log('[GameOverScreen] ✅ Declared full house winners', { txHash });
          setFinalizeStep('payments');
        } else {
          setFinalizeStep('payments');
        }
        setStatus('');
        return;
      }

      // Step 3: Process Payments
      if (finalizeStep === 'payments') {
        setStatus('Finalizing prize payouts...');
        console.log('[GameOverScreen] 📤 Preparing processAllPayments');
        const isGameOver = await readContract(walletClient, {
          address: contractAddress,
          abi: FundRaiselyBingoRoomABI,
          functionName: 'isGameOver',
        });
        console.log('[GameOverScreen] 📡 isGameOver', { isGameOver });
        if (!isGameOver) {
          setError('Game is not fully completed yet. Please declare all winners.');
          return;
        }
        const txHash = await writeContract(walletClient, {
          address: contractAddress,
          abi: FundRaiselyBingoRoomABI,
          functionName: 'processAllPayments',
          account: address,
        });
        setTransactionHash(txHash);
        console.log('[GameOverScreen] ✅ Processed payments', { txHash });
        markAsFinalized(txHash);
        setFinalizeStep('done');
      }
    } catch (err: any) {
      console.error('[GameOverScreen] 🚫 Finalize error:', err);
      const msg = extractErrorMessage(err);
      setError(msg);
    } finally {
      setIsFinalizing(false);
      setStatus('');
    }
  };

  const markAsFinalized = (txHash?: string) => {
    const roomId = localStorage.getItem('roomId');
    if (roomId) {
      localStorage.setItem(`payment_finalized_${roomId}`, 'true');
      if (txHash) {
        localStorage.setItem(`payment_tx_${roomId}`, txHash);
      }
    }
    setPaymentsFinalized(true);
    if (socket && roomId) {
      socket.emit('payments_finalized', { roomId, txHash });
    }
  };

  const handleReturnToLobby = () => {
    const roomId = localStorage.getItem('roomId');
    if (socket && roomId) socket.emit('leave_room', { roomId });

    [
      'roomId', 'playerName', 'roomCreation', 'roomJoining',
      'paymentProof', 'contractAddress', 'wagmi.store',
      '@appkit/portfolio_cache', 'lace-wallet-mode', 'debug'
    ].forEach(key => localStorage.removeItem(key));

    navigate('/bingoblitz');
  };

  const explorerUrl = currentNetwork
    ? getExplorerBaseUrl(currentNetwork.id)
    : 'https://etherscan.io';

  const getButtonText = () => {
    if (isFinalizing) return 'Processing Transaction...';
    switch (finalizeStep) {
      case 'line': return 'Declare Line Winner';
      case 'fullHouse': return 'Declare Full House Winner';
      case 'payments': return 'Finalize Payments';
      case 'done': return 'Payments Finalized';
      default: return 'Finalize Prize Payments';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
          <Trophy className="h-12 w-12 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Complete!</h1>
        <p className="text-gray-600">Thank you for playing FundRaisely Bingo</p>
      </div>

      <WinnerSection title="Line Winners" color="indigo" winners={lineWinners} />
      <WinnerSection title="Full House Winners" color="purple" winners={fullHouseWinners} />

      {transactionHash && (
        <div className="mt-6 p-4 rounded-lg bg-blue-50 text-center">
          <h4 className="text-blue-800 font-semibold mb-2">Transaction submitted!</h4>
          <a
            href={`${explorerUrl}/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm"
          >
            View Transaction
          </a>
        </div>
      )}

      {isHost && (
        <div className="mb-6 mt-6">
          <div className={`p-4 rounded-lg ${paymentsFinalized ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <h3 className={`font-medium mb-2 ${paymentsFinalized ? 'text-green-800' : 'text-yellow-800'}`}>
              Payment Status
            </h3>
            {paymentsFinalized ? (
              <div className="flex items-center text-green-700">
                <Check className="h-5 w-5 mr-2" />
                <span>Prize payments have been finalized!</span>
              </div>
            ) : (
              <>
                <p className="text-yellow-700 mb-3">
                  Please complete the following steps to finalize prize payments.
                </p>
                {error && (
                  <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                  </div>
                )}
                {status && (
                  <div className="mb-3 p-2 bg-blue-50 text-blue-700 rounded">
                    {status}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleFinalizePayments}
                  disabled={isFinalizing || finalizeStep === 'done'}
                  className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-yellow-400 disabled:opacity-50"
                >
                  {isFinalizing ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Processing Transaction...
                    </>
                  ) : (
                    <>
                      {getButtonText()}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {!paymentsFinalized && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-center rounded-lg">
          ⚠️ Please wait! Prize payments are still processing.  
          <br />
          Leaving early may result in not receiving your winnings.
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
        <button
          type="button"
          onClick={handleReturnToLobby}
          disabled={!paymentsFinalized}
          className={`px-6 py-3 ${!paymentsFinalized ? 'bg-gray-400' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-lg transition-all shadow-md flex items-center justify-center gap-2 ${!paymentsFinalized ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Home className="h-5 w-5" />
          Return to Lobby
        </button>
      </div>
    </div>
  );
}



