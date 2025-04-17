import type React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Wallet } from 'lucide-react';

interface WalletConnectProps {
  className?: string;
  buttonText?: string;
  connectedText?: string;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  className = '',
  buttonText = 'Connect Wallet',
  connectedText = 'Connected'
}) => {
  const { isConnected, account, connectWallet } = useWeb3();
  
  // Format the address to show first 6 chars + last 4 chars
  const formattedAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : '';
    
  return (
    <div className={`wallet-connect ${className}`}>
      {isConnected ? (
        <div className="wallet-connected bg-indigo-50 text-indigo-900 p-3 rounded-xl flex items-center justify-center">
          <Wallet className="h-5 w-5 mr-2 text-indigo-600" />
          <span className="wallet-address font-medium">
            {connectedText}: {formattedAddress}
          </span>
        </div>
      ) : (
        <button
          type="button"
          className={`connect-wallet-btn flex items-center justify-center gap-2 ${className || 'w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5'}`}
          onClick={connectWallet}
        >
          <Wallet className="h-5 w-5" />
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default WalletConnect;