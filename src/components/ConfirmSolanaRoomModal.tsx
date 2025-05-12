import { useState, useMemo } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import useSolanaBingoClient from '../hooks/bingo/solana/useSolanaBingoClient';
import { networks } from '../config';                 // ← same list you use elsewhere

/* ── tiny helper for rows ────────────────────────────────────────── */
const Info = ({ label, value, className = '' }: { label: string; value: string; className?: string }) => (
  <div className={`bg-gray-50 p-2 rounded-lg ${className}`}>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium break-all">{value}</p>
  </div>
);

/* ── child that mounts the Solana hooks only after connect ───────── */
function SolanaRoomCreator({
  entryFee,
  onConfirm,
}: {
  entryFee: string;
  onConfirm: (addr: string) => void;
}) {
  const { createRoom, isReady, loading } = useSolanaBingoClient();
  const [error,  setError ] = useState('');
  const [status, setStatus] = useState('');

  const create = async () => {
    if (!isReady) return;
    setError(''); setStatus('Creating room on Solana…');
    const res = await createRoom(parseFloat(entryFee));
    if (!res) { setError('Transaction failed'); setStatus(''); return; }
    setStatus('Room created ✅');
    onConfirm(res.roomAddress.toString());
  };

  return (
    <>
      {error  && <Info label="Error"  value={error}  className="bg-red-50 text-red-500" />}
      {status && <Info label="Status" value={status} className="bg-blue-50 text-blue-500" />}

      <button
        onClick={create}
        disabled={!isReady || loading}
        className="mt-2 w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 py-2 text-sm font-medium text-white
                   hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Create Room'}
      </button>
    </>
  );
}

/* ── outer modal ─────────────────────────────────────────────────── */
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (roomAddress: string) => void;
  hostName: string;
  entryFee: string;
  selectedChain: string | number;          //  ← unified prop
}

export default function ConfirmSolanaRoomModal({
  isOpen,
  onClose,
  onConfirm,
  hostName,
  entryFee,
  selectedChain,
}: Props) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount({ namespace: 'solana' });

  /* lookup the nice name just for display */
  const networkName = useMemo(() => {
    const n = networks.find(net => String(net.id) === String(selectedChain));
    return n ? n.name : 'Unknown Network';
  }, [selectedChain]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="p-3">
          <div className="mb-2 flex items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <h3 className="mb-2 text-center text-lg font-bold">Confirm Solana Bingo Room</h3>

          <div className="mb-3 space-y-2">
            <Info label="Host Name"         value={hostName} />
            <Info label="Entry Fee"         value={`${entryFee} USDC`} />
            <Info label="Blockchain"        value={networkName} />
            <Info
              label="Wallet Address"
              value={
                isConnected && address
                  ? `${address.slice(0, 6)}…${address.slice(-4)}`
                  : 'Not connected'
              }
            />
          </div>

          {!isConnected ? (
            <button
              onClick={() => open({ view: 'Connect', namespace: 'solana' })}
              className="w-full rounded-lg bg-indigo-500 py-1.5 text-sm font-medium text-white
                         transition hover:bg-indigo-600"
            >
              Connect Solana Wallet
            </button>
          ) : (
            <SolanaRoomCreator entryFee={entryFee} onConfirm={onConfirm} />
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700
                         transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

