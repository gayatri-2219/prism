import { useInterwovenKit } from '@initia/interwovenkit-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useTVL } from '../../hooks/useContractPosition';
import { NATIVE_SYMBOL, CONTRACT_ADDRESS } from '../../lib/config';

export function PricingPage() {
  const { openConnect, openBridge, initiaAddress } = useInterwovenKit() as any;
  const { data: network } = useNetworkStatus();
  const { data: tvl } = useTVL();
  const connected = Boolean(initiaAddress);

  const features = [
    { title: "Smart Contract", items: ["IAERouter multi-strategy execution", "Position tracking (deposit/withdraw)", "Risk score management (1-100)", "Strategy allocation engine", "Session key authorization"], live: true },
    { title: "Initia Native", items: ["InterwovenKit wallet connection", "Auto-signing via requestTxBlock", "Initia usernames (.init)", "Interwoven cross-chain bridge", "MiniEVM smart contract calls"], live: true },
    { title: "AI Intelligence", items: ["Portfolio-aware AI assistant", "Real-time strategy recommendations", "Airdrop tracking & guidance", "Risk analysis & optimization", "Natural language DeFi queries"], live: true },
  ];

  return (
    <div style={{ padding: "48px 64px 60px" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(43,140,150,.08)", borderRadius: 20, padding: "6px 14px", marginBottom: 20, fontSize: 13, color: "#2B8C96", fontWeight: 600 }}>Architecture & Features</div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>How PRISM Works</h1>
        <p style={{ fontSize: 16, color: "#64748b" }}>A fully on-chain DeFi intelligence layer built natively on Initia</p>
      </div>

      {/* Live Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 40 }}>
        {[
          { label: "Network", value: network?.online ? "Online" : "Offline", sub: network?.chainId || "initiation-2" },
          { label: "Latest Block", value: network?.latestBlock ? `#${network.latestBlock.toLocaleString()}` : "--", sub: `${network?.latency ?? '--'}ms latency` },
          { label: "TVL", value: tvl ? `${tvl.toFixed(4)}` : "0", sub: NATIVE_SYMBOL },
          { label: "Contract", value: "Deployed", sub: `${CONTRACT_ADDRESS.slice(0, 10)}...` },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Feature Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 48 }}>
        {features.map(f => (
          <div key={f.title} style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #e2e8f0", position: "relative" }}>
            {f.live && <div style={{ position: "absolute", top: 16, right: 16, background: "#dcfce7", color: "#22c55e", borderRadius: 8, padding: "2px 10px", fontSize: 10, fontWeight: 700 }}>LIVE</div>}
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: "#1e293b", marginBottom: 16 }}>{f.title}</div>
            {f.items.map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 13, color: "#475569" }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Contract Info */}
      <div style={{ background: "#f8fafc", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 800, margin: "0 auto", border: "1px solid #e2e8f0" }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Ready to try it?</h3>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>PRISM is live on Initia testnet. Connect your wallet, bridge some tokens, and start earning.</p>
        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 24, fontFamily: "monospace" }}>Contract: {CONTRACT_ADDRESS}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          {!connected && <button onClick={() => openConnect?.()} style={{ background: "linear-gradient(135deg,#1E2749,#2B8C96)", color: "#fff", border: "none", borderRadius: 14, padding: "14px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Connect Wallet</button>}
          <button onClick={() => openBridge?.()} style={{ background: connected ? "linear-gradient(135deg,#1E2749,#2B8C96)" : "#fff", color: connected ? "#fff" : "#1e293b", border: connected ? "none" : "2px solid #e2e8f0", borderRadius: 14, padding: "14px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Bridge to Initia</button>
          <a href={`https://scan.testnet.initia.xyz/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" style={{ background: "#fff", color: "#1e293b", border: "2px solid #e2e8f0", borderRadius: 14, padding: "14px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>View on Scan</a>
        </div>
      </div>
    </div>
  );
}
