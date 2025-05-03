// src/constants/networks.js
export const networks = [
  // EVM-Compatible Chains
  {
    id: 1,
    name: 'Ethereum Mainnet',
    rpcUrls: [
      'https://rpc.ankr.com/eth',
      'https://eth.llamarpc.com'
    ],
    namespace: 'eip155'
  },
  {
    id: 11155111,
    name: 'Sepolia Testnet',
    rpcUrls: [
      'https://rpc.sepolia.org',
      'https://rpc2.sepolia.org'
    ],
    namespace: 'eip155'
  },
  {
    id: 8453,
    name: 'Base Mainnet',
    rpcUrls: [
      'https://mainnet.base.org',
      'https://base.llamarpc.com'
    ],
    namespace: 'eip155'
  },
  {
    id: 84532,
    name: 'Base Sepolia Testnet',
    rpcUrls: [
      'https://sepolia.base.org',
      'https://base-sepolia-rpc.publicnode.com'
    ],
    namespace: 'eip155'
  },
  {
    id: 81457,
    name: 'Blast Mainnet',
    rpcUrls: [
      'https://rpc.blast.io',
      'https://blast.blockpi.network/v1/rpc/public'
    ],
    namespace: 'eip155'
  },
  {
    id: 168587773,
    name: 'Blast Sepolia Testnet',
    rpcUrls: [
      'https://sepolia.blast.io',
      'https://blast-sepolia-rpc.publicnode.com'
    ],
    namespace: 'eip155'
  },
  {
    id: 10,
    name: 'Optimism Mainnet',
    rpcUrls: [
      'https://mainnet.optimism.io',
      'https://rpc.ankr.com/optimism'
    ],
    namespace: 'eip155'
  },
  {
    id: 11155420,
    name: 'Optimism Sepolia Testnet',
    rpcUrls: [
      'https://sepolia.optimism.io',
      'https://optimism-sepolia-rpc.publicnode.com'
    ],
    namespace: 'eip155'
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    rpcUrls: [
      'https://arb1.arbitrum.io/rpc',
      'https://rpc.ankr.com/arbitrum'
    ],
    namespace: 'eip155'
  },
  {
    id: 421614,
    name: 'Arbitrum Sepolia Testnet',
    rpcUrls: [
      'https://sepolia-rollup.arbitrum.io/rpc',
      'https://arbitrum-sepolia-rpc.publicnode.com'
    ],
    namespace: 'eip155'
  },
  {
    id: 137,
    name: 'Polygon Mainnet',
    rpcUrls: [
      'https://polygon-rpc.com',
      'https://rpc.ankr.com/polygon'
    ],
    namespace: 'eip155'
  },
  {
    id: 43114,
    name: 'Avalanche C-Chain',
    rpcUrls: [
      'https://api.avax.network/ext/bc/C/rpc',
      'https://rpc.ankr.com/avalanche'
    ],
    namespace: 'eip155'
  },

  {
    id: 43113,
    name: 'Avalanche Fuji C-Chain',
    rpcUrls: [
      'wss://avalanche-fuji.drpc.org'
      
    ],
    namespace: 'eip155'
  },
  {
    id: 30,
    name: 'Rootstock Mainnet',
   
    rpcUrls: [
      'https://public-node.rsk.co',
      'https://rpc.rootstock.io'
    ],
    namespace: 'eip155'
  },
  {
    id: 31,
    name: 'Rootstock Testnet',
    rpcUrls: [
      'https://public-node.testnet.rsk.co',
      'https://rootstock-testnet-rpc.publicnode.com'
    ],
    namespace: 'eip155'
  },
  {
    id: 60808,
    name: 'BOB Mainnet',
    rpcUrls: [
      'https://rpc.gobob.xyz',
      'https://bob-mainnet-rpc.publicnode.com'
    ],
    namespace: 'eip155'
  },
  {
    id: 8080,
    name: 'BOB Sepolia Testnet',
    rpcUrls: [
      'https://sepolia.rpc.gobob.xyz',
      'https://bob-sepolia-rpc.publicnode.com'
    ],
    namespace: 'eip155'
  },
  {
    id: 1329,
    name: 'Sei Mainnet',
    rpcUrls: [
      'https://sei-rpc.lavenderfive.com',
      'https://rpc.sei-apis.com'
    ],
    namespace: 'eip155'
  },
  {
    id: 1328,
    name: 'Sei Devnet',
    rpcUrls: [
      'https://evm-rpc-testnet.sei-apis.com',
      'https://evm-rpc-testnet-sei.stingray.plus'
    ],
    namespace: 'eip155'
  },

  // Non-EVM: Solana Networks
  {
    id: 'solana:mainnet',
    name: 'Solana Mainnet',
    rpcUrls: [
      'https://api.mainnet-beta.solana.com',
      'https://solana-mainnet.rpc.extrnode.com'
    ],
    namespace: 'solana'
  },
  {
    id: 'solana:devnet',
    name: 'Solana Devnet',
    rpcUrls: [
      'https://api.devnet.solana.com',
      'https://solana-devnet.rpc.extrnode.com'
    ],
    namespace: 'solana'
  },
  {
    id: 'solana:testnet',
    name: 'Solana Testnet',
    rpcUrls: [
      'https://api.testnet.solana.com',
      'https://solana-testnet.rpc.extrnode.com'
    ],
    namespace: 'solana'
  }
];
  
  