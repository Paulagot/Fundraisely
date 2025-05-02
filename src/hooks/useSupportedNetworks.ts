// src/hooks/useSupportedNetworks.ts
import { useAppKitState, useAppKitNetwork } from '@reown/appkit/react';
import { networks } from '../config';

export interface SupportedNetwork {
  id: string | number; // Number for EVM, string for Solana
  name: string;
  isEvm: boolean;
  namespace: 'eip155' | 'solana'; // Namespace for wallet connection
}

interface UseSupportedNetworksReturn {
  supportedNetworks: SupportedNetwork[];
  currentNetwork: SupportedNetwork | null;
  switchNetwork: (networkId: string | number) => Promise<void>;
}

export function useSupportedNetworks(): UseSupportedNetworksReturn {
  const { selectedNetworkId } = useAppKitState();
  const { switchNetwork } = useAppKitNetwork();

  // Map networks to SupportedNetwork
  const supportedNetworks: SupportedNetwork[] = networks.map((network) => ({
    id: network.id,
    name: network.name,
    isEvm: typeof network.id !== 'string',
    namespace: typeof network.id !== 'string' ? 'eip155' : 'solana',
  }));

  // Log networks for debugging
  console.log('Supported Networks:', supportedNetworks.map(n => ({
    id: n.id,
    name: n.name,
    isEvm: n.isEvm,
    namespace: n.namespace,
    idType: typeof n.id,
  })));

  // Find current network based on selectedNetworkId (e.g., "eip155:11155111" or "solana:5eykt4Us...")
  const activeChainId = selectedNetworkId?.split(':')[1];
  const currentNetwork = supportedNetworks.find((n) => String(n.id) === activeChainId) || null;

  // Wrapper for switchNetwork to use network ID
  const switchNetworkById = async (networkId: string | number) => {
    console.log('Switching to networkId:', networkId, 'Type:', typeof networkId);
    const appKitNetwork = networks.find((n) => String(n.id) === String(networkId));
    console.log('Found AppKitNetwork:', appKitNetwork);
    if (!appKitNetwork) {
      throw new Error(`Network with ID ${networkId} not found`);
    }
    await switchNetwork(appKitNetwork);
  };

  return {
    supportedNetworks,
    currentNetwork,
    switchNetwork: switchNetworkById,
  };
}