// src/utils/chainHelpers.ts
import { chainInfo } from '../constants/contractFactoryAddresses';

export function getExplorerBaseUrl(chainId: string | number): string {
  const id = chainId.toString();
  return chainInfo[id]?.explorerBaseUrl || 'https://etherscan.io'; // default
}

export function getChainName(chainId: string | number): string {
  const id = chainId.toString();
  return chainInfo[id]?.chainName || 'Unknown Chain';
}
