import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';

// const USDC_ADDRESS = '0xDEadd2F1102897C89D3214452A583ADf13E23855';
const USDC_ADDRESS = '0x0713adEE4545945a0d3B036913Da9c4D6a7ff7b9';

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

const MintUSDCButton = () => {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [isMinting, setIsMinting] = useState(false);
  const [status, setStatus] = useState('');

  // Debug account and ABI
  console.log('MintUSDCButton - useAccount:', { address, isConnected });
  console.log('MintUSDCButton - MOCK_USDC_ABI:', MOCK_USDC_ABI);

  const handleMint = async () => {
    if (!isConnected || !address) {
      setStatus('Please connect your wallet.');
      console.log('MintUSDCButton - Validation failed:', { isConnected, address });
      return;
    }

    try {
      setIsMinting(true);
      setStatus('Minting 100 USDC...');

      const mintAmount = BigInt(100_000_000); // 100 USDC (6 decimals)
      console.log('MintUSDCButton - Minting 100 USDC for:', address, 'Amount:', mintAmount.toString());

      const txHash = await writeContractAsync({
        address: USDC_ADDRESS as `0x${string}`,
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
