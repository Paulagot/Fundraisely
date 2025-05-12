// src/utils/bingoClient.ts
import * as web3 from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress
} from '@solana/spl-token';

// Define interface for the wallet adapter that matches what ReWallet provides
interface WalletAdapter {
  publicKey: web3.PublicKey;
  signTransaction: <T extends web3.Transaction | web3.VersionedTransaction>(transaction: T) => Promise<T>;
  signAllTransactions: <T extends web3.Transaction | web3.VersionedTransaction>(transactions: T[]) => Promise<T[]>;
}

// Define interfaces for account data structures
interface FactoryData {
  owner: web3.PublicKey;
  platformWallet: web3.PublicKey;
  tokenAddress: web3.PublicKey;
  roomCount: anchor.BN;
}

interface BingoRoomData {
  host: web3.PublicKey;
  platformWallet: web3.PublicKey;
  paymentToken: web3.PublicKey;
  entryFee: anchor.BN;
  createdAt: anchor.BN;
  totalCollected: anchor.BN;
  isCanceled: boolean;
  rowDeclared: boolean;
  fullHouseDeclared: boolean;
  paymentsProcessed: boolean;
  players: web3.PublicKey[];
  playerCount: number;
  rowWinners: web3.PublicKey[];
  fullHouseWinners: web3.PublicKey[];
  bump: number;
}

export class BingoClient {
  private connection: web3.Connection;
  private wallet: WalletAdapter;
  private programId: web3.PublicKey;
  private factoryAddress: web3.PublicKey;
  private provider: anchor.Provider;
  private program: anchor.Program;

  constructor(
    connection: web3.Connection,
    wallet: WalletAdapter,
    programId: web3.PublicKey,
    factoryAddress: web3.PublicKey
  ) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = programId;
    this.factoryAddress = factoryAddress;
    
    // Create a custom provider that works with our wallet adapter
    this.provider = new anchor.AnchorProvider(
      connection,
      this.createAnchorWalletAdapter(wallet),
      { commitment: 'confirmed' }
    );
    
    // Load the program
    // Note: In a real implementation, you would load the IDL from somewhere
    // For now, we'll create a minimal program interface
    this.program = new anchor.Program(
      {
        version: "0.1.0",
        name: "bingo_program",
        instructions: [
          {
            name: "createRoom",
            accounts: [
              { name: "factory", isMut: true, isSigner: false },
              { name: "room", isMut: true, isSigner: false },
              { name: "host", isMut: true, isSigner: true },
              { name: "systemProgram", isMut: false, isSigner: false }
            ],
            args: [
              { name: "entryFee", type: "u64" },
              { name: "bump", type: "u8" }
            ]
          },
          {
            name: "joinRoom",
            accounts: [
              { name: "room", isMut: true, isSigner: false },
              { name: "player", isMut: true, isSigner: true },
              { name: "playerTokenAccount", isMut: true, isSigner: false },
              { name: "roomTokenAccount", isMut: true, isSigner: false },
              { name: "tokenProgram", isMut: false, isSigner: false }
            ],
            args: []
          },
          // Add other instructions as needed...
        ],
        accounts: [],
        errors: []
      },
      programId,
      this.provider
    );
  }
  
  // Helper method to create an Anchor compatible wallet adapter
  private createAnchorWalletAdapter(wallet: WalletAdapter): anchor.Wallet {
    return {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    } as anchor.Wallet;
  }
  
  /**
   * Create a new bingo room
   * @param entryFee Entry fee in USDC units
   * @returns The transaction signature and room address
   */
  async createRoom(entryFee: anchor.BN): Promise<{ tx: string; roomAddress: web3.PublicKey }> {
    // Find the PDA for the room
    const [roomPDA, bump] = await web3.PublicKey.findProgramAddress(
      [
        Buffer.from('bingo_room'),
        this.wallet.publicKey.toBuffer(),
      ],
      this.programId
    );
    
    // Create the room
    const tx = await this.program.methods
      .createRoom(entryFee, bump)
      .accounts({
        factory: this.factoryAddress,
        room: roomPDA,
        host: this.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    
    return { tx, roomAddress: roomPDA };
  }
  
  /**
   * Join a bingo room
   * @param roomAddress The room address
   * @param tokenMint The USDC token mint
   * @returns Transaction signature
   */
  async joinRoom(roomAddress: web3.PublicKey, tokenMint: web3.PublicKey): Promise<string> {
    // Get player's token account
    const playerTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      this.wallet.publicKey
    );
    
    // Get room's token account
    const roomTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      roomAddress,
      true // allowOwnerOffCurve: true for PDAs
    );
    
    // Join the room
    const tx = await this.program.methods
      .joinRoom()
      .accounts({
        room: roomAddress,
        player: this.wallet.publicKey,
        playerTokenAccount,
        roomTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    
    return tx;
  }
  
  /**
   * Declare row winners
   * @param roomAddress The room address
   * @param winners Array of winner addresses
   * @returns Transaction signature
   */
  async declareRowWinners(roomAddress: web3.PublicKey, winners: web3.PublicKey[]): Promise<string> {
    const tx = await this.program.methods
      .declareRowWinners(winners)
      .accounts({
        room: roomAddress,
        host: this.wallet.publicKey,
      })
      .rpc();
    
    return tx;
  }
  
  /**
   * Declare full house winners
   * @param roomAddress The room address
   * @param winners Array of winner addresses
   * @returns Transaction signature
   */
  async declareFullHouseWinners(roomAddress: web3.PublicKey, winners: web3.PublicKey[]): Promise<string> {
    const tx = await this.program.methods
      .declareFullHouseWinners(winners)
      .accounts({
        room: roomAddress,
        host: this.wallet.publicKey,
      })
      .rpc();
    
    return tx;
  }
  
  /**
   * Process all payments
   * @param roomAddress The room address
   * @returns Transaction signature
   */
  async processAllPayments(roomAddress: web3.PublicKey): Promise<string> {
    const tx = await this.program.methods
      .processAllPayments()
      .accounts({
        room: roomAddress,
        host: this.wallet.publicKey,
      })
      .rpc();
    
    return tx;
  }
  
  /**
   * Pay a row winner
   * @param roomAddress The room address
   * @param winnerIndex The index of the winner in the rowWinners array
   * @param winnerAddress The winner's address
   * @param tokenMint The USDC token mint
   * @returns Transaction signature
   */
  async payRowWinner(
    roomAddress: web3.PublicKey,
    winnerIndex: number,
    winnerAddress: web3.PublicKey,
    tokenMint: web3.PublicKey
  ): Promise<string> {
    // Get token accounts
    const roomTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      roomAddress,
      true // allowOwnerOffCurve: true for PDAs
    );
    
    const winnerTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      winnerAddress
    );
    
    // Pay the winner
    const tx = await this.program.methods
      .payRowWinner(winnerIndex)
      .accounts({
        room: roomAddress,
        winner: winnerAddress,
        roomTokenAccount,
        winnerTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    
    return tx;
  }
  
  /**
   * Pay a full house winner
   * @param roomAddress The room address
   * @param winnerIndex The index of the winner in the fullHouseWinners array
   * @param winnerAddress The winner's address
   * @param tokenMint The USDC token mint
   * @returns Transaction signature
   */
  async payFullHouseWinner(
    roomAddress: web3.PublicKey,
    winnerIndex: number,
    winnerAddress: web3.PublicKey,
    tokenMint: web3.PublicKey
  ): Promise<string> {
    // Get token accounts
    const roomTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      roomAddress,
      true // allowOwnerOffCurve: true for PDAs
    );
    
    const winnerTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      winnerAddress
    );
    
    // Pay the winner
    const tx = await this.program.methods
      .payFullHouseWinner(winnerIndex)
      .accounts({
        room: roomAddress,
        winner: winnerAddress,
        roomTokenAccount,
        winnerTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    
    return tx;
  }
  
  /**
   * Pay platform fee
   * @param roomAddress The room address
   * @param platformWallet The platform wallet address
   * @param tokenMint The USDC token mint
   * @returns Transaction signature
   */
  async payPlatformFee(
    roomAddress: web3.PublicKey,
    platformWallet: web3.PublicKey,
    tokenMint: web3.PublicKey
  ): Promise<string> {
    // Get token accounts
    const roomTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      roomAddress,
      true // allowOwnerOffCurve: true for PDAs
    );
    
    const platformTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      platformWallet
    );
    
    // Pay the platform
    const tx = await this.program.methods
      .payPlatformFee()
      .accounts({
        room: roomAddress,
        platformWallet,
        roomTokenAccount,
        platformTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    
    return tx;
  }
  
  /**
   * Pay host fee
   * @param roomAddress The room address
   * @param hostAddress The host address
   * @param tokenMint The USDC token mint
   * @returns Transaction signature
   */
  async payHostFee(
    roomAddress: web3.PublicKey,
    hostAddress: web3.PublicKey,
    tokenMint: web3.PublicKey
  ): Promise<string> {
    // Get token accounts
    const roomTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      roomAddress,
      true // allowOwnerOffCurve: true for PDAs
    );
    
    const hostTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      hostAddress
    );
    
    // Pay the host
    const tx = await this.program.methods
      .payHostFee()
      .accounts({
        room: roomAddress,
        host: hostAddress,
        roomTokenAccount,
        hostTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    
    return tx;
  }
  
  /**
   * Cancel game
   * @param roomAddress The room address
   * @returns Transaction signature
   */
  async cancelGame(roomAddress: web3.PublicKey): Promise<string> {
    const tx = await this.program.methods
      .cancelGame()
      .accounts({
        room: roomAddress,
        host: this.wallet.publicKey,
      })
      .rpc();
    
    return tx;
  }
  
  /**
   * Get room data
   * @param roomAddress The room address
   * @returns Room data
   */
  async getRoomData(roomAddress: web3.PublicKey): Promise<BingoRoomData> {
    return await this.program.account.bingoRoom.fetch(roomAddress) as unknown as BingoRoomData;
  }
  
  /**
   * Get all rooms
   * @returns Array of room addresses
   */
  async getAllRooms(): Promise<web3.PublicKey[]> {
    const rooms = await this.program.account.bingoRoom.all();
    return rooms.map(room => room.publicKey);
  }
}