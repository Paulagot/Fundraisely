import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ethers } from 'ethers';

// Define the shape of our context
interface Web3ContextType {
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  chainId: number | null;
  isConnected: boolean;
  makePayment: (amount: string, roomId: string) => Promise<{success: boolean, txHash?: string, error?: string}>;
}

// Create context with default values
const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  chainId: null,
  isConnected: false,
  makePayment: async () => ({ success: false }),
});

// Define props for the provider component
interface Web3ProviderProps {
  children: ReactNode;
  paymentAddress: string; // Address to send payments to
  requiredPaymentAmount: string; // Amount in ETH required to join a room
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ 
  children, 
  paymentAddress, 
  requiredPaymentAmount 
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Initialize provider from window.ethereum if available
  useEffect(() => {
    const checkConnection = async () => {
      // Check if Ethereum provider exists (MetaMask or similar)
      if (window.ethereum) {
        try {
          // Request accounts to see if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const network = await provider.getNetwork();
            
            setAccount(accounts[0]);
            setProvider(provider);
            setSigner(signer);
            setChainId(network.chainId);
            setIsConnected(true);
          }
        } catch (error) {
          console.error("Failed to detect wallet connection:", error);
        }
      }
    };

    checkConnection();

    // Listen for account and chain changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16));
      });
    }

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or another Ethereum wallet!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();

      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setChainId(network.chainId);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
  };

  // Function to make payment to join a room
  const makePayment = async (amount: string, roomId: string) => {
    if (!isConnected || !signer) {
      return { 
        success: false, 
        error: "Wallet not connected" 
      };
    }

    try {
      // Make sure we have a valid address format
      if (!ethers.utils.isAddress(paymentAddress)) {
        return {
          success: false,
          error: "Invalid payment address format. Must be a valid Ethereum address."
        };
      }

      // Create transaction parameters
      const tx = {
        to: paymentAddress,
        value: ethers.utils.parseEther(amount || requiredPaymentAmount), // Use requiredPaymentAmount as fallback
        // Optional: Add memo about room ID in data field
        data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(`Join room: ${roomId}`))
      };

      console.log("Sending transaction:", {
        to: tx.to,
        value: `${ethers.utils.formatEther(tx.value)} ETH`,
        roomId
      });

      // Send transaction
      const transaction = await signer.sendTransaction(tx);
      console.log("Transaction sent:", transaction.hash);
      
      const receipt = await transaction.wait();
      console.log("Transaction confirmed with", receipt.confirmations, "confirmations");

      return {
        success: true,
        txHash: transaction.hash
      };
    } catch (error) {
      console.error("Payment error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed"
      };
    }
  };

  // Context value to provide
  const value = {
    account,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    chainId,
    isConnected,
    makePayment
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook for using the web3 context
export const useWeb3 = () => useContext(Web3Context);

// Declare ethereum property on window object for TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}