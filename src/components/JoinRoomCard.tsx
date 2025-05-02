import type React from 'react';
import { useState, useEffect } from 'react';
import { Users, Dices, ArrowRight, Wallet } from 'lucide-react';
import { getExplorerBaseUrl, getChainName } from '../utils/chainHelpers';
import { saveRoomJoiningData } from '../utils/localStorageUtils';
import { useAppKitState } from '@reown/appkit/react';
import { useSupportedNetworks } from '../hooks/useSupportedNetworks';
import VerifyRoomModal from './VerifyRoomModal';
import { useRoomVerification } from '../hooks/useRoomVerification';

interface JoinRoomCardProps {
  onJoinRoom: (roomData: { playerName: string; roomCode: string }) => Promise<void>;
  isReownConnected: boolean;
  formattedAddress: string;
  paymentStatus: 'idle' | 'pending' | 'success';
  roomVerificationStatus: 'idle' | 'checking' | 'exists' | 'not_exists' | 'error';
  transactionHash: string;
  paymentError: string;
  chainId: string | number;
}

const JoinRoomCard: React.FC<JoinRoomCardProps> = ({
  onJoinRoom,
  isReownConnected,
  formattedAddress,
  paymentStatus,
  roomVerificationStatus,
  transactionHash,
  paymentError,
  chainId,
}) => {
  console.log('🔄 JoinRoomCard rendering with props:', {
    isReownConnected,
    formattedAddress,
    paymentStatus,
    roomVerificationStatus,
    transactionHash,
    paymentError,
    chainId,
  });

  const [joinName, setJoinName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [namespace, setNamespace] = useState<string>('eip155');
  const [entryFee, setEntryFee] = useState<string>('0');
  const [hasJoined, setHasJoined] = useState(false); // ✅ NEW
  const [verifiedRoomData, setVerifiedRoomData] = useState<{
    hostName: string;
    entryFee: string;
    contractAddress: string;
    chainId: string | number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { selectedNetworkId } = useAppKitState();
  const { currentNetwork } = useSupportedNetworks();
  const currentChainId = selectedNetworkId?.split(':')[1];

  const { verifyRoom } = useRoomVerification();

  const isWrongChain =
    isReownConnected && currentChainId && chainId && currentChainId !== String(chainId);

  useEffect(() => {
    console.log('💾 JoinRoomCard state updated:', {
      joinName,
      roomCode,
      joinError,
      isWrongChain,
      currentChainId,
      targetChainId: chainId,
    });
  }, [joinName, roomCode, joinError, isWrongChain, currentChainId, chainId]);

  useEffect(() => {
    console.log('🔄 Payment status changed:', paymentStatus);
  }, [paymentStatus]);

  useEffect(() => {
    if (transactionHash) {
      console.log('💰 Transaction hash received:', transactionHash);
    }
  }, [transactionHash]);

  useEffect(() => {
    if (paymentError) {
      console.error('❌ Payment error:', paymentError);
    }
  }, [paymentError]);

  const handleVerifyRoom = async () => {
    console.log('🔍 Verifying room:', roomCode);
    setJoinError('');

    if (!roomCode.trim() || !joinName.trim()) {
      setJoinError('Please enter a name and room code');
      return;
    }

    if (!isReownConnected) {
      setJoinError('Please connect your wallet first');
      return;
    }

    try {
      const { exists, chainId, contractAddress, namespace, entryFee } = await verifyRoom(roomCode.toUpperCase());

      if (!exists || !chainId || !contractAddress) {
        setJoinError('Room not found or invalid');
        return;
      }

      setNamespace(namespace || 'eip155');
      setEntryFee(entryFee || '0');

      setVerifiedRoomData({
        hostName: 'Host', // replace if real name available
        entryFee: entryFee || '0',
        contractAddress,
        chainId,
      });

      setIsModalOpen(true);
    } catch (err) {
      console.error('❌ Room verification failed:', err);
      setJoinError('Verification failed. Please try again.');
    }
  };

  const getJoinButtonText = () => {
    if (paymentStatus === 'pending') {
      return <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />;
    }
    return (
      <>
        Verify Room
        <ArrowRight className="w-5 h-5" />
      </>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition hover:shadow-2xl hover:-translate-y-1">
      <div className="h-2 bg-gradient-to-r from-green-500 to-teal-500" />
      <div className="p-8">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
          <Users className="h-8 w-8 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Join Bingo Event</h2>

        <div className="mb-6">
          <appkit-button label="Connect" />

          {isReownConnected && (
            <div className="bg-green-100 text-green-800 p-3 rounded-lg text-center mt-4">
              <p className="font-medium">Connected: {formattedAddress}</p>
              <p className="text-sm mt-1">
                Network: {currentNetwork?.name || (currentChainId ? getChainName(currentChainId) : 'Unknown')}
              </p>
            </div>
          )}
        </div>

        <form className="space-y-4">
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

          {(paymentError || joinError) && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg">
              {paymentError || joinError}
            </div>
          )}

          {!hasJoined && (
            <button
              type="button"
              onClick={handleVerifyRoom}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold transform transition hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 shadow-md"
            >
              {getJoinButtonText()}
            </button>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Wallet className="h-4 w-4" />
            <p>Pay with crypto - Entry fee determined by event</p>
          </div>
        </form>
      </div>

      {verifiedRoomData && (
        <VerifyRoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={async () => {
            setIsModalOpen(false);
            await onJoinRoom({ playerName: joinName, roomCode: roomCode.toUpperCase() });

            const contractAddress = verifiedRoomData.contractAddress;

            saveRoomJoiningData({
              isCreator: false,
              playerName: joinName,
              roomId: roomCode.toUpperCase(),
              walletAddress: formattedAddress,
              contractAddress,
              chain: verifiedRoomData.chainId,
              namespace,
              entryFee,
            });

            setHasJoined(true); // ✅ Prevents button from re-appearing
          }}
          hostName={verifiedRoomData.hostName}
          entryFee={verifiedRoomData.entryFee}
          contractAddress={verifiedRoomData.contractAddress}
          chainId={verifiedRoomData.chainId}
        />
      )}
    </div>
  );
};

export default JoinRoomCard;



