import { useEffect } from 'react';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BN from 'bn.js';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import idl from '../idl/solana_bingo.json';

interface CreateSolanaRoomProps {
  entryFee: string;
  roomId: string;
  sendTxId: (txid: string) => void;
  onSuccess: () => void;
}

export const CreateSolanaRoom: React.FC<CreateSolanaRoomProps> = ({
  entryFee,
  roomId,
  sendTxId,
  onSuccess,
}) => {
  const { address } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider('solana');

  useEffect(() => {
    const createRoom = async () => {
      if (!address || !walletProvider || !connection) return;

      try {
        const publicKey = new PublicKey(address);
        const rawProvider = walletProvider as SolanaWalletProvider;

        const wallet = {
          publicKey,
          signTransaction: rawProvider.signTransaction,
          signAllTransactions: rawProvider.signAllTransactions,
        };

        const provider = new AnchorProvider(connection, wallet as any, {});
        const programId = new PublicKey((idl as any).metadata.address);
        const program = new Program(idl as Idl, programId, provider);

        const roomIdBN = new BN(roomId);
        const entryFeeBN = new BN(Number(entryFee) * 1_000_000); // USDC decimals

        const [roomPda] = await PublicKey.findProgramAddress(
          [Buffer.from('room'), publicKey.toBuffer(), roomIdBN.toArrayLike(Buffer, 'le', 8)],
          program.programId
        );

        const [roomTokenAccount] = await PublicKey.findProgramAddress(
          [Buffer.from('room_token_account'), roomPda.toBuffer()],
          program.programId
        );

        const usdcMint = new PublicKey('INSERT_USDC_MINT_HERE'); // ← replace this!

        const txSig = await program.methods
          .createRoom(roomIdBN, entryFeeBN, 10) // 10 max players
          .accounts({
            host: publicKey,
            room: roomPda,
            roomTokenAccount,
            paymentToken: usdcMint,
            platformWallet: publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .rpc();

        sendTxId(txSig);
        onSuccess();
      } catch (e) {
        console.error('❌ Solana room creation failed:', e);
      }
    };

    createRoom();
  }, [address, walletProvider, connection]);

  return null;
};


