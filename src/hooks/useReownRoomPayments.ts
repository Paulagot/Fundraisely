// src/hooks/useReownRoomPayments.ts
import { useState } from 'react';
import { useAppKitAccount, useAppKitState, useAppKitNetwork } from '@reown/appkit/react';
import { usePublicClient, useWriteContract } from 'wagmi';
import { readContract } from 'viem/actions';
import { waitForTransactionReceipt } from 'viem/actions';
import { fetchContractAddress } from './fetchContractAddress';
import { useSupportedNetworks } from './useSupportedNetworks';
import { networks } from '../config';

const FundRaiselyBingoRoomABI = [
  {
    inputs: [],
    name: 'entryFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'joinRoom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paymentToken',
    outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'host',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'hasJoined',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllPlayers',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'address', name: 'player', type: 'address' }],
    name: 'PlayerJoined',
    type: 'event',
  },
];

const erc20Abi = [
  {
    constant: true,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
    stateMutability: 'view',
  },
  {
    constant: false,
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
    stateMutability: 'nonpayable',
  },
];

type PaymentStatus = 'idle' | 'pending' | 'success' | 'failed';
type ChainStatus = 'same' | 'different' | 'switching' | 'switched' | 'failed';

interface UseReownRoomPaymentReturn {
  makeRoomPayment: (roomId: string, chainId: string | number) => Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
    debugInfo?: any;
  }>;
  paymentStatus: PaymentStatus;
  chainStatus: ChainStatus;
  transactionHash: string;
  resetPayment: () => void;
  error: string;
  debugInfo: any;
  switchToChain: (targetChainId: string | number) => Promise<boolean>;
  currentChainId?: string;
}

export function useReownRoomPayment(): UseReownRoomPaymentReturn {
  const { address, isConnected } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const { switchNetwork } = useAppKitNetwork();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { supportedNetworks } = useSupportedNetworks();
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [chainStatus, setChainStatus] = useState<ChainStatus>('same');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Parse current chain ID from selectedNetworkId (e.g., "eip155:1" -> "1")
  const currentChainId = selectedNetworkId?.split(':')?.[1];

  const resetPayment = () => {
    setPaymentStatus('idle');
    setChainStatus('same');
    setTransactionHash('');
    setError('');
    setDebugInfo(null);
  };

  // Function to switch chains using AppKit
  const switchToChain = async (targetChainId: string | number): Promise<boolean> => {
    try {
      setChainStatus('switching');
      console.log('[useReownRoomPayment] 🔄 Switching to chain', targetChainId);
      
      // Find the network configuration for the target chain
      const targetNetwork = networks.find(network => String(network.id) === String(targetChainId));
      
      if (!targetNetwork) {
        console.error('[useReownRoomPayment] ❌ Target network not found', { targetChainId });
        setChainStatus('failed');
        setError(`Network with ID ${targetChainId} not found`);
        return false;
      }
      
      // Use AppKit's switchNetwork
      await switchNetwork(targetNetwork);
      
      console.log('[useReownRoomPayment] ✅ Chain switched successfully to', targetNetwork.name);
      setChainStatus('switched');
      return true;
    } catch (error) {
      console.error('[useReownRoomPayment] ❌ Failed to switch chain', error);
      setChainStatus('failed');
      setError(error instanceof Error ? error.message : 'Failed to switch network');
      return false;
    }
  };

  // Helper function to verify if contract exists and has the required functions
  const verifyContract = async (contractAddress: `0x${string}`) => {
    try {
      // Check if the contract has basic properties like a host
      const hostAddress = await readContract(publicClient, {
        address: contractAddress,
        abi: FundRaiselyBingoRoomABI,
        functionName: 'host',
      });

      // Try to get all players
      try {
        const players = await readContract(publicClient, {
          address: contractAddress,
          abi: FundRaiselyBingoRoomABI,
          functionName: 'getAllPlayers',
        });
        
        return { valid: true, hostAddress, players };
      } catch (playersError) {
        // getAllPlayers might not exist in older contracts
        return { valid: true, hostAddress, playersError };
      }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  };

  // Helper function to check if a player has joined - with detailed error info
  const checkPlayerJoined = async (contractAddress: `0x${string}`, playerAddress: `0x${string}`) => {
    try {
      // First try - standard approach
      const result = await readContract(publicClient, {
        address: contractAddress,
        abi: FundRaiselyBingoRoomABI,
        functionName: 'hasJoined',
        args: [playerAddress],
      });
      
      return { 
        success: true, 
        hasJoined: Boolean(result),
        result
      };
    } catch (error) {
      // First error - try more verbose debugging
      console.error("Error checking hasJoined:", error);
      
      try {
        // Attempt to get players and manually check
        const players = await readContract(publicClient, {
          address: contractAddress,
          abi: FundRaiselyBingoRoomABI,
          functionName: 'getAllPlayers',
        }) as `0x${string}`[];
        
        const isInPlayersList = players.some(
          p => p.toLowerCase() === playerAddress.toLowerCase()
        );
        
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          alternativeCheck: {
            method: 'getAllPlayers',
            found: isInPlayersList,
            playersList: players
          }
        };
      } catch (secondError) {
        // If we can't even get players, report both errors
        return {
          success: false, 
          hasJoinedError: error instanceof Error ? error.message : String(error),
          getPlayersError: secondError instanceof Error ? secondError.message : String(secondError)
        };
      }
    }
  };

  const makeRoomPayment = async (roomId: string, targetChainId: string | number) => {
    console.log('[useReownRoomPayment] 🚀 Starting payment', { 
      roomId, 
      targetChainId, 
      currentChainId, 
      walletAddress: address 
    });
    
    setError('');
    setDebugInfo(null);
  
    const debug: any = {
      roomId,
      targetChainId,
      currentChainId,
      selectedNetworkId,
      address,
      timestamp: new Date().toISOString(),
    };
  
    if (!isConnected || !address || !publicClient) {
      console.error('[useReownRoomPayment] ❌ Wallet or public client not connected', { isConnected, address });
      setDebugInfo({ error: 'Wallet or public client not connected', walletStatus: { isConnected, address } });
      return { success: false, error: 'Wallet or public client not connected', debugInfo: debug };
    }
    
    // Check if we need to switch chains
    if (currentChainId !== String(targetChainId)) {
      console.log('[useReownRoomPayment] ⚠️ Chain mismatch', { 
        current: currentChainId, 
        target: targetChainId 
      });
      
      debug.chainMismatch = {
        current: currentChainId,
        target: targetChainId
      };
      
      setChainStatus('different');
      
      // Attempt to switch chains using AppKit
      try {
        const targetNetwork = networks.find(network => String(network.id) === String(targetChainId));
        
        if (!targetNetwork) {
          console.error('[useReownRoomPayment] ❌ Target network not found', { targetChainId });
          setError(`Network with ID ${targetChainId} not found`);
          return { success: false, error: `Network with ID ${targetChainId} not found`, debugInfo: debug };
        }
        
        setChainStatus('switching');
        console.log('[useReownRoomPayment] 🔄 Switching chain using AppKit', { 
          targetNetwork: targetNetwork.name 
        });
        
        await switchNetwork(targetNetwork);
        
        console.log('[useReownRoomPayment] ✅ Chain switched successfully to', targetNetwork.name);
        debug.chainSwitched = true;
        setChainStatus('switched');
        
        // Wait a moment for chain switch to take effect
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('[useReownRoomPayment] ❌ Failed to switch chains', error);
        debug.chainSwitchError = error instanceof Error ? error.message : String(error);
        setChainStatus('failed');
        setError('Failed to switch to the correct network. Please switch manually.');
        return { success: false, error: 'Failed to switch network', debugInfo: debug };
      }
    } else {
      debug.chainAlreadyCorrect = true;
      setChainStatus('same');
    }
  
    setPaymentStatus('pending');
  
    try {
      console.log('[useReownRoomPayment] 🔍 Fetching contract address', { roomId });
      const contractAddress = await fetchContractAddress(roomId);
      debug.contractAddress = contractAddress;
      console.log('[useReownRoomPayment] 📋 Contract address', { contractAddress });
  
      if (!contractAddress) {
        console.error('[useReownRoomPayment] ❌ Room contract not found', { roomId });
        throw new Error('Room contract not found');
      }
  
      console.log('[useReownRoomPayment] 🧩 Verifying contract', { contractAddress });
      const contractVerification = await verifyContract(contractAddress as `0x${string}`);
      debug.contractVerification = contractVerification;
      console.log('[useReownRoomPayment] 📋 Contract verification result', { contractVerification });
  
      if (!contractVerification.valid) {
        console.error('[useReownRoomPayment] ❌ Invalid contract', { contractAddress, error: contractVerification.error });
        throw new Error(`Invalid contract at address ${contractAddress}: ${contractVerification.error}`);
      }
  
      console.log('[useReownRoomPayment] 🔍 Checking network', { targetChainId });
      const network = supportedNetworks.find((n) => String(n.id) === String(targetChainId));
      debug.network = network;
      console.log('[useReownRoomPayment] 📋 Network details', { network });
  
      if (!network) {
        console.error('[useReownRoomPayment] ❌ Network not found', { targetChainId });
        throw new Error(`Network with ID ${targetChainId} not found`);
      }
  
      if (network.namespace === 'solana') {
        console.error('[useReownRoomPayment] ❌ Solana not supported');
        setError('Solana room joining is not yet supported');
        return { success: false, error: 'Solana room joining is not yet supported', debugInfo: debug };
      }
  
      console.log('[useReownRoomPayment] 🔍 Checking if player has joined', { contractAddress, playerAddress: address });
      const joinedCheck = await checkPlayerJoined(
        contractAddress as `0x${string}`,
        address as `0x${string}`
      );
      debug.joinedCheck = joinedCheck;
      console.log('[useReownRoomPayment] 📋 Joined check result', { joinedCheck });
  
      if (joinedCheck.success && joinedCheck.hasJoined) {
        console.log('[useReownRoomPayment] ✅ Player already joined', { address });
        setPaymentStatus('success');
        setDebugInfo(debug);
        return { success: true, txHash: 'already-joined', debugInfo: debug };
      }
  
      if (!joinedCheck.success && joinedCheck.alternativeCheck && joinedCheck.alternativeCheck.found) {
        console.log('[useReownRoomPayment] ✅ Player found in alternative check', { address });
        setPaymentStatus('success');
        setDebugInfo(debug);
        return { success: true, txHash: 'already-joined-alternative-check', debugInfo: debug };
      }
  
      console.log('[useReownRoomPayment] 🧩 Fetching entryFee and paymentToken', { contractAddress });
      const [entryFee, paymentTokenAddress] = await Promise.all([
        readContract(publicClient, {
          address: contractAddress as `0x${string}`,
          abi: FundRaiselyBingoRoomABI,
          functionName: 'entryFee',
        }) as Promise<bigint>,
        readContract(publicClient, {
          address: contractAddress as `0x${string}`,
          abi: FundRaiselyBingoRoomABI,
          functionName: 'paymentToken',
        }) as Promise<`0x${string}`>,
      ]);
  
      debug.entryFee = entryFee.toString();
      debug.paymentTokenAddress = paymentTokenAddress;
      console.log('[useReownRoomPayment] 💰 Entry Fee and Payment Token', { entryFee: entryFee.toString(), paymentTokenAddress });
  
      // Check token decimals
      const tokenAbi = [
        {
          type: 'function',
          name: 'decimals',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: '', type: 'uint8' }],
        },
      ];
      const decimals = await readContract(publicClient, {
        address: paymentTokenAddress,
        abi: tokenAbi,
        functionName: 'decimals',
      });
      debug.decimals = decimals;
      console.log('[useReownRoomPayment] 📋 Payment Token decimals', { decimals });
  
      console.log('[useReownRoomPayment] 🔍 Checking current allowance', { paymentTokenAddress, playerAddress: address, contractAddress });
      const allowance = (await readContract(publicClient, {
        address: paymentTokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, contractAddress],
      })) as bigint;
  
      debug.allowance = allowance.toString();
      console.log('[useReownRoomPayment] 📋 Current allowance', { allowance: allowance.toString(), entryFee: entryFee.toString() });
  
      if (allowance < entryFee) {
        debug.needsApproval = true;
        console.log('[useReownRoomPayment] 📦 Preparing token approval', { paymentTokenAddress, contractAddress, approvalAmount: entryFee.toString() });
        const approveTx = await writeContractAsync({
          address: paymentTokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [contractAddress, entryFee],
          account: address as `0x${string}`,
        });
  
        debug.approveTxHash = approveTx;
        console.log('[useReownRoomPayment] ✅ Approval transaction', { approveTx });
  
        const approvalReceipt = await waitForTransactionReceipt(publicClient, {
          hash: approveTx,
          timeout: 60_000,
          pollingInterval: 2_000,
        });
  
        debug.approvalReceipt = {
          status: approvalReceipt.status,
          blockHash: approvalReceipt.blockHash,
        };
        console.log('[useReownRoomPayment] 📋 Approval receipt', { status: approvalReceipt.status, blockHash: approvalReceipt.blockHash });
  
        // Verify allowance after approval
        const newAllowance = (await readContract(publicClient, {
          address: paymentTokenAddress,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [address, contractAddress],
        })) as bigint;
        debug.newAllowance = newAllowance.toString();
        console.log('[useReownRoomPayment] 🔍 Allowance after approval', { newAllowance: newAllowance.toString(), expected: entryFee.toString() });
      } else {
        console.log('[useReownRoomPayment] ✅ Sufficient allowance exists', { allowance: allowance.toString(), entryFee: entryFee.toString() });
      }
  
      console.log('[useReownRoomPayment] 📦 Calling joinRoom', { contractAddress });
      const txHash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: FundRaiselyBingoRoomABI,
        functionName: 'joinRoom',
        account: address as `0x${string}`,
      });
  
      debug.joinTxHash = txHash;
      console.log('[useReownRoomPayment] ✅ joinRoom transaction', { txHash });
  
      const joinReceipt = await waitForTransactionReceipt(publicClient, {
        hash: txHash,
        timeout: 60_000,
        pollingInterval: 2_000,
      });
  
      debug.joinReceipt = {
        status: joinReceipt.status,
        blockHash: joinReceipt.blockHash,
      };
      console.log('[useReownRoomPayment] 📋 joinRoom receipt', { status: joinReceipt.status, blockHash: joinReceipt.blockHash });
  
      if (joinReceipt.status !== 'success') {
        console.error('[useReownRoomPayment] ❌ joinRoom transaction failed', { status: joinReceipt.status });
        throw new Error('Join transaction failed');
      }
  
      // Save payment proof to localStorage
      localStorage.setItem(
        'paymentProof',
        JSON.stringify({
          roomId,
          address,
          txHash,
        })
      );
  
      setTransactionHash(txHash);
      setPaymentStatus('success');
      setDebugInfo(debug);
      console.log('[useReownRoomPayment] ✅ Payment completed', { txHash });
      return { success: true, txHash, debugInfo: debug };
    } catch (err) {
      console.error('[useReownRoomPayment] ❌ Payment error', err);
      setPaymentStatus('failed');
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMsg);
      setDebugInfo(debug);
      return { success: false, error: errorMsg, debugInfo: debug };
    }
  };

    return {
      makeRoomPayment,
      paymentStatus,
      chainStatus,
      transactionHash,
      resetPayment,
      error,
      debugInfo,
      switchToChain,
      currentChainId,
    };
  }