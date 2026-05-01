import { useInitiaBalance } from '../../hooks/useInitiaBalance';
import { useContractPosition, useTVL } from '../../hooks/useContractPosition';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { NATIVE_SYMBOL } from '../../lib/config';

interface Props {
  setPage: (p: string) => void;
  username?: string;
  connected?: boolean;
  initiaAddress?: string;
  evmAddress?: string;
  onConnect?: () => void;
  onBridge?: () => void;
}

export function HomePage({ setPage, username, connected, initiaAddress, evmAddress, onConnect, onBridge }: Props) {
  const { data: balance } = useInitiaBalance(initiaAddress);
  const { data: position } = useContractPosition(evmAddress);
  const { data: tvl } = useTVL();
  const { data: network } = useNetworkStatus();

  const walletBalance = balance?.formatted ?? 0;
  const deposited = position?.currentBalance ?? 0;
  const totalPortfolio = walletBalance + deposited;
  const riskScore = position?.riskScore ?? 0;
  const autopilotOn = position?.autopilotEnabled ?? false;

  return (
    <div className="page-enter">
      {/* Hero */}
      <section style={{ padding: "clamp(24px,5vw,80px) clamp(16px,5vw,64px) clamp(24px,4vw,60px)", background: "linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%)", minHeight: "90vh", display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }} className="reveal-1">
          <div className="status-pulse" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(43,140,150,.1)", border: "1px solid rgba(43,140,150,.2)", borderRadius: 20, padding: "6px 14px", marginBottom: 32, fontSize: 13, color: "#2B8C96", fontWeight: 600 }}>
            Built on Initia Chain
            {network?.online && (
              <span style={{ marginLeft: 8, color: "#22c55e", fontSize: 11 }}>● Block #{network.latestBlock.toLocaleString()}</span>
            )}
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px,8vw,64px)", fontWeight: 800, lineHeight: 1.05, color: "#0f172a", marginBottom: 8, letterSpacing: -2 }}>
            Turn Crypto<br />Complexity into
          </h1>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px,8vw,64px)", fontWeight: 800, color: "#2B8C96", marginBottom: 24, letterSpacing: -2 }}>Clear Actions</h1>
          <p style={{ fontSize: 18, color: "#64748b", marginBottom: 40, lineHeight: 1.6, maxWidth: 480 }}>AI-powered insights, airdrops, and one-click execution on Initia. Stop guessing. Start earning.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="hover-lift" onClick={() => setPage("discover")} style={{ background: "linear-gradient(135deg,#1E2749,#2B8C96)", color: "#fff", border: "none", borderRadius: 14, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Start Exploring →</button>
            {!connected && (
              <button className="hover-lift" onClick={onConnect} style={{ background: "#fff", color: "#1e293b", border: "2px solid #e2e8f0", borderRadius: 14, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Connect Wallet</button>
            )}
            {connected && (
              <button className="hover-lift" onClick={onBridge} style={{ background: "#fff", color: "#1e293b", border: "2px solid #e2e8f0", borderRadius: 14, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Bridge to Initia</button>
            )}
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#22c55e", fontSize: 20, fontWeight: 800 }}>
                {tvl ? `${tvl.toFixed(2)} ${NATIVE_SYMBOL}` : '--'}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Total Value Locked</div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#2B8C96", fontSize: 20, fontWeight: 800 }}>
                {network?.online ? 'Online' : 'Offline'}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{network?.latency ? `${network.latency}ms latency` : 'Checking...'}</div>
            </div>
          </div>
        </div>

        {/* Live card */}
        <div className="reveal-2 hover-lift" style={{ flex: "1 1 320px", maxWidth: 420, width: "100%", background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 20px 60px rgba(30,39,73,.12)", border: "1px solid #e0e7ff", position: "relative" }}>
          <div style={{ position: "absolute", top: 16, right: 16, background: network?.online ? "#22c55e" : "#ef4444", color: "#fff", borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
            ● {network?.online ? 'Live' : 'Offline'}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#1E2749,#2B8C96)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
              {(username || 'G')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>
                @{username || (connected ? (initiaAddress ? `${initiaAddress.slice(0, 10)}...` : 'wallet') : 'not connected')}
              </div>
              <div style={{ fontSize: 12, color: connected ? "#22c55e" : "#94a3b8", fontWeight: 500 }}>
                {connected ? '● Connected' : '○ Not Connected'}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Wallet Balance</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: "#1e293b" }}>
            {connected ? `${walletBalance.toFixed(4)}` : '--'} <span style={{ fontSize: 16, color: "#94a3b8" }}>{NATIVE_SYMBOL}</span>
          </div>

          {deposited > 0 && (
            <div style={{ fontSize: 13, color: "#2B8C96", marginBottom: 4, marginTop: 4 }}>
              Deposited in Contract: {deposited.toFixed(4)} {NATIVE_SYMBOL}
            </div>
          )}

          {riskScore > 0 && (
            <div style={{ fontSize: 13, color: riskScore <= 33 ? "#22c55e" : riskScore <= 66 ? "#f59e0b" : "#ef4444", marginBottom: 8 }}>
              Risk Score: {riskScore}/100
            </div>
          )}

          {autopilotOn && (
            <div style={{ fontSize: 12, color: "#22c55e", marginBottom: 8 }}>Autopilot Active</div>
          )}

          <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16, marginBottom: 16, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Quick Actions</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setPage("dashboard")} style={{ flex: 1, background: "linear-gradient(135deg,#1E2749,#2B8C96)", color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Dashboard →</button>
              <button onClick={onBridge} style={{ flex: 1, background: "#eef2ff", color: "#1E2749", border: "1px solid #e0e7ff", borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Bridge</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {([
              [position?.strategyCount?.toString() ?? "0", "Strategies"],
              [network?.online ? "✓" : "✗", "Network"],
              ["3", "Airdrops"],
            ] as const).map(([n, l]) => (
              <div key={l} style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#1e293b" }}>{n}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Native Initia */}
      <section className="reveal-3" style={{ padding: "clamp(28px,5vw,80px) clamp(16px,5vw,64px)", background: "#fff", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(43,140,150,.08)", borderRadius: 20, padding: "6px 14px", marginBottom: 24, fontSize: 13, color: "#2B8C96", fontWeight: 600 }}>Powered by Initia</div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px,6vw,44px)", fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>Native Initia Integration</h2>
        <p style={{ fontSize: 16, color: "#64748b", marginBottom: 56, maxWidth: 540, margin: "0 auto 56px" }}>Experience the future of DeFi with Initia's cutting-edge features built right into PRISM</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, maxWidth: 1000, margin: "0 auto" }}>
          {[
            { title: "Initia Usernames", desc: `Human-readable names like @${username || 'gayatri.init'}. ${connected ? 'You\'re connected!' : 'Connect to see yours!'}`, live: connected },
            { title: "Auto-Signing (Session Keys)", desc: "One approval enables seamless transactions. No popup fatigue — register a session key and let Autopilot execute for you.", live: autopilotOn },
            { title: "Interwoven Bridge", desc: "One-click cross-chain bridging to Initia. Bridge assets from Ethereum, Cosmos, and more.", live: true },
          ].map(c => (
            <div key={c.title} className="hover-lift" style={{ background: "#f8fafc", borderRadius: 20, padding: 28, textAlign: "left", border: `1px solid ${c.live ? '#22c55e' : '#e2e8f0'}`, position: "relative" }}>
              {c.live && <div style={{ position: "absolute", top: 12, right: 12, background: "#dcfce7", color: "#22c55e", borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>ACTIVE</div>}
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: "#1e293b", marginBottom: 8 }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{c.desc}</p>
              {c.title.includes("Bridge") && (
                <button onClick={onBridge} style={{ marginTop: 12, background: "linear-gradient(135deg,#1E2749,#2B8C96)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Open Bridge →</button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="reveal-4" style={{ padding: "clamp(28px,5vw,60px) clamp(16px,5vw,64px)", background: "linear-gradient(135deg,#eef2ff,#f0f9ff)", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(26px,6vw,40px)", fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>Ready to experience the future?</h2>
        <p style={{ color: "#64748b", marginBottom: 32 }}>Built for the Initia ecosystem — real contracts, real transactions, real DeFi</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <button className="hover-lift" onClick={() => setPage("dashboard")} style={{ background: "linear-gradient(135deg,#1E2749,#2B8C96)", color: "#fff", border: "none", borderRadius: 14, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Open Dashboard</button>
          <button className="hover-lift" onClick={onBridge} style={{ background: "#fff", color: "#1e293b", border: "2px solid #e2e8f0", borderRadius: 14, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Bridge Assets</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "clamp(24px,4vw,48px) clamp(16px,5vw,64px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <img src="/prism-logo.png" alt="Prism" style={{ width: 24, height: 24, objectFit: 'contain' }} onError={(e) => { const img = e.currentTarget; if (img.src.includes('prism-logo.png')) img.src = '/prism-logo.svg'; else img.style.display = 'none'; }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: "#1e293b", letterSpacing: 2 }}>PRISM</span>
            </div>
            <p style={{ fontSize: 13, color: "#64748b" }}>AI-powered DeFi intelligence layer built on Initia Chain</p>
            <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
              {network?.online && <>Chain: {network.chainId} · Block: #{network.latestBlock.toLocaleString()}</>}
            </div>
          </div>
          {([["Product", ["Discover", "Dashboard", "AI Assistant", "Pricing"]], ["Initia Features", ["Auto-Signing", "Session Keys", "Interwoven Bridge", "Usernames"]], ["Community", ["Discord", "Twitter", "GitHub", "Support"]]] as const).map(([h, items]) => (
            <div key={h}>
              <h4 style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", marginBottom: 16 }}>{h}</h4>
              {items.map(i => <div key={i} style={{ fontSize: 13, color: "#64748b", marginBottom: 8, cursor: "pointer" }}>{i}</div>)}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
