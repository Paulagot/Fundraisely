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

interface Winner {
  id: string;
  name: string;
  wallet?: string;
}

interface GameOverScreenProps {
  lineWinners: Winner[];
  fullHouseWinners: Winner[];
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
  const [finalizeStep, setFinalizeStep] = useState<'line' | 'fullHouse' | 'done'>('line');

  // Restore from localStorage
  useEffect(() => {
    const roomId = localStorage.getItem('roomId');
    const savedHash = localStorage.getItem(`payment_tx_${roomId}`);
    const paymentStatus = localStorage.getItem(`payment_finalized_${roomId}`);

    if (savedHash) setTransactionHash(savedHash);
    if (paymentStatus === 'true') {
      setPaymentsFinalized(true);
      setFinalizeStep('done');
    }
  }, [setPaymentsFinalized]);

  // Listen for payments_finalized event
  useEffect(() => {
    if (!socket) return;

    const handlePaymentsFinalized = (data: { roomId: string; txHash?: string }) => {
      const roomId = localStorage.getItem('roomId');
      if (roomId && roomId === data.roomId) {
        console.log('[GameOverScreen] 🎉 payments_finalized:', data);
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

  // Fallback: Poll contract for payment status
  useEffect(() => {
    if (paymentsFinalized || !walletClient || !currentNetwork) return;

    const contractAddress = localStorage.getItem('contractAddress') as `0x${string}` | null;
    if (!contractAddress) return;

    const checkFinalization = async () => {
      try {
        const [rowDeclared, fullHouseDeclared] = await Promise.all([
          readContract(walletClient, { address: contractAddress, abi: FundRaiselyBingoRoomABI, functionName: 'rowDeclared' }),
          readContract(walletClient, { address: contractAddress, abi: FundRaiselyBingoRoomABI, functionName: 'fullHouseDeclared' }),
        ]);

        if (rowDeclared && fullHouseDeclared) {
          setPaymentsFinalized(true);
          setFinalizeStep('done');
          localStorage.setItem(`payment_finalized_${localStorage.getItem('roomId')}`, 'true');
        }
      } catch (err) {
        console.error('[GameOverScreen] Contract poll error:', err);
      }
    };

    const interval = setInterval(checkFinalization, 10000);
    return () => clearInterval(interval);
  }, [walletClient, currentNetwork, paymentsFinalized, setPaymentsFinalized]);

  const handleFinalizePayments = async () => {
    const contractAddress = localStorage.getItem('contractAddress') as `0x${string}` | null;
    if (!contractAddress || !walletClient || !address) {
      setError('Missing contract or wallet connection.');
      return;
    }

    try {
      setIsFinalizing(true);
      setError('');

      if (finalizeStep === 'line' && lineWinners.length > 0) {
        const alreadyDeclared = await readContract(walletClient, {
          address: contractAddress,
          abi: FundRaiselyBingoRoomABI,
          functionName: 'rowDeclared',
        });

        if (!alreadyDeclared) {
          const txHash = await writeContract(walletClient, {
            address: contractAddress,
            abi: FundRaiselyBingoRoomABI,
            functionName: 'declareRowWinners',
            args: [lineWinners.map(w => w.wallet).filter((w): w is `0x${string}` => !!w)],
            account: address,
          });
          setTransactionHash(txHash);
          localStorage.setItem(`payment_tx_${localStorage.getItem('roomId')}`, txHash);
        }
        setFinalizeStep('fullHouse');
        return;
      }

      if (finalizeStep === 'fullHouse' && fullHouseWinners.length > 0) {
        const alreadyDeclared = await readContract(walletClient, {
          address: contractAddress,
          abi: FundRaiselyBingoRoomABI,
          functionName: 'fullHouseDeclared',
        });

        if (!alreadyDeclared) {
          const txHash = await writeContract(walletClient, {
            address: contractAddress,
            abi: FundRaiselyBingoRoomABI,
            functionName: 'declareFullHouseWinners',
            args: [fullHouseWinners.map(w => w.wallet).filter((w): w is `0x${string}` => !!w)],
            account: address,
          });
          setTransactionHash(txHash);
          localStorage.setItem(`payment_tx_${localStorage.getItem('roomId')}`, txHash);
        }
        markAsFinalized();
        setFinalizeStep('done');
      }
    } catch (err) {
      setError(err.shortMessage || 'Contract error');
    } finally {
      setIsFinalizing(false);
    }
  };

  const markAsFinalized = () => {
    const roomId = localStorage.getItem('roomId');
    if (roomId) {
      localStorage.setItem(`payment_finalized_${roomId}`, 'true');
      if (transactionHash) localStorage.setItem(`payment_tx_${roomId}`, transactionHash);
    }
    setPaymentsFinalized(true);
    if (socket && roomId) socket.emit('payments_finalized', { roomId, txHash: transactionHash });
  };

  const handleReturnToLobby = () => {
    const roomId = localStorage.getItem('roomId');
    if (socket && roomId) socket.emit('leave_room', { roomId });
    ['roomId', 'playerName', 'roomCreation', 'roomJoining', 'paymentProof', 'contractAddress', 'wagmi.store', '@appkit/portfolio_cache', 'lace-wallet-mode', 'debug']
      .forEach(key => localStorage.removeItem(key));
    navigate('/bingoblitz');
  };

  const explorerUrl = currentNetwork ? getExplorerBaseUrl(currentNetwork.id) : 'https://etherscan.io';

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <Trophy className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Complete!</h1>
        <p className="text-gray-600">Thank you for playing FundRaisely Bingo</p>
      </div>

      <WinnerSection title="Line Winners" color="indigo" winners={lineWinners} />
      <WinnerSection title="Full House Winners" color="purple" winners={fullHouseWinners} />

      {transactionHash && (
        <div className="mt-6 p-4 rounded-lg bg-blue-50 text-center">
          <h4 className="text-blue-800 font-semibold mb-2">Transaction submitted!</h4>
          <a href={`${explorerUrl}/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
            View Transaction
          </a>
        </div>
      )}

      {isHost && (
        <div className="mb-6 mt-6">
          <div className={`p-4 rounded-lg ${paymentsFinalized ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <h3 className={`font-medium mb-2 ${paymentsFinalized ? 'text-green-800' : 'text-yellow-800'}`}>Payment Status</h3>
            {paymentsFinalized ? (
              <div className="flex items-center text-green-700">
                <Check className="h-5 w-5 mr-2" /> Prize payments finalized!
              </div>
            ) : (
              <>
                <p className="text-yellow-700 mb-3">Finalize prize payments:</p>
                {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
                <button
                  onClick={handleFinalizePayments}
                  disabled={isFinalizing || finalizeStep === 'done'}
                  className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2 disabled:bg-yellow-400 disabled:opacity-50"
                >
                  {isFinalizing ? <Loader className="h-5 w-5 animate-spin" /> : (finalizeStep === 'line' ? 'Declare Line Winner' : 'Declare Full House Winner')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {!isHost && !paymentsFinalized && (
        <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 text-center rounded-lg">
          ⏳ Waiting for host to finalize payments...
        </div>
      )}

      {!isHost && paymentsFinalized && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 text-center rounded-lg">
          ✅ Payments finalized! You can return to the lobby.
        </div>
      )}

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={handleReturnToLobby}
          disabled={!paymentsFinalized}
          className={`px-6 py-3 ${paymentsFinalized ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400'} text-white rounded-lg flex items-center gap-2 ${!paymentsFinalized && 'opacity-50 cursor-not-allowed'}`}
        >
          <Home className="h-5 w-5" /> Return to Lobby
        </button>
      </div>
    </div>
  );
}





