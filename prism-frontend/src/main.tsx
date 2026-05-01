import { createRoot } from 'react-dom/client';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/syne/600.css';
import '@fontsource/syne/700.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InterwovenKitProvider, TESTNET, injectStyles } from '@initia/interwovenkit-react';
import InterwovenKitStyles from '@initia/interwovenkit-react/styles.js';
import '@initia/interwovenkit-react/styles.css';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import App from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import './styles/index.css';
injectStyles(InterwovenKitStyles);

const queryClient = new QueryClient();
const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
});

const appChainId = import.meta.env.VITE_APPCHAIN_ID ?? 'initiation-2';
const useRegistryOnlyChain = appChainId === 'initiation-2' || appChainId === 'interwoven-1';

const customChain = {
  chain_id: appChainId,
  chain_name: 'prism',
  pretty_name: 'Prism Appchain',
  network_type: 'testnet',
  bech32_prefix: 'init',
  apis: {
    rpc: [{ address: import.meta.env.VITE_RPC_URL ?? 'https://rpc.testnet.initia.xyz' }],
    rest: [{ address: import.meta.env.VITE_REST_URL ?? 'https://rest.testnet.initia.xyz' }],
    indexer: [{ address: import.meta.env.VITE_INDEXER_URL ?? 'https://indexer.testnet.initia.xyz' }],
    'json-rpc': [{ address: import.meta.env.VITE_JSON_RPC_URL ?? 'https://json-rpc.testnet.initia.xyz' }],
  },
  fees: {
    fee_tokens: [
      {
        denom: import.meta.env.VITE_NATIVE_DENOM ?? 'uinit',
        fixed_min_gas_price: 0,
        low_gas_price: 0,
        average_gas_price: 0,
        high_gas_price: 0,
      },
    ],
  },
  staking: { staking_tokens: [{ denom: import.meta.env.VITE_NATIVE_DENOM ?? 'uinit' }] },
  metadata: { is_l1: false, minitia: { type: 'minievm' } },
  native_assets: [
    {
      denom: import.meta.env.VITE_NATIVE_DENOM ?? 'uinit',
      name: 'Prism Native Token',
      symbol: import.meta.env.VITE_NATIVE_SYMBOL ?? 'INIT',
      decimals: Number(import.meta.env.VITE_NATIVE_DECIMALS ?? 6),
    },
  ],
};

createRoot(document.getElementById('root') as HTMLElement).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <InterwovenKitProvider
        {...TESTNET}
        defaultChainId={appChainId}
        customChain={useRegistryOnlyChain ? undefined : customChain}
        customChains={useRegistryOnlyChain ? undefined : [customChain]}
      >
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </InterwovenKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
