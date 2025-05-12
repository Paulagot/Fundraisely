interface ChainInfo {
  factoryAddress: string;
  explorerBaseUrl: string;
  chainName: string;
  usdcAddress?: string; // Optional, only for testnets with mock USDC
}

export const chainInfo: Record<string, ChainInfo> = {
  // Testnets with USDC addresses
  '11155111': {
    factoryAddress: '0xee229449a2A49995e39194373ab6f9485e975E44',
    explorerBaseUrl: 'https://sepolia.etherscan.io',
    chainName: 'Sepolia Testnet',
    usdcAddress: '0xDEadd2F1102897C89D3214452A583ADf13E23855', // Sepolia USDC
  },
  '84532': {
    factoryAddress: '0x87F769E07a7750610C2453E62FD1b20427c58eB9',
    explorerBaseUrl: 'https://base-sepolia.blockscout.com/',
    chainName: 'Base Sepolia',
    usdcAddress: '0x0713adEE4545945a0d3B036913Da9c4D6a7ff7b9', // Base Sepolia USDC
  },
  '421614': {
    factoryAddress: '0xb474aBaE16cc4EAF8b207Eab634d35fb0EaaAA43',
    explorerBaseUrl: 'https://sepolia.arbiscan.io',
    chainName: 'Arbitrum Sepolia Testnet',
    usdcAddress: '0x4ACd38F1460234474077cC24399485B403CCe39C', // Arbitrum Sepolia USDC
  },
  '43113': {
    factoryAddress: '0xb474aBaE16cc4EAF8b207Eab634d35fb0EaaAA43',
    explorerBaseUrl: 'https://testnet.snowtrace.io',
    chainName: 'Avalanche Fuji C-Chain',
    usdcAddress: '0x4ACd38F1460234474077cC24399485B403CCe39C', // Replace with actual Fuji USDC address if available
  },
  '11155420': {
    factoryAddress: '0xb474aBaE16cc4EAF8b207Eab634d35fb0EaaAA43',
    explorerBaseUrl: 'https://sepolia-optimism.etherscan.io/',
    chainName: 'Optimism Sepolia Testnet',
    usdcAddress: '0x4ACd38F1460234474077cC24399485B403CCe39C', // Replace with actual address if available
  },
  '1328': {
    factoryAddress: '0xb474aBaE16cc4EAF8b207Eab634d35fb0EaaAA43',
    explorerBaseUrl: 'https://seitrace.com/',
    chainName: 'Sei Devnet',
    usdcAddress: '0x4ACd38F1460234474077cC24399485B403CCe39C', // Replace with actual address if available
  },
  '8080': {
    factoryAddress: '0xYourBOBSepoliaFactoryAddress',
    explorerBaseUrl: 'https://sepolia-explorer.gobob.xyz',
    chainName: 'BOB Sepolia Testnet',
    usdcAddress: '0xYourBOBSepoliaUSDCAddress', // Replace with actual address if available
  },
  '168587773': {
    factoryAddress: '0xstomakeupfactoryaddress',
    explorerBaseUrl: 'https://sepolia.blastexplorer.io',
    chainName: 'Blast Sepolia Testnet',
    usdcAddress: '0xYourBlastSepoliaUSDCAddress', // Replace with actual address if available
  },

  // Mainnets (no USDC address since minting is testnet-only)
  '1': {
    factoryAddress: '0xYourMainnetFactoryAddress',
    explorerBaseUrl: 'https://etherscan.io',
    chainName: 'Ethereum Mainnet',
  },
  '8453': {
    factoryAddress: '0xYourBaseFactoryAddress',
    explorerBaseUrl: 'https://basescan.org',
    chainName: 'Base Mainnet',
  },
  '81457': {
    factoryAddress: '0xYourBlastFactoryAddress',
    explorerBaseUrl: 'https://blastscan.io',
    chainName: 'Blast Mainnet',
  },
  '10': {
    factoryAddress: '0xYourOptimismFactoryAddress',
    explorerBaseUrl: 'https://optimistic.etherscan.io',
    chainName: 'Optimism Mainnet',
  },
  '42161': {
    factoryAddress: '0xYourArbitrumFactoryAddress',
    explorerBaseUrl: 'https://arbiscan.io',
    chainName: 'Arbitrum One',
  },
  '43114': {
    factoryAddress: '0xYourAvalancheFactoryAddress',
    explorerBaseUrl: 'https://snowtrace.io',
    chainName: 'Avalanche C-Chain',
  },
  '30': {
    factoryAddress: '0xYourRootstockFactoryAddress',
    explorerBaseUrl: 'https://explorer.rsk.co',
    chainName: 'Rootstock Mainnet',
  },
  '60808': {
    factoryAddress: '0xYourBOBFactoryAddress',
    explorerBaseUrl: 'https://explorer.gobob.xyz',
    chainName: 'BOB Mainnet',
  },
  '1329': {
    factoryAddress: '0xYourSeiFactoryAddress',
    explorerBaseUrl: 'https://explorer.sei.io',
    chainName: 'Sei Mainnet',
  },
  '137': {
    factoryAddress: '0xYourPolygonFactoryAddress',
    explorerBaseUrl: 'https://polygonscan.com',
    chainName: 'Polygon Mainnet',
  },

  // Solana chains (no USDC address since minting is EVM-only)
  '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
    factoryAddress: 'YourSolanaProgramID',
    explorerBaseUrl: 'https://explorer.solana.com',
    chainName: 'Solana Mainnet',
  },
  'EtWTRABZaYq6iMfeYKouRu166VU2xqa1': {
    factoryAddress: 'Ev3D1mV3m1HZFZAJb8r68VoURxUxJq1o9vtcajZKXgDo',
    explorerBaseUrl: 'https://explorer.solana.com?cluster=devnet',
    chainName: 'Solana Devnet',
    usdcAddress: '4UM2Qtb6mY9eyxFwnSy8X3nv5azk3JYHA1arsEgyrEid',
  },
  '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z': {
    factoryAddress: 'YourSolanaTestnetProgramID',
    explorerBaseUrl: 'https://explorer.solana.com?cluster=testnet',
    chainName: 'Solana Testnet',
  },
};