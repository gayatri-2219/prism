import { Buffer } from "buffer";

window.Buffer = Buffer;
window.process = { env: { NODE_ENV: "development" } };

import React from "react";
import ReactDOM from "react-dom/client";
import "@initia/interwovenkit-react/styles.css";
import {
  InterwovenKitProvider,
  TESTNET,
  injectStyles,
} from "@initia/interwovenkit-react";
import InterwovenKitStyles from "@initia/interwovenkit-react/styles.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import App from "./App";
import "./styles.css";

injectStyles(InterwovenKitStyles);

const queryClient = new QueryClient();
const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
});

const customChain = {
  chain_id: import.meta.env.VITE_APPCHAIN_ID,
  chain_name: "prism",
  pretty_name: "Prism Appchain",
  network_type: "testnet",
  bech32_prefix: "init",
  apis: {
    rpc: [{ address: "http://localhost:26657" }],
    rest: [{ address: "http://localhost:1317" }],
    indexer: [{ address: "http://localhost:8080" }],
    "json-rpc": [
      { address: import.meta.env.VITE_JSON_RPC_URL ?? "http://localhost:8545" },
    ],
  },
  fees: {
    fee_tokens: [
      {
        denom: import.meta.env.VITE_NATIVE_DENOM,
        fixed_min_gas_price: 0,
        low_gas_price: 0,
        average_gas_price: 0,
        high_gas_price: 0,
      },
    ],
  },
  staking: {
    staking_tokens: [{ denom: import.meta.env.VITE_NATIVE_DENOM }],
  },
  metadata: {
    is_l1: false,
    minitia: {
      type: "minievm",
    },
  },
  native_assets: [
    {
      denom: import.meta.env.VITE_NATIVE_DENOM,
      name: "Prism Native Token",
      symbol: import.meta.env.VITE_NATIVE_SYMBOL,
      decimals: Number(import.meta.env.VITE_NATIVE_DECIMALS ?? 18),
    },
  ],
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <InterwovenKitProvider
          {...TESTNET}
          defaultChainId={customChain.chain_id}
          customChain={customChain}
          customChains={[customChain]}
        >
          <App />
        </InterwovenKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);

