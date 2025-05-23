import { useEffect, useState } from 'react';
import { useAppKitAccount, useAppKitConnection, useAppKitProvider } from '@reown/appkit/react';
import { CreateSolanaRoom } from './createsolanaroom';

interface DebugWrapperProps {
  entryFee: string;
  roomId: string;
  sendTxId: (txid: string) => void;
  onSuccess: () => void;
}

export const DebugSolanaRoomWrapper: React.FC<DebugWrapperProps> = (props) => {
  const { address, isConnected } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider('solana');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('🔍 Wallet state:', {
      address,
      isConnected,
      hasConnection: !!connection,
      hasWalletProvider: !!walletProvider,
      addressType: typeof address,
      connectionType: typeof connection,
      walletProviderType: typeof walletProvider
    });

    // Only proceed when we have all required data
    if (isConnected && address && connection && walletProvider) {
      console.log('✅ All wallet dependencies ready');
      setIsReady(true);
    } else {
      console.log('⏳ Waiting for wallet dependencies...');
      setIsReady(false);
    }
  }, [address, isConnected, connection, walletProvider]);

  if (!isConnected) {
    return (
      <div>
        <h3>Wallet Connection Required</h3>
        <p>Please connect your Solana wallet to create a room.</p>
        <appkit-button />
      </div>
    );
  }

  if (!isReady) {
    return (
      <div>
        <h3>Initializing...</h3>
        <p>Waiting for wallet connection to be fully ready...</p>
        <p>Status: {JSON.stringify({ address: !!address, connection: !!connection, walletProvider: !!walletProvider })}</p>
      </div>
    );
  }

  return <CreateSolanaRoom {...props} />;
};