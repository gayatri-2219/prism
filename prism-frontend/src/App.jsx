import React from "react";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import PrismApp from "./PrismApp";

function shortenAddress(value) {
  if (!value) return "";
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export default function App() {
  const { initiaAddress, openConnect, openWallet } = useInterwovenKit();

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Initia Hackathon Starter</p>
          <h1>Prism</h1>
        </div>

        {!initiaAddress ? (
          <button className="primary-button" onClick={openConnect} type="button">
            Connect Wallet
          </button>
        ) : (
          <button className="secondary-button" onClick={openWallet} type="button">
            {shortenAddress(initiaAddress)}
          </button>
        )}
      </header>

      <main className="content">
        <PrismApp />
      </main>
    </div>
  );
}

