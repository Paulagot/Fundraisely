import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import {
  mainnet,
  sepolia,
  baseSepolia,
  base,
  blastSepolia,
  polygon,
  arbitrum,
  solana,
  solanaDevnet,
  solanaTestnet,
  optimismSepolia,
  bobSepolia,
  rootstockTestnet,
  seiDevnet,
  avalanche,
  arbitrumSepolia,
  blast,
  optimism,
  bob,
  rootstock,
  sei,
} from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694';

if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const metadata = {
  name: 'AppKit',
  description: 'AppKit Example',
  url: 'https://reown.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

// ✅ THIS is the key part: networks must be defined at the top level
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
 
  sepolia,
  baseSepolia,
  blastSepolia,
  optimismSepolia,
  arbitrumSepolia,
  bobSepolia,
  rootstockTestnet,
  seiDevnet,
  solanaDevnet,
  solanaTestnet,
  mainnet,
    base,
  blast,
  optimism,
  arbitrum,
  bob,
  rootstock,
  sei,
  avalanche,
  polygon,
  solana,
  
 
];

console.log('✅ Reown networks configured:', networks.map(n => ({ id: n.id, name: n.name }))); // ✅ this should now work
console.log(solana.id, solanaDevnet.id, solanaTestnet.id);

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const solanaWeb3JsAdapter = new SolanaAdapter();
export const config = wagmiAdapter.wagmiConfig;
