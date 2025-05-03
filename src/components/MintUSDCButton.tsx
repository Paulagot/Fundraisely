import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { chainInfo } from '../constants/contractFactoryAddresses'; // Import chainInfo

// Minimal ABI for the mint function
const MOCK_USDC_ABI = [
  {
    constant: false,
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

interface MintUSDCButtonProps {
  chainId: string; // Pass chainId as a prop
}

const MintUSDCButton = ({ chainId }: MintUSDCButtonProps) => {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [isMinting, setIsMinting] = useState(false);
  const [status, setStatus] = useState('');

  // Get USDC address from chainInfo based on chainId
  const usdcAddress = chainInfo[chainId]?.usdcAddress;

  // Debug account and ABI
  console.log('MintUSDCButton - useAccount:', { address, isConnected });
  console.log('MintUSDCButton - chainId:', chainId, 'usdcAddress:', usdcAddress);

  const handleMint = async () => {
    if (!isConnected || !address) {
      setStatus('Please connect your wallet.');
      console.log('MintUSDCButton - Validation failed:', { isConnected, address });
      return;
    }

    if (!usdcAddress) {
      setStatus('Minting not supported on this chain.');
      console.log('MintUSDCButton - No USDC address for chain:', chainId);
      return;
    }

    try {
      setIsMinting(true);
      setStatus('Minting 100 USDC...');

      const mintAmount = BigInt(100_000_000); // 100 USDC (6 decimals)
      console.log('MintUSDCButton - Minting 100 USDC for:', address, 'Amount:', mintAmount.toString());

      const txHash = await writeContractAsync({
        address: usdcAddress as `0x${string}`,
        abi: MOCK_USDC_ABI,
        functionName: 'mint',
        args: [address, mintAmount],
      });
      console.log('MintUSDCButton - Transaction sent:', txHash);

      setStatus('✅ Minted 100 USDC successfully!');
    } catch (err: any) {
      console.error('MintUSDCButton - Mint error:', err, err.stack);
      setStatus(`❌ Mint failed: ${err.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  // Don't render if no USDC address is available (optional, since we'll control rendering in CreateRoomCard)
  if (!usdcAddress) {
    return null;
  }

  return (
    <div className="mt-4 text-center">
      <button
        type="button"
        onClick={handleMint}
        disabled={isMinting || !isConnected}
        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
      >
        {isMinting ? 'Minting...' : 'Mint 100 USDC'}
      </button>
      {status && <p className="text-sm mt-2 text-gray-600">{status}</p>}
    </div>
  );
};

export default MintUSDCButton;
