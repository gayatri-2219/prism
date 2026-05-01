export const SCAN_BASE = import.meta.env.VITE_SCAN_BASE_URL ?? 'https://scan.testnet.initia.xyz';

export const txUrl = (hash: string) => `${SCAN_BASE}/tx/${hash}`;
export const addressUrl = (addr: string) => `${SCAN_BASE}/address/${addr}`;
export const contractUrl = (addr: string) => `${SCAN_BASE}/address/${addr}#contract`;
