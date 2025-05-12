import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, web3 } from '@project-serum/anchor';
import idl from '../idl/solana_bingo.json';

const PROGRAM_ID = new PublicKey(idl.address);
const ROOM_SEED = Buffer.from('room');
const ROOM_TOKEN_ACCOUNT_SEED = Buffer.from('room_token_account');

// Update with your platform wallet and payment token mint
const PLATFORM_WALLET = new PublicKey('7koYv1dqqHWh4PQ5bVh8CyLBTxqAHeARPiuazzF2FhCY');
const USDC_MINT = new PublicKey('4UM2Qtb6mY9eyxFwnSy8X3nv5azk3JYHA1arsEgyrEid');

export async function createSolanaRoom(
  hostPubkeyStr: string,
  entryFee: string,
  connection: Connection
): Promise<string> {
  const host = new PublicKey(hostPubkeyStr);
  const provider = new AnchorProvider(connection, (window as any).solana, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as any, PROGRAM_ID, provider);

  // Derive room PDA: ["room", host]
  const [roomPDA] = PublicKey.findProgramAddressSync(
    [ROOM_SEED, host.toBuffer()],
    PROGRAM_ID
  );

  // Derive room token account PDA: ["room_token_account", room]
  const [roomTokenPDA] = PublicKey.findProgramAddressSync(
    [ROOM_TOKEN_ACCOUNT_SEED, roomPDA.toBuffer()],
    PROGRAM_ID
  );

  const entryFeeBN = new web3.BN(Math.floor(Number.parseFloat(entryFee) * 1_000_000)); // USDC has 6 decimals

  await program.methods
    .createRoom(entryFeeBN)
    .accounts({
      host,
      room: roomPDA,
      roomTokenAccount: roomTokenPDA,
      paymentToken: USDC_MINT,
      platformWallet: PLATFORM_WALLET,
      systemProgram: SystemProgram.programId,
      tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      rent: new PublicKey('SysvarRent111111111111111111111111111111111'),
    })
    .rpc();

  return roomPDA.toBase58();
}

