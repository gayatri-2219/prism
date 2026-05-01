/**
 * Initia RPC Service
 * Wrapper for Initia REST, Tendermint RPC, and JSON-RPC (EVM) endpoints.
 */

import axios, { AxiosInstance } from "axios";
import { CoinBalance, TxRecord } from "../types";

// ─── Configuration ──────────────────────────────────────────────────────────

const REST_URL = process.env.INITIA_REST_URL || "https://rest.testnet.initia.xyz";
const RPC_URL = process.env.INITIA_RPC_URL || "https://rpc.testnet.initia.xyz";
const JSON_RPC_URL = process.env.INITIA_JSON_RPC_URL || "https://json-rpc.testnet.initia.xyz";

// ─── HTTP Clients ───────────────────────────────────────────────────────────

const restClient: AxiosInstance = axios.create({
  baseURL: REST_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

const rpcClient: AxiosInstance = axios.create({
  baseURL: RPC_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

const jsonRpcClient: AxiosInstance = axios.create({
  baseURL: JSON_RPC_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ─── REST API Functions ─────────────────────────────────────────────────────

/**
 * Fetch all coin balances for an address via Cosmos bank module.
 */
export async function getBalance(address: string): Promise<CoinBalance[]> {
  try {
    const { data } = await restClient.get(
      `/cosmos/bank/v1beta1/balances/${address}`
    );
    return (data.balances || []).map((b: any) => ({
      denom: b.denom,
      amount: b.amount,
    }));
  } catch (err) {
    console.error(`[initiaRPC] getBalance failed for ${address}:`, err);
    return [];
  }
}

/**
 * Fetch transaction history for an address.
 * Uses the Cosmos tx search endpoint filtered by sender events.
 */
export async function getTxHistory(
  address: string,
  limit: number = 20
): Promise<TxRecord[]> {
  try {
    // Search for txs where this address is the sender
    const { data } = await restClient.get("/cosmos/tx/v1beta1/txs", {
      params: {
        events: `message.sender='${address}'`,
        "pagination.limit": limit,
        "pagination.reverse": true,
        order_by: "ORDER_BY_DESC",
      },
    });

    const txResponses = data.tx_responses || [];

    return txResponses.map((tx: any) => {
      const msgs = tx.tx?.body?.messages || [];
      const firstMsg = msgs[0] || {};

      // Determine transaction type from message type URL
      const typeUrl: string = firstMsg["@type"] || "";
      let txType = "unknown";
      if (typeUrl.includes("MsgExecuteContract")) {
        // Parse the execute message to determine action
        const execMsg = firstMsg.msg ? JSON.parse(firstMsg.msg) : {};
        if (execMsg.deposit) txType = "deposit";
        else if (execMsg.withdraw) txType = "withdraw";
        else if (execMsg.claim) txType = "claim";
        else if (execMsg.rebalance) txType = "rebalance";
        else txType = "contract_call";
      } else if (typeUrl.includes("MsgSend")) {
        txType = "transfer";
      } else if (typeUrl.includes("MsgDelegate")) {
        txType = "stake";
      }

      // Extract amount from funds or value
      const funds = firstMsg.funds || firstMsg.amount || [];
      const coin = Array.isArray(funds) ? funds[0] : funds;

      return {
        hash: tx.txhash,
        type: txType,
        amount: coin ? parseFloat(coin.amount) / 1e6 : 0,
        denom: coin?.denom || "uinit",
        timestamp: tx.timestamp,
        blockHeight: parseInt(tx.height, 10),
      };
    });
  } catch (err) {
    console.error(`[initiaRPC] getTxHistory failed for ${address}:`, err);
    return [];
  }
}

/**
 * Resolve .init username for an address via the Initia MNS module.
 */
export async function resolveInitUsername(
  address: string
): Promise<string | null> {
  try {
    const { data } = await restClient.get("/initia/mns/v1/names", {
      params: { address },
    });

    const names = data.names || [];
    if (names.length > 0) {
      return names[0].name || names[0];
    }
    return null;
  } catch (err) {
    // MNS may not be available on all networks — fail silently
    console.warn(`[initiaRPC] resolveInitUsername failed for ${address}`);
    return null;
  }
}

// ─── JSON-RPC (EVM) Functions ───────────────────────────────────────────────

let rpcId = 1;

/**
 * Execute an eth_call against the Initia EVM layer.
 * @param contractAddr - The contract address (0x prefixed)
 * @param data         - ABI-encoded calldata (0x prefixed hex)
 * @param from         - Optional sender address for context
 * @returns Raw hex result from the call
 */
export async function ethCall(
  contractAddr: string,
  data: string,
  from?: string
): Promise<string> {
  const callObject: Record<string, string> = {
    to: contractAddr,
    data,
  };
  if (from) {
    callObject.from = from;
  }

  const { data: result } = await jsonRpcClient.post("/", {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [callObject, "latest"],
    id: rpcId++,
  });

  if (result.error) {
    throw new Error(
      `eth_call error: ${result.error.message} (code: ${result.error.code})`
    );
  }

  return result.result;
}

/**
 * Get the latest block number from the EVM layer.
 */
export async function getBlockNumber(): Promise<number> {
  try {
    const { data } = await jsonRpcClient.post("/", {
      jsonrpc: "2.0",
      method: "eth_blockNumber",
      params: [],
      id: rpcId++,
    });
    return parseInt(data.result, 16);
  } catch (err) {
    console.error("[initiaRPC] getBlockNumber failed:", err);
    return 0;
  }
}

/**
 * Fetch DEX pool data from Initia REST (used by syncOpportunities).
 */
export async function getDexPools(): Promise<any[]> {
  try {
    const { data } = await restClient.get("/initia/move/v1/dex/pools");
    return data.pools || [];
  } catch (err) {
    console.error("[initiaRPC] getDexPools failed:", err);
    return [];
  }
}

/**
 * Simple health check — verify the chain endpoint is reachable.
 */
export async function isChainReachable(): Promise<boolean> {
  try {
    const { data } = await rpcClient.get("/status");
    return !!data?.result?.node_info;
  } catch {
    return false;
  }
}
