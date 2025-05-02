/**
 * Utility functions for working with localStorage
 */

/**
 * Tests if localStorage is available and working
 * @returns {boolean} True if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  const testKey = '__test__';
  
  try {
    // Try to set a test item
    localStorage.setItem(testKey, testKey);
    // If it worked, remove it
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage is not available:', e);
    return false;
  }
}

/**
 * Interface for room creation data
 */
export interface RoomCreationData {
  isCreator: true;
  playerName: string;
  roomId: string;
  entryFee: string;
  chain: string | number;
  contractAddress: string;
  walletAddress: string;
  namespace: string;
}

/**
 * Interface for room joining data
 */
export interface RoomJoiningData {
  isCreator: false;
  playerName: string;
  roomId: string;
  contractAddress: string;
  walletAddress: string;
  chain: string | number;
  namespace: string;
  entryFee: string;
}

/**
 * Saves room creation data to localStorage
 * @param data The room creation data to save
 * @returns {boolean} True if save was successful
 */
export function saveRoomCreationData(data: RoomCreationData): boolean {
  try {
    localStorage.setItem('roomCreation', JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Error storing room creation data:', e);
    return false;
  }
}

/**
 * Saves room joining data to localStorage
 * @param data The room joining data to save
 * @returns {boolean} True if save was successful
 */
export function saveRoomJoiningData(data: RoomJoiningData): boolean {
  try {
    localStorage.setItem('roomJoining', JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Error storing room joining data:', e);
    return false;
  }
}

/**
 * Gets room creation data from localStorage
 * @returns {RoomCreationData | null} The room creation data or null if not found
 */
export function getRoomCreationData(): RoomCreationData | null {
  try {
    const data = localStorage.getItem('roomCreation');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error retrieving room creation data:', e);
    return null;
  }
}

/**
 * Gets room joining data from localStorage
 * @returns {RoomJoiningData | null} The room joining data or null if not found
 */
export function getRoomJoiningData(): RoomJoiningData | null {
  try {
    const data = localStorage.getItem('roomJoining');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error retrieving room joining data:', e);
    return null;
  }
}

/**
 * Clears all room related data from localStorage
 */
export function clearAllRoomData() {
  try {
    // Game-specific localStorage items
    localStorage.removeItem('roomId');
    localStorage.removeItem('playerName');
    localStorage.removeItem('roomCreation');
    localStorage.removeItem('roomJoining');
    
    // Web3-related storage items
    if (localStorage.getItem('wagmi.store')) {
      localStorage.removeItem('wagmi.store');
    }
    if (localStorage.getItem('@appkit/portfolio_cache')) {
      localStorage.removeItem('@appkit/portfolio_cache');
    }
    if (localStorage.getItem('lace-wallet-mode')) {
      localStorage.removeItem('lace-wallet-mode');
    }
    if (localStorage.getItem('debug')) {
      localStorage.removeItem('debug');
    }
    
    return true;
  } catch (e) {
    console.error('Error clearing room data', e);
    return false;
  }
}