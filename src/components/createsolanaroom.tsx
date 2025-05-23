import { useEffect } from 'react';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { BN } from 'bn.js';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';

interface SolanaWalletProvider {
  signTransaction: (tx: any) => Promise<any>;
  signAllTransactions: (txs: any[]) => Promise<any[]>;
}

interface CreateSolanaRoomProps {
  entryFee: string;
  roomId: string;
  sendTxId: (txid: string) => void;
  onSuccess: () => void;
  debug?: boolean;
}

export const CreateSolanaRoom: React.FC<CreateSolanaRoomProps> = ({
  entryFee,
  roomId,
  sendTxId,
  onSuccess,
  debug = true,
}) => {
  const { address, isConnected } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider('solana');

  useEffect(() => {
    const createRoom = async () => {
      if (debug) {
        console.log('🛠️ Debug: Initial state', {
          isConnected,
          address,
          hasWalletProvider: !!walletProvider,
          hasConnection: !!connection,
          entryFee,
          roomId,
        });
      }

      if (!isConnected || !address || !walletProvider || !connection) {
        console.error('❌ Missing wallet connection or network');
        return;
      }

      try {
        // Step 1: Setup wallet and provider
        console.log('🔑 Step 1: Setting up wallet...');
        const publicKey = new PublicKey(address);
        const rawProvider = walletProvider as unknown as SolanaWalletProvider;
        
        if (!rawProvider.signTransaction || !rawProvider.signAllTransactions) {
          throw new Error('❌ Wallet provider missing signing methods');
        }

        const wallet = {
          publicKey,
          signTransaction: rawProvider.signTransaction.bind(rawProvider),
          signAllTransactions: rawProvider.signAllTransactions.bind(rawProvider),
        };
        console.log('✅ Wallet setup complete');

        // Step 2: Setup program and constants
        console.log('🎯 Step 2: Setting up program...');
        const programId = new PublicKey('Ev3D1mV3m1HZFZAJb8r68VoURxUxJq1o9vtcajZKXgDo');
        const usdcMint = new PublicKey('4UM2Qtb6mY9eyxFwnSy8X3nv5azk3JYHA1arsEgyrEid'); // Devnet USDC
        console.log('✅ Program ID:', programId.toBase58());
        console.log('✅ USDC mint:', usdcMint.toBase58());

        // Step 3: Parse parameters
        console.log('📊 Step 3: Parsing parameters...');
        // Use timestamp to ensure unique room ID for testing
        const roomIdNumber = parseInt(roomId, 10) + Math.floor(Date.now() / 1000); // Add timestamp
        const roomIdBN = new BN(roomIdNumber);

        const entryFeeNumber = parseFloat(entryFee);
        if (isNaN(entryFeeNumber)) throw new Error(`Invalid entry fee: ${entryFee}`);
        const entryFeeBN = new BN(Math.floor(entryFeeNumber * 1_000_000));
        
        console.log('✅ Room ID:', roomIdBN.toString());
        console.log('✅ Entry fee:', entryFeeBN.toString(), '(micro USDC)');

        // Step 4: Derive PDAs
        console.log('🔍 Step 4: Deriving PDAs...');
        const [roomPda, roomBump] = await PublicKey.findProgramAddress(
          [Buffer.from('room'), publicKey.toBuffer(), roomIdBN.toArrayLike(Buffer, 'le', 8)],
          programId
        );

        const [roomTokenAccount, tokenBump] = await PublicKey.findProgramAddress(
          [Buffer.from('room_token_account'), roomPda.toBuffer()],
          programId
        );

        console.log('✅ Room PDA:', roomPda.toBase58(), 'bump:', roomBump);
        console.log('✅ Room token account PDA:', roomTokenAccount.toBase58(), 'bump:', tokenBump);

        // Step 5: Setup host token account
        console.log('💰 Step 5: Setting up host token account...');
        const hostTokenAccount = await getAssociatedTokenAddress(usdcMint, publicKey);
        console.log('✅ Host token account address:', hostTokenAccount.toString());

        // Step 6: Build transaction
        console.log('📝 Step 6: Building transaction...');
        const transaction = new Transaction();

        // Check if host needs USDC token account
        const hostTokenAccountInfo = await connection.getAccountInfo(hostTokenAccount);
        if (!hostTokenAccountInfo) {
          console.log('🔧 Adding create ATA instruction...');
          const createATAInstruction = createAssociatedTokenAccountInstruction(
            publicKey, // payer
            hostTokenAccount, // ata
            publicKey, // owner
            usdcMint // mint
          );
          transaction.add(createATAInstruction);
        }

        // Create room instruction
        const discriminator = Buffer.from([130, 166, 32, 2, 247, 120, 178, 53]); // create_room discriminator
        const roomIdBuffer = roomIdBN.toArrayLike(Buffer, 'le', 8);
        const entryFeeBuffer = entryFeeBN.toArrayLike(Buffer, 'le', 8);
        const maxPlayersBuffer = Buffer.from([10]); // Max 10 players

        const instructionData = Buffer.concat([
          discriminator,
          roomIdBuffer,
          entryFeeBuffer,
          maxPlayersBuffer
        ]);

        const accountKeys = [
          { pubkey: publicKey, isSigner: true, isWritable: true }, // host
          { pubkey: roomPda, isSigner: false, isWritable: true }, // room
          { pubkey: roomTokenAccount, isSigner: false, isWritable: true }, // room_token_account
          { pubkey: usdcMint, isSigner: false, isWritable: false }, // payment_token
          { pubkey: publicKey, isSigner: false, isWritable: true }, // platform_wallet (same as host)
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }, // rent
        ];

        const createRoomInstruction = new TransactionInstruction({
          keys: accountKeys,
          programId: programId,
          data: instructionData
        });

        transaction.add(createRoomInstruction);
        console.log('✅ Transaction built with', transaction.instructions.length, 'instructions');

        // Step 7: Send transaction
        console.log('🚀 Step 7: Sending transaction...');
        
        // Get recent blockhash with retry
        let blockhash: string;
        let attempts = 0;
        while (attempts < 3) {
          try {
            const blockhashInfo = await connection.getLatestBlockhash('confirmed');
            blockhash = blockhashInfo.blockhash;
            console.log('✅ Got blockhash:', blockhash);
            break;
          } catch (err) {
            attempts++;
            console.log(`⚠️ Blockhash attempt ${attempts} failed:`, err);
            if (attempts >= 3) throw new Error('Failed to get recent blockhash');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        transaction.recentBlockhash = blockhash!;
        transaction.feePayer = publicKey;

        // Sign transaction
        console.log('✍️ Requesting signature...');
        const signedTransaction = await wallet.signTransaction(transaction);
        console.log('✅ Transaction signed');

        // Send transaction
        console.log('📡 Sending to network...');
        const txid = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
            maxRetries: 3
          }
        );
        console.log('🚀 Transaction sent with ID:', txid);
        console.log('🔗 View on explorer:', `https://explorer.solana.com/tx/${txid}?cluster=devnet`);

        // Don't wait for confirmation to avoid timeout - just return the txid
        sendTxId(txid);
        onSuccess();
        
        // Optional: Try to confirm in background
        connection.confirmTransaction(txid, 'confirmed').then(() => {
          console.log('✅ Transaction confirmed!');
        }).catch((err) => {
          console.log('⚠️ Confirmation timeout (transaction may still succeed):', err.message);
        });

      } catch (err: any) {
        console.error('❌ Room creation failed:', err);
        if (debug) {
          console.error('🧵 Error details:', {
            message: err?.message,
            stack: err?.stack,
            logs: err?.logs,
            name: err?.name,
          });
        }
      }
    };

    createRoom();
  }, [isConnected, address, walletProvider, connection, entryFee, roomId, sendTxId, onSuccess, debug]);

  return null;
};







