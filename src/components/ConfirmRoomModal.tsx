import type React from 'react';
import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useWriteContract, usePublicClient } from 'wagmi';
import { decodeEventLog } from 'viem';
import { useSupportedNetworks } from '../hooks/useSupportedNetworks';
import type { SupportedNetwork } from '../hooks/useSupportedNetworks';
import { chainInfo } from '../constants/contractFactoryAddresses';
import { checkServerHealth } from '../utils/checkServerHealth';
import { CreateSolanaRoom } from './createsolanaroom';


interface ConfirmRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (walletAddress: string, contractAddress: string) => void;
  hostName: string;
  entryFee: string;
  selectedChain: string | number;

}

const InfoItem = ({ label, value, className = '' }: { label: string; value: string; className?: string }) => (
  <div className={`bg-gray-50 p-2 rounded-lg ${className}`}>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium break-all">{value}</p>
  </div>
);

const FACTORY_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: '_entryFee', type: 'uint256' }],
    name: 'createRoom',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'host', type: 'address' },
      { indexed: true, internalType: 'address', name: 'room', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'entryFee', type: 'uint256' },
    ],
    name: 'RoomCreated',
    type: 'event',
  },
];

const ConfirmRoomModal: React.FC<ConfirmRoomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  hostName,
  entryFee,
  selectedChain,
}) => {
  const { open } = useAppKit();
  const { supportedNetworks } = useSupportedNetworks();
  const { address, isConnected } = useAppKitAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [serverHealthy, setServerHealthy] = useState(true);
  const [triggerSolanaRoomCreation, setTriggerSolanaRoomCreation] = useState(false);



  const selectedNetwork: SupportedNetwork | undefined = supportedNetworks.find(
    (n) => String(n.id) === String(selectedChain)
  );

  const factoryAddress = selectedChain
    ? chainInfo[String(selectedChain)]?.factoryAddress
    : undefined;

  const handleConfirm = async () => {
    setError('');
    setStatus('');
    console.log('🚀 handleConfirm called');

    const serverAlive = await checkServerHealth();
    console.log('✅ Server health:', serverAlive);
    if (!serverAlive) {
      setError('🚨 Server unavailable. Try again later.');
      setServerHealthy(false);
      return;
    }
    setServerHealthy(true);

    if (!isConnected || !address) {
      setError('Please connect wallet.');
      return;
    }


    // ✅ Solana logic
if (selectedNetwork?.namespace === 'solana') {
  console.log('🌐 Solana network detected - launching Solana room creation');
  setTriggerSolanaRoomCreation(true); // Show the component
  return;
}

    // ✅ EVM logic
    if (!factoryAddress) {
      setError('Factory address not found.');
      return;
    }

    if (!publicClient) {
      setError('Public client unavailable. Please reload.');
      return;
    }

    setIsDeploying(true);

    try {
      setStatus('Sending transaction...');
      const entryFeeInUSDC = BigInt(Number.parseFloat(entryFee) * 1_000_000);
      console.log('🎯 Entry Fee in USDC:', entryFeeInUSDC.toString());

      const txHash = await writeContractAsync({
        address: factoryAddress as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'createRoom',
        args: [entryFeeInUSDC],
      });

      setStatus('Transaction sent. Waiting...');
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (!receipt || receipt.status !== 'success') {
        throw new Error('Transaction failed');
      }

      const log = receipt.logs.find((log) => log.address.toLowerCase() === factoryAddress.toLowerCase());
      if (!log) throw new Error('Event log not found');

      const parsedLog = decodeEventLog({
        abi: FACTORY_ABI,
        eventName: 'RoomCreated',
        data: log.data,
        topics: log.topics,
      });

      let deployedContractAddress: string;
      if (Array.isArray(parsedLog.args)) {
        deployedContractAddress = parsedLog.args[1] as string;
      } else if (parsedLog.args && typeof parsedLog.args === 'object' && 'room' in parsedLog.args) {
        deployedContractAddress = parsedLog.args.room as string;
      } else {
        throw new Error('Event args not found');
      }

      setStatus('Room created successfully!');
      onConfirm(address, deployedContractAddress);
    } catch (err: any) {
      console.error('❌ Contract deployment failed:', err);
      setError(err.message || 'Unknown error');
      setStatus('');
    } finally {
      setIsDeploying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-sm mx-4 shadow-lg overflow-hidden">
        <div className="p-3">
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-center mb-2">Confirm Fundraising Event</h3>

          <div className="space-y-2 mb-3">
            {error && (
              <div className="flex items-start gap-1 bg-red-50 p-2 rounded-lg text-red-500 text-xs">
                <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            <InfoItem label="Host Name" value={hostName} />
            <InfoItem label="Entry Fee" value={`${entryFee} USDC`} />
            <InfoItem label="Blockchain Network" value={selectedNetwork?.name || 'Unknown'} />
            <InfoItem
              label="Wallet Address"
              value={isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not connected'}
            />
            <InfoItem
              label="Contract Address"
              value={factoryAddress ? `${factoryAddress?.slice(0, 6)}...${factoryAddress?.slice(-4)}` : 'No contract available'}
              className={factoryAddress ? '' : 'text-yellow-500 bg-yellow-50'}
            />
            {status && <InfoItem label="Status" value={status} className="text-blue-500 bg-blue-50" />}
          </div>

{triggerSolanaRoomCreation && (
  <CreateSolanaRoom
    entryFee={entryFee}
    roomId={String(Date.now())} // or roomId from props if available
    sendTxId={(txid) => {
      console.log('✅ Solana TX ID:', txid);
      onConfirm(address!, 'solana'); // You may want to pass back room PDA later
    }}
    onSuccess={() => {
      setStatus('Solana room created!');
      setTriggerSolanaRoomCreation(false); // Hide the component
      onClose();
    }}
  />
)}

          {!isConnected && (
            <div className="mb-2">
              <button
                type="button"
                onClick={() => open({ view: 'Connect', namespace: selectedNetwork?.namespace || 'eip155' })}
                className="w-full py-1.5 px-3 bg-indigo-500 text-white text-sm rounded-lg font-medium hover:bg-indigo-600 transition"
              >
                Connect Wallet
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isConnected || isDeploying || !selectedChain || !serverHealthy}
            >
              {isDeploying ? 'Creating...' : 'Create Event'}
            </button>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRoomModal;
