// src/hooks/bingo/useRoomHandlers.ts
import {
  saveRoomCreationData,
  saveRoomJoiningData,
  clearAllRoomData,
  isLocalStorageAvailable,
} from '../../utils/localStorageUtils';
import { chainInfo } from '../../constants/contractFactoryAddresses';

interface CreateRoomParams {
  playerName: string;
  entryFee: string;
  chain: number | string;
  walletAddress: string;
  roomId: string;
  contractAddress: string;
  namespace: string;
}

interface JoinRoomParams {
  playerName: string;
  roomCode: string;
}

interface WalletContext {
  currentAddress?: string;
  namespace?: 'eip155' | 'solana';
}

export function useRoomHandlers({
  navigate,
  setPlayerName,
  setJoinError,
  setCurrentChainId,
  walletContext,
  verifyRoom,
  makeReownPayment,
}: {
  navigate: (path: string) => void;
  setPlayerName: (name: string) => void;
  setJoinError: (msg: string) => void;
  setCurrentChainId: (id: string | number) => void;
  walletContext: WalletContext;
  verifyRoom: (roomCode: string) => Promise<{ exists: boolean; chainId: string | number; contractAddress: string }>;
  makeReownPayment: (
    roomCode: string,
    chainId: string | number
  ) => Promise<{ success: boolean; txHash: string; error?: string }>;
}) {
  const handleCreateRoom = async (roomData: CreateRoomParams) => {
    console.log('[handleCreateRoom] 🏗️ Creating room with:', roomData);

    if (!isLocalStorageAvailable()) {
      alert("Local storage unavailable. Enable cookies or try a different browser.");
      return;
    }

    setPlayerName(roomData.playerName);
    clearAllRoomData();

    const factoryAddress = chainInfo[roomData.chain]?.factoryAddress;
    if (!factoryAddress) {
      alert('No factory contract found for this chain.');
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
      namespace: roomData.namespace,
    };

    console.log('[handleCreateRoom] 💾 Saving roomCreationData:', roomCreationData);
    const saved = saveRoomCreationData(roomCreationData);
    if (!saved) {
      alert('Problem storing room creation data.');
      return;
    }

    localStorage.setItem('walletAddress', roomData.walletAddress ?? '');
    console.log('[handleCreateRoom] 🧭 Navigating to game room:', roomData.roomId);
    navigate(`/game/${roomData.roomId}`);
  };

  const handleJoinRoom = async (roomData: JoinRoomParams) => {
    console.log('[handleJoinRoom] 🔍 Verifying room with code:', roomData.roomCode);
    setJoinError('Verifying room exists...');
    const { exists, chainId, contractAddress } = await verifyRoom(roomData.roomCode.toUpperCase());

    if (!exists) {
      setJoinError('Room does not exist. Please check the room code.');
      return;
    }
    if (!chainId || !contractAddress) {
      setJoinError('Room configuration invalid.');
      return;
    }

    console.log('[handleJoinRoom] ✅ Room verified:', { chainId, contractAddress });
    setCurrentChainId(chainId);
    setJoinError('Room verified. Requesting payment...');

    const payment = await makeReownPayment(roomData.roomCode, chainId);
    console.log('[handleJoinRoom] 💸 Payment response:', payment);

    if (!payment.success) {
      setJoinError(payment.error || 'Payment failed');
      return;
    }

    const txHash = payment.txHash;
    setJoinError(txHash === 'already-joined' ? 'Already joined. Proceeding...' : 'Payment sent! Waiting...');

    setTimeout(() => {
      console.log('[handleJoinRoom] 🔄 Proceeding after delay to join room');
      proceedToJoinRoom(roomData, txHash, contractAddress, chainId);
    }, 15000);
  };

  const proceedToJoinRoom = (
    roomData: JoinRoomParams,
    txHash: string,
    contractAddress: string,
    chainId: string | number
  ) => {
    const walletAddress = walletContext.currentAddress;
    console.log('[proceedToJoinRoom] 🧠 Using wallet address:', walletAddress);
    setPlayerName(roomData.playerName);
    clearAllRoomData();

    const roomJoiningData = {
      isCreator: false as const,
      playerName: roomData.playerName,
      roomId: roomData.roomCode.toUpperCase(),
      walletAddress: walletAddress || '',
      contractAddress,
      chain: chainId,
      namespace: walletContext.namespace ?? 'eip155',
      entryFee: '0',
    };

    console.log('[proceedToJoinRoom] 💾 Saving roomJoiningData:', roomJoiningData);
    saveRoomJoiningData(roomJoiningData);

    localStorage.setItem(
      'paymentProof',
      JSON.stringify({
        roomId: roomData.roomCode.toUpperCase(),
        address: walletAddress,
        txHash,
      })
    );
    console.log('[proceedToJoinRoom] 🚪 Navigating to room:', roomData.roomCode.toUpperCase());
    navigate(`/game/${roomData.roomCode.toUpperCase()}`);
  };

  return {
    handleCreateRoom,
    handleJoinRoom,
  };
}

