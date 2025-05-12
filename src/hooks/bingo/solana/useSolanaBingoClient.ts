import { useState, useMemo, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

import {
  useAppKitAccount,
  useAppKitProvider,
} from '@reown/appkit/react';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';

import { BingoClient } from '../../../utils/bingoClient';

/* ------------------------------------------------------------------ */
/*  PROGRAM CONSTANTS – change to your deployed IDs                   */
/* ------------------------------------------------------------------ */
const PROGRAM_ID      = new PublicKey('6oQh1RjTbaoJ72APtEtmQpyoEr6bmeQKutmEzr8c3WdS');
const FACTORY_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const USDC_MINT       = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

/* ------------------------------------------------------------------ */
export function useSolanaBingoClient() {
  /* status flags */
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  /* 1 ─ account is always safe */
  const { address, isConnected } = useAppKitAccount({ namespace: 'solana' });

  /* 2 ─ provider only when wallet exists */
  const walletProvider = isConnected
    ? useAppKitProvider({ namespace: 'solana' })
    : null;

  /* 3 ─ connection (global) */
  const { connection } = useAppKitConnection();

  /* 4 ─ memo-create the client */
  const client = useMemo(() => {
    if (!isConnected || !walletProvider || !connection || !address) return null;

    const walletAdapter = {
      publicKey         : new PublicKey(address),
      signTransaction   : walletProvider.signTransaction.bind(walletProvider),
      signAllTransactions: walletProvider.signAllTransactions.bind(walletProvider),
    };

    return new BingoClient(connection, walletAdapter, PROGRAM_ID, FACTORY_ADDRESS);
  }, [isConnected, walletProvider, connection, address]);

  /* ----------------------------------------------------------------
   *  Helper to wrap BingoClient calls with loading / error handling */
  const wrap = <T,>(fnName: string, fn: () => Promise<T>) => async (): Promise<T | null> => {
    if (!client) {
      setError('Wallet not connected');
      return null;
    }
    try {
      setLoading(true);
      setError(null);
      return await fn();
    } catch (e: any) {
      setError(e?.message ?? `Failed to ${fnName}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------------------
   *  Actions                                                         */
  const createRoom = useCallback(
    (entryFee: number) =>
      wrap('create room', () => {
        const feeBn = new BN(entryFee * 1_000_000); // 6-dec USDC
        return client!.createRoom(feeBn);
      })(),
    [client]
  );

  const joinRoom = useCallback(
    (room: PublicKey | string) =>
      wrap('join room', () => {
        const pk = typeof room === 'string' ? new PublicKey(room) : room;
        return client!.joinRoom(pk, USDC_MINT);
      })(),
    [client]
  );

  const declareRowWinners = useCallback(
    (room: PublicKey | string, winners: (PublicKey | string)[]) =>
      wrap('declare row winners', () => {
        const roomPk = typeof room === 'string' ? new PublicKey(room) : room;
        const pubs   = winners.map(w => (typeof w === 'string' ? new PublicKey(w) : w));
        return client!.declareRowWinners(roomPk, pubs);
      })(),
    [client]
  );

  const declareFullHouseWinners = useCallback(
    (room: PublicKey | string, winners: (PublicKey | string)[]) =>
      wrap('declare full-house winners', () => {
        const roomPk = typeof room === 'string' ? new PublicKey(room) : room;
        const pubs   = winners.map(w => (typeof w === 'string' ? new PublicKey(w) : w));
        return client!.declareFullHouseWinners(roomPk, pubs);
      })(),
    [client]
  );

  const processPayments = useCallback(
    (room: PublicKey | string) =>
      wrap('process payments', async () => {
        const roomPk = typeof room === 'string' ? new PublicKey(room) : room;
        const data   = await client!.getRoomData(roomPk);

        await client!.processAllPayments(roomPk);

        for (let i = 0; i < data.rowWinners.length; i++) {
          await client!.payRowWinner(roomPk, i, data.rowWinners[i], USDC_MINT);
        }
        for (let i = 0; i < data.fullHouseWinners.length; i++) {
          await client!.payFullHouseWinner(roomPk, i, data.fullHouseWinners[i], USDC_MINT);
        }
        await client!.payPlatformFee(roomPk, data.platformWallet, USDC_MINT);
        await client!.payHostFee(roomPk, data.host, USDC_MINT);
        return true;
      })(),
    [client]
  );

  const cancelGame = useCallback(
    (room: PublicKey | string) =>
      wrap('cancel game', () => {
        const pk = typeof room === 'string' ? new PublicKey(room) : room;
        return client!.cancelGame(pk);
      })(),
    [client]
  );

  /* ----------------------------------------------------------------
   *  Queries                                                         */
  const getRoomData = useCallback(
    (room: PublicKey | string) =>
      wrap('get room data', () => {
        const pk = typeof room === 'string' ? new PublicKey(room) : room;
        return client!.getRoomData(pk);
      })(),
    [client]
  );

  const getAllRooms = wrap('get rooms', () => client!.getAllRooms());

  const hasPlayerJoined = useCallback(
    (room: PublicKey | string) =>
      wrap('check player', async () => {
        if (!address) return false;
        const pk  = typeof room === 'string' ? new PublicKey(room) : room;
        const dat = await client!.getRoomData(pk);
        return dat.players.some(p => p.toString() === address);
      })(),
    [client, address]
  );

  /* ----------------------------------------------------------------
   *  Return API                                                      */
  return {
    /* state */
    client,
    isReady: !!client,
    loading,
    error,
    playerAddress: address,

    /* actions */
    createRoom,
    joinRoom,
    declareRowWinners,
    declareFullHouseWinners,
    processPayments,
    cancelGame,

    /* queries */
    getRoomData,
    getAllRooms,
    hasPlayerJoined,
  };
}

export default useSolanaBingoClient;
