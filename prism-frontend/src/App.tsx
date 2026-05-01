import { useState } from 'react';
import { useInterwovenKit } from '@initia/interwovenkit-react';
import { PrismNavbar } from './app/components/PrismNavbar';
import { HomePage } from './app/pages/HomePage';
import { DashboardPage } from './app/pages/DashboardPage';
import { AIPage } from './app/pages/AIPage';
import { DiscoverPage } from './app/pages/DiscoverPage';
import { PricingPage } from './app/pages/PricingPage';

export default function App() {
  const [page, setPage] = useState("home");
  const { initiaAddress, evmAddress, username, openConnect, openWallet, openBridge, requestTxBlock } = useInterwovenKit() as any;
  const connected = Boolean(initiaAddress);
  const usernameLabel = username
    ? (String(username).endsWith('.init') ? String(username) : `${username}.init`)
    : undefined;

  // Fonts are loaded via index.html (Outfit + Space Grotesk)

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
      <PrismNavbar
        page={page}
        setPage={setPage}
        connected={connected}
        username={usernameLabel}
        onWalletClick={() => (initiaAddress ? openWallet?.() : openConnect?.())}
      />
      {page === "home" && (
        <HomePage
          setPage={setPage}
          username={usernameLabel}
          connected={connected}
          initiaAddress={initiaAddress}
          evmAddress={evmAddress}
          onConnect={() => openConnect?.()}
          onBridge={() => openBridge?.()}
        />
      )}
      {page === "dashboard" && (
        <DashboardPage
          setPage={setPage}
          connected={connected}
          initiaAddress={initiaAddress}
          evmAddress={evmAddress}
          username={usernameLabel}
          onConnect={() => openConnect?.()}
          onBridge={() => openBridge?.()}
          requestTxBlock={requestTxBlock}
        />
      )}
      {page === "ai" && (
        <AIPage
          connected={connected}
          initiaAddress={initiaAddress}
          evmAddress={evmAddress}
        />
      )}
      {page === "discover" && <DiscoverPage />}
      {page === "pricing" && <PricingPage />}
    </div>
  );
}
