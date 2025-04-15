import { ethers } from 'ethers';
import fs from 'node:fs';
import path from 'node:path';

// File path for storing used transactions
const USED_TX_FILE = path.join(process.cwd(), 'usedTransactions.json');

// Initialize used transactions set from file
let usedTransactions = new Set();
try {
  if (fs.existsSync(USED_TX_FILE)) {
    const data = fs.readFileSync(USED_TX_FILE, 'utf8');
    usedTransactions = new Set(JSON.parse(data));
    console.log(`Loaded ${usedTransactions.size} used transactions from storage`);
  }
} catch (error) {
  console.log('No existing transactions file or error reading it, starting fresh');
}

// Function to save used transactions to file
function saveUsedTransactions() {
  try {
    fs.writeFileSync(
      USED_TX_FILE,
      JSON.stringify([...usedTransactions]),
      'utf8'
    );
  } catch (error) {
    console.error('Error saving used transactions:', error);
  }
}

// Initialize provider (you may want to move this to a separate file)
const PROVIDER_URL = process.env.ETH_PROVIDER_URL || 'https://sepolia.infura.io/v3/a2b574c5d6554590a07a268c41132463';
const provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);

async function testInfuraConnection() {
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Successfully connected to Ethereum network via Infura. Current block: ${blockNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Infura:', error.message);
    return false;
  }
}
testInfuraConnection();

/**
 * Verifies a payment transaction on the blockchain
 * 
 * @param {Object} params Verification parameters
 * @param {string} params.txHash Transaction hash to verify
 * @param {string} params.sender Address that sent the payment
 * @param {string} params.recipient Expected recipient address
 * @param {string} params.amount Expected payment amount in ETH
 * @param {number} [params.confirmations=1] Number of confirmations required
 * @returns {Promise<Object>} Verification result
 */
export async function verifyPayment({
  txHash,
  sender,
  recipient,
  amount,
  confirmations = 1
}) {
  try {
    // Check if transaction has been used before
    if (usedTransactions.has(txHash)) {
      return {
        success: false,
        error: 'Transaction has already been used'
      };
    }

    // Normalize addresses
    const normalizedSender = ethers.utils.getAddress(sender);
    const normalizedRecipient = ethers.utils.getAddress(recipient);
    
    // Get transaction details
    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
      return {
        success: false,
        error: 'Transaction not found'
      };
    }
    
    // Check sender
    if (tx.from.toLowerCase() !== normalizedSender.toLowerCase()) {
      return {
        success: false,
        error: 'Transaction sender does not match'
      };
    }
    
    // Check recipient
    if (tx.to.toLowerCase() !== normalizedRecipient.toLowerCase()) {
      return {
        success: false,
        error: 'Transaction recipient does not match'
      };
    }
    
    // Check amount (convert to same units for comparison)
    const expectedWei = ethers.utils.parseEther(amount);
    if (!tx.value.eq(expectedWei)) {
      return {
        success: false,
        error: 'Transaction amount does not match'
      };
    }
    
    // Check transaction confirmations
    if (confirmations > 0) {
      // Get current transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return {
          success: false,
          error: 'Transaction not confirmed yet'
        };
      }
      
      // Check if transaction was successful
      if (receipt.status !== 1) {
        return {
          success: false,
          error: 'Transaction failed'
        };
      }
      
      // Check number of confirmations
      const currentBlock = await provider.getBlockNumber();
      const txBlock = receipt.blockNumber;
      const currentConfirmations = currentBlock - txBlock + 1;
      
      if (currentConfirmations < confirmations) {
        return {
          success: false,
          error: `Insufficient confirmations (${currentConfirmations}/${confirmations})`
        };
      }
      
      // Check transaction age
      const block = await provider.getBlock(receipt.blockNumber);
      const txTimestamp = block.timestamp;
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Transactions older than 1 hour not accepted (3600 seconds)
      const MAX_TX_AGE = 3600;
      if (currentTime - txTimestamp > MAX_TX_AGE) {
        return {
          success: false,
          error: 'Transaction is too old (more than 1 hour)'
        };
      }
    }
    
    // All checks passed, mark transaction as used
    usedTransactions.add(txHash);
    saveUsedTransactions();
    
    // Return success result
    return {
      success: true,
      transaction: tx
    };
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      error: `Payment verification failed: ${error.message}`
    };
  }
}