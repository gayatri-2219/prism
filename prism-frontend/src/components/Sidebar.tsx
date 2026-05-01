import type { Route } from "../lib/types";
import { ROUTES } from "../lib/types";
import { fmtNumber } from "../lib/utils";

const NAV_ICONS: Record<string, string> = {
  guide:"◈", feed:"◉", execute:"⚡", autopilot:"⟳", leaderboard:"▲", architecture:"⬡",
};
const NAV_LABELS: Record<string, string> = {
  guide:"Home", feed:"Strategies", execute:"Execute", autopilot:"Autopilot", leaderboard:"Leaderboard", architecture:"How It Works",
};

type Props = {
  route: Route; navigate: (r: Route) => void;
  walletLabel: string; username?: string | null;
  initBalance: number;
  onConnect: () => void; onWallet: () => void; onBridge: () => void;
};

export default function Sidebar({ route, navigate, walletLabel, username, initBalance, onConnect, onWallet, onBridge }: Props) {
  const connected = walletLabel !== "Disconnected";
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/prism-logo.png" alt="Prism" className="brand-logo float" />
        <div className="brand-text">
          <h1>Prism</h1>
          <div className="brand-tag">AI-Powered DeFi</div>
        </div>
      </div>

      <nav className="nav">
        {ROUTES.map((r) => (
          <button key={r} className={`nav-item${route === r ? " active" : ""}`} onClick={() => navigate(r)}>
            <span className="nav-icon">{NAV_ICONS[r]}</span>
            {NAV_LABELS[r] || r}
          </button>
        ))}
      </nav>

      <div style={{ margin: "12px 6px", padding: "10px", borderRadius: 10, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
        <div style={{ fontSize: "0.68rem", color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Network</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="pulse-dot"></span>
          <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>Initia Testnet</span>
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text3)", marginTop: 3 }}>Earn now → Bridge to Mainnet</div>
      </div>

      <div className="wallet-box">
        {connected ? (
          <>
            <div className="wallet-addr">{walletLabel}</div>
            {username && <div className="wallet-user">@{username}</div>}
            <div className="wallet-bal"><span style={{ color: "var(--text3)" }}>Balance</span> · {fmtNumber(initBalance, 4)} INIT</div>
            <div className="actions">
              <button className="btn btn-sm" onClick={onWallet}>Wallet</button>
              <button className="btn btn-sm" onClick={onBridge}>Bridge</button>
              <button className="btn btn-sm btn-ghost" onClick={onConnect}>Switch</button>
            </div>
          </>
        ) : (
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={onConnect}>
            Connect Wallet
          </button>
        )}
      </div>
    </aside>
  );
}
