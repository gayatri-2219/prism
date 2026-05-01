/**
 * Centralized Configuration
 * All environment variables and constants in one place.
 */

export const config = {
  // Server
  port: parseInt(process.env.PORT || "3001", 10),
  wsPort: parseInt(process.env.WS_PORT || "3002", 10),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",

  // Initia EVM
  initiaEvmRpc: process.env.INITIA_EVM_RPC || "https://evm-rpc.testnet.initia.xyz",
  initiaRestApi: process.env.INITIA_REST_API || process.env.INITIA_REST_URL || "https://rest.testnet.initia.xyz",
  initiaRpcUrl: process.env.INITIA_RPC_URL || "https://rpc.testnet.initia.xyz",
  initiaJsonRpc: process.env.INITIA_JSON_RPC_URL || "https://json-rpc.testnet.initia.xyz",
  chainId: parseInt(process.env.CHAIN_ID || "1336", 10),

  // Contracts
  iaeContract: process.env.IAE_CONTRACT_ADDRESS || "0x47E065e4653cAcbA7E804f1eA5c68deC6C6A8F63",
  multicall3: process.env.MULTICALL3_ADDRESS || "0xcA11bde05977b3631167028862bE2a173976CA11",
  strategyManager: process.env.STRATEGY_MANAGER_ADDRESS || "0x0000000000000000000000000000000000000000",
  usdcAddress: process.env.USDC_ADDRESS || "0x0000000000000000000000000000000000000000",
  bridgePrecompile: process.env.BRIDGE_PRECOMPILE || "0x0000000000000000000000000000000000000099",

  // Keys
  privateKey: process.env.PRIVATE_KEY || "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",

  // Redis
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  // Cache TTLs (seconds)
  insightsCacheTtl: 300,     // 5 minutes
  opportunitiesCacheTtl: 120, // 2 minutes
  portfolioCacheTtl: 30,      // 30 seconds
} as const;
