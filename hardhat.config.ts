import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-toolbox-mocha-ethers";

dotenv.config();

const { PRIVATE_KEY, FUJI_RPC_URL } = process.env;

// Format and validate private key
const formattedPrivateKey = PRIVATE_KEY 
  ? (() => {
      const cleaned = PRIVATE_KEY.trim().replace(/^0x/, '');
      // Validate it's a 64-character hex string
      if (!/^[0-9a-fA-F]{64}$/.test(cleaned)) {
        console.warn('Warning: PRIVATE_KEY in .env should be a 64-character hex string');
        return undefined;
      }
      return `0x${cleaned}`;
    })()
  : undefined;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    fuji: {
      type: 'http',
      url: FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: formattedPrivateKey ? [formattedPrivateKey] : [],
      chainId: 43113,
    },
    // Optional: add Avalanche Mainnet (for future deployment)
    avalanche: {
      type: 'http',
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts: formattedPrivateKey ? [formattedPrivateKey] : [],
      chainId: 43114,
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
};

export default config;
