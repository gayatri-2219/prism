import type { Address } from "viem";

export const PROD_BACKEND_URL = "https://backend-gilt-seven-59.vercel.app";
export const API_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD ? "" : "http://localhost:3001");
export const API_FALLBACK_URL = PROD_BACKEND_URL;
export const REST_URL = import.meta.env.VITE_REST_URL ?? "http://localhost:1317";
export const CHAIN_ID = import.meta.env.VITE_APPCHAIN_ID ?? "initiation-2";
export const CONTRACT_ADDRESS =
  (import.meta.env.VITE_IAE_CONTRACT_ADDRESS as Address | undefined) ??
  (import.meta.env.VITE_PRISM_TREASURY_CONTRACT as Address | undefined) ??
  "0x0000000000000000000000000000000000000000";
export const NATIVE_DENOM = import.meta.env.VITE_NATIVE_DENOM ?? "uinit";
export const NATIVE_SYMBOL = import.meta.env.VITE_NATIVE_SYMBOL ?? "INIT";
export const NATIVE_DECIMALS = Number(import.meta.env.VITE_NATIVE_DECIMALS ?? 6);
export const BRIDGE_SRC_CHAIN_ID = import.meta.env.VITE_BRIDGE_SRC_CHAIN_ID ?? "initiation-2";
export const BRIDGE_SRC_DENOM = import.meta.env.VITE_BRIDGE_SRC_DENOM ?? "uinit";
export const SCAN_BASE_URL = import.meta.env.VITE_SCAN_BASE_URL ?? "https://scan.testnet.initia.xyz";
