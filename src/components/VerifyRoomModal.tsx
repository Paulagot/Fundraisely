import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useSupportedNetworks } from '../hooks/useSupportedNetworks';
import { getExplorerBaseUrl } from '../utils/chainHelpers';
import type { SupportedNetwork } from '../hooks/useSupportedNetworks';

interface VerifyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hostName: string;
  entryFee: string;
  contractAddress: string;
  chainId: string | number;
}

const InfoItem = ({ label, value, className = '' }: { label: string; value: string; className?: string }) => (
  <div className={`bg-gray-50 p-2 rounded-lg ${className}`}>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium break-all">{value}</p>
  </div>
);

const VerifyRoomModal: React.FC<VerifyRoomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  hostName,
  entryFee,
  contractAddress,
  chainId,
}) => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { supportedNetworks, currentNetwork, switchNetwork } = useSupportedNetworks();

  const [error, setError] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);

  const isCorrectChain = currentNetwork && String(currentNetwork.id) === String(chainId);
  const targetNetwork: SupportedNetwork | undefined = supportedNetworks.find((n) => String(n.id) === String(chainId));

  useEffect(() => {
    if (!isCorrectChain && targetNetwork) {
      (async () => {
        try {
          setIsSwitching(true);
          await switchNetwork(targetNetwork.id);
          setIsSwitching(false);
        } catch (err) {
          console.error('❌ Failed to switch chain:', err);
          setError(`Failed to switch to ${targetNetwork.name}. Please switch manually.`);
          setIsSwitching(false);
        }
      })();
    }
  }, [isCorrectChain, targetNetwork, switchNetwork]);

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

          <h3 className="text-lg font-bold text-center mb-2">Verify Bingo Room</h3>

          <div className="space-y-2 mb-3">
            {error && (
              <div className="flex items-start gap-1 bg-red-50 p-2 rounded-lg text-red-500 text-xs">
                <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            <InfoItem label="Host Name" value={hostName} />
            <InfoItem label="Entry Fee" value={`${entryFee} USDC`} />
            <InfoItem label="Blockchain Network" value={targetNetwork?.name || 'Unknown'} />
            <InfoItem label="Wallet Address" value={address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'} />
            <InfoItem label="Room Contract" value={`${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`} />
            {contractAddress && (
              <a
                href={`${getExplorerBaseUrl(chainId)}/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 underline block"
              >
                View on Explorer
              </a>
            )}
          </div>

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
              onClick={onConfirm}
              disabled={!isCorrectChain || isSwitching || !isConnected}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSwitching ? 'Switching...' : 'Pay & Join Room'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyRoomModal;

