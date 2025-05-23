import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { 
  PublicKey, 
  LAMPORTS_PER_SOL, 
  Transaction, 
  SystemProgram 
} from "@solana/web3.js";

export default function SolanaWalletOperations() {
  const { connection } = useAppKitConnection();
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('solana');

  // Function to get the balance
  const handleGetBalance = async () => {
    if (!address || !connection) {
      console.error("Wallet not connected or connection unavailable");
      return;
    }

    try {
      const wallet = new PublicKey(address);
      const balance = await connection.getBalance(wallet);
      
      console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  // Function to sign a message
  const handleSignMessage = async () => {
    if (!walletProvider || !address) {
      console.error("Wallet not connected");
      return;
    }

    try {
      const message = "Hello from AppKit Solana!";
      const encodedMessage = new TextEncoder().encode(message);
      
      // Check if walletProvider has signMessage method
      if ('signMessage' in walletProvider && typeof walletProvider.signMessage === 'function') {
        const signature = await walletProvider.signMessage(encodedMessage);
        console.log("Message signature:", signature);
      } else {
        console.error("Wallet does not support message signing");
      }
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };

  // Function to send a transaction
  const handleSendTransaction = async () => {
    if (!walletProvider || !connection || !address) {
      console.error("Wallet not connected or connection unavailable");
      return;
    }

    try {
      const fromPublicKey = new PublicKey(address);
      // Replace with the recipient's address
      const toPublicKey = new PublicKey("11111111111111111111111111111111"); // System Program ID as example
      
      // Create a simple transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: toPublicKey,
          lamports: 0.001 * LAMPORTS_PER_SOL, // 0.001 SOL
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPublicKey;

      // Sign and send transaction
      if ('signAndSendTransaction' in walletProvider && typeof walletProvider.signAndSendTransaction === 'function') {
        const signature = await walletProvider.signAndSendTransaction(transaction);
        console.log("Transaction signature:", signature);
        
        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature);
        console.log("Transaction confirmed:", confirmation);
      } else {
        console.error("Wallet does not support transaction signing");
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  if (!isConnected) {
    return (
      <div>
        <p>Please connect your wallet to use these features.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Solana Wallet Operations</h3>
      <p>Connected Address: {address}</p>
      
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', maxWidth: '200px' }}>
        <button onClick={handleGetBalance}>
          Get Balance
        </button>
        
        <button onClick={handleSignMessage}>
          Sign Message
        </button>
        
        <button onClick={handleSendTransaction}>
          Send Transaction
        </button>
      </div>
    </div>
  );
}