
//src/constants/contractFactoryAddresses.ts
interface ChainInfo {
  factoryAddress: string;
  explorerBaseUrl: string;
  chainName: string;
}

export const chainInfo: Record<string, ChainInfo> = {
  // EVM chains
  '11155111': {
    factoryAddress: '0xee229449a2A49995e39194373ab6f9485e975E44',
    explorerBaseUrl: 'https://sepolia.etherscan.io',
    chainName: 'Sepolia Testnet',
  },
  '84532': {
    factoryAddress: '0x87F769E07a7750610C2453E62FD1b20427c58eB9',
    explorerBaseUrl: 'https://base-sepolia.blockscout.com/',
    chainName: 'Base Sepolia',
  },
  '168587773': {
    factoryAddress: '0xstomakeupfactoryaddress',
    explorerBaseUrl: 'https://sepolia.blastexplorer.io',
    chainName: 'Blast Sepolia Testnet',
  },
  '1': {
    factoryAddress: '0xYourMainnetFactoryAddress',
    explorerBaseUrl: 'https://etherscan.io',
    chainName: 'Ethereum Mainnet',
  },
  '137': {
    factoryAddress: '0xYourPolygonFactoryAddress',
    explorerBaseUrl: 'https://polygonscan.com',
    chainName: 'Polygon Mainnet',
  },
  '80001': {
    factoryAddress: '0xYourMumbaiFactoryAddress',
    explorerBaseUrl: 'https://mumbai.polygonscan.com',
    chainName: 'Polygon Mumbai',
  },
  // Solana examples (explorer URLs slightly different)
  '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
    factoryAddress: 'YourSolanaProgramID',
    explorerBaseUrl: 'https://explorer.solana.com', // Solana Mainnet
    chainName: 'Solana Mainnet',
  },
  '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ': {
    factoryAddress: 'YourSolanaDevnetProgramID',
    explorerBaseUrl: 'https://explorer.solana.com?cluster=devnet',
    chainName: 'Solana Devnet',
  },
  'EtWTRAB3otaBmnFX35JQraEv1AmaPD4swrE9YAR7u9ZN': {
    factoryAddress: 'YourSolanaTestnetProgramID',
    explorerBaseUrl: 'https://explorer.solana.com?cluster=testnet',
    chainName: 'Solana Testnet',
  },
};