import { useState, useEffect } from 'react';
import { useInitiaBalance } from '../../hooks/useInitiaBalance';
import { useContractPosition, useTVL } from '../../hooks/useContractPosition';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useInitiaTx } from '../../hooks/useInitiaTx';
import { useInitiaTxHistory } from '../../hooks/useInitiaTxHistory';
import { API_FALLBACK_URL, API_URL, NATIVE_SYMBOL } from '../../lib/config';

async function fetchJsonWithFallback(path: string, init?: RequestInit) {
  const primary = `${API_URL}${path}`;
  const secondary = `${API_FALLBACK_URL}${path}`;

  try {
    const res = await fetch(primary, init);
    if (res.ok) return res;
  } catch {}

  return fetch(secondary, init);
}

interface Props {
  setPage: (p: string) => void;
  connected?: boolean;
  initiaAddress?: string;
  evmAddress?: string;
  username?: string;
  onConnect?: () => void;
  onBridge?: () => void;
  requestTxBlock?: any;
}

export function DashboardPage({ setPage, connected, initiaAddress, evmAddress, username, onConnect, onBridge }: Props) {
  const [tab, setTab] = useState("Overview");
  const [walletQuery, setWalletQuery] = useState("");
  const [watchAddress, setWatchAddress] = useState<string | null>(null);
  const [depositAmt, setDepositAmt] = useState("");
  const [depositRisk, setDepositRisk] = useState(50);
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [newRisk, setNewRisk] = useState(50);
  const [insights, setInsights] = useState<any[]>([]);
  const [airdrops, setAirdrops] = useState<any[]>([]);
  const [airdropProgress, setAirdropProgress] = useState<Record<string, any>>({});
  const [whaleWallets, setWhaleWallets] = useState<Array<{ userAddress: string; initUsername?: string | null; totalValue?: number; rank?: number }>>([]);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [airdropsError, setAirdropsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRealData = async () => {
      const addr = watchAddress?.trim() || initiaAddress || evmAddress;
      if (!addr) {
        setInsights([]);
        setAirdrops([]);
        setInsightsError("Connect wallet to load live insights");
        setAirdropsError("Connect wallet to load live insights");
        return;
      }
      setInsightsError(null);
      setAirdropsError(null);
      try {
        const resIns = await fetchJsonWithFallback(`/api/insights/${addr}`);
        if (!resIns.ok) {
          const errPayload = await resIns.json().catch(() => ({}));
          const msg = String(errPayload?.message || '');
          if (
            msg.toLowerCase().includes("ai provider is not configured") ||
            msg.toLowerCase().includes("ai key missing on backend")
          ) {
            setInsightsError("AI key missing on backend");
          } else {
            setInsightsError("Failed to load live insights");
          }
          setInsights([]);
        } else {
          const dataIns = await resIns.json();
          const next = Array.isArray(dataIns.insights) ? dataIns.insights : [];
          setInsights(next);
          if (next.length === 0) {
            setInsightsError("No live AI insights available");
          }
        }
      } catch {
        setInsights([]);
        setInsightsError("Failed to load live insights");
      }
      try {
        const [resAir, resProgress] = await Promise.all([
          fetchJsonWithFallback(`/api/airdrops`),
          fetchJsonWithFallback(`/api/airdrops/${addr}`),
        ]);
        if (!resAir.ok) {
          setAirdrops([]);
          setAirdropsError("Failed to load live airdrops");
        } else {
          const dataAir = await resAir.json();
          const campaigns = Array.isArray(dataAir?.campaigns) ? dataAir.campaigns : [];
          setAirdrops(campaigns);
          if (campaigns.length === 0) {
            setAirdropsError("No live airdrop campaigns available");
          }
        }
        if (resProgress.ok) {
          const dataProgress = await resProgress.json();
          const rows = Array.isArray(dataProgress?.progress) ? dataProgress.progress : [];
          const map: Record<string, any> = {};
          rows.forEach((row: any) => {
            map[row.campaignId] = row;
          });
          setAirdropProgress(map);
        } else {
          setAirdropProgress({});
        }
      } catch {
        setAirdrops([]);
        setAirdropsError("Failed to load live airdrops");
        setAirdropProgress({});
      }
    };
    fetchRealData();
  }, [initiaAddress, evmAddress, watchAddress]);

  useEffect(() => {
    const loadWhales = async () => {
      try {
        const res = await fetchJsonWithFallback("/api/leaderboard?limit=5&offset=0");
        if (!res.ok) return;
        const data = await res.json();
        const rows = Array.isArray(data?.entries) ? data.entries : [];
        setWhaleWallets(
          rows.map((r: any) => ({
            userAddress: r.userAddress,
            initUsername: r.initUsername,
            totalValue: r.totalValue,
            rank: r.rank,
          }))
        );
      } catch {
        setWhaleWallets([]);
      }
    };
    loadWhales();
  }, []);

  const { data: balance, refetch: refetchBalance } = useInitiaBalance(initiaAddress);
  const { data: position, refetch: refetchPosition } = useContractPosition(evmAddress);
  const { data: tvl } = useTVL();
  const { data: network } = useNetworkStatus();
  const { data: txHistory } = useInitiaTxHistory(initiaAddress);
  const tx = useInitiaTx();

  const walletBal = balance?.formatted ?? 0;
  const deposited = position?.currentBalance ?? 0;
  const riskScore = position?.riskScore ?? 0;
  const autopilot = position?.autopilotEnabled ?? false;
  const stratCount = position?.strategyCount ?? 0;

  const refreshAll = () => { refetchBalance(); refetchPosition(); };

  const handleDeposit = async () => {
    if (!depositAmt || Number(depositAmt) <= 0) return alert("Enter a valid amount");
    const hash = await tx.deposit(depositAmt, depositRisk);
    if (hash) { alert(`Deposit TX: ${hash}`); setDepositAmt(""); refreshAll(); }
    else if (tx.error) alert(tx.error);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmt || Number(withdrawAmt) <= 0) return alert("Enter a valid amount");
    const hash = await tx.withdraw(withdrawAmt);
    if (hash) { alert(`Withdraw TX: ${hash}`); setWithdrawAmt(""); refreshAll(); }
    else if (tx.error) alert(tx.error);
  };

  const handleUpdateRisk = async () => {
    const hash = await tx.updateRisk(newRisk);
    if (hash) { alert(`Risk updated TX: ${hash}`); refreshAll(); }
    else if (tx.error) alert(tx.error);
  };

  const handleToggleAutopilot = async () => {
    const hash = await tx.enableAutopilot(!autopilot);
    if (hash) { alert(`Autopilot ${!autopilot ? 'enabled' : 'disabled'}: ${hash}`); refreshAll(); }
    else if (tx.error) alert(tx.error);
  };

  const applyWalletSearch = () => {
    const value = walletQuery.trim();
    if (!value) {
      setWatchAddress(null);
      return;
    }
    setWatchAddress(value);
  };

  const loadWhaleWallet = (address: string) => {
    setWalletQuery(address);
    setWatchAddress(address);
  };

  const fallbackWalletChips = [
    initiaAddress,
    evmAddress,
    watchAddress,
  ].filter((v, i, arr): v is string => Boolean(v) && arr.indexOf(v) === i);

  if (!connected) {
    return (
      <div style={{ padding: "clamp(40px,8vw,120px) clamp(16px,5vw,64px)", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Connect Your Wallet</h2>
        <p style={{ color: "#64748b", marginBottom: 32 }}>Connect with InterwovenKit to see your real portfolio and execute transactions</p>
        <button onClick={onConnect} style={{ background: "linear-gradient(135deg,#1E2749,#2B8C96)", color: "#fff", border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Connect Wallet</button>
      </div>
    );
  }

  const cardStyle = { background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0" } as const;
  const labelStyle = { fontSize: 13, color: "#94a3b8", marginBottom: 4 } as const;
  const bigNum = { fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: "#0f172a" } as const;
  const inputStyle = { width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#1e293b", boxSizing: "border-box" as const, marginBottom: 8 };
  const btnPrimary = { width: "100%", background: "linear-gradient(135deg,#1E2749,#2B8C96)", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" } as const;
  const btnDisabled = { ...btnPrimary, opacity: 0.6, cursor: "not-allowed" };

  return (
    <div className="page-enter" style={{ padding: "0 clamp(14px,4vw,48px) clamp(28px,5vw,60px)" }}>
      {/* Network Bar */}
      <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#64748b" }}>
        <span style={{ color: network?.online ? "#22c55e" : "#ef4444", fontWeight: 700 }}>● {network?.online ? 'Network Online' : 'Network Offline'}</span>
        {network?.online && <span>Block #{network.latestBlock.toLocaleString()} · {network.latency}ms</span>}
        <span style={{ marginLeft: "auto", color: "#2B8C96", fontWeight: 600 }}>@{username || initiaAddress?.slice(0, 12) + '...'}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Portfolio Dashboard</h1>
          <p style={{ fontSize: 14, color: "#64748b" }}>Real-time on-chain data from Initia testnet</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Overview", "Deposit", "Withdraw", "Settings"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "linear-gradient(135deg,#1E2749,#2B8C96)" : "#f8fafc", color: tab === t ? "#fff" : "#64748b", border: "none", borderRadius: 20, padding: "6px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Wallet Search + Whale Copy */}
      <div style={{ marginTop: 10, marginBottom: 16, display: "grid", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={walletQuery}
            onChange={(e) => setWalletQuery(e.target.value)}
            placeholder="Search wallet (init... or 0x...) for live insights/airdrops"
            style={{ flex: "1 1 280px", minWidth: 220, background: "#fff", border: "1px solid #dbe3ef", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#1e293b" }}
          />
          <button onClick={applyWalletSearch} style={{ background: "linear-gradient(135deg,#1E2749,#2B8C96)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Search Wallet
          </button>
          <button
            onClick={() => {
              setWatchAddress(null);
              setWalletQuery("");
            }}
            style={{ background: "#eef2ff", color: "#1E2749", border: "1px solid #dbe3ef", borderRadius: 10, padding: "10px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Reset
          </button>
        </div>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          {watchAddress ? `Viewing live insights for: ${watchAddress}` : "Viewing your connected wallet"}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {whaleWallets.map((w) => (
            <div key={w.userAddress} style={{ background: "#f8fafc", border: "1px solid #dbe3ef", borderRadius: 12, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>#{w.rank ?? "-"}</span>
              <span style={{ fontSize: 11, color: "#1e293b" }}>{w.initUsername ? `@${w.initUsername}.init` : `${w.userAddress.slice(0, 8)}...`}</span>
              <button onClick={() => loadWhaleWallet(w.userAddress)} style={{ background: "#e2e8f0", color: "#1E2749", border: "none", borderRadius: 8, padding: "4px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                Use
              </button>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(w.userAddress);
                  } catch {}
                }}
                style={{ background: "#e2e8f0", color: "#1E2749", border: "none", borderRadius: 8, padding: "4px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}
              >
                Copy
              </button>
            </div>
          ))}
          {whaleWallets.length === 0 && fallbackWalletChips.map((addr) => (
            <div key={addr} style={{ background: "#f8fafc", border: "1px solid #dbe3ef", borderRadius: 12, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>Wallet</span>
              <span style={{ fontSize: 11, color: "#1e293b" }}>{addr.slice(0, 10)}...</span>
              <button onClick={() => loadWhaleWallet(addr)} style={{ background: "#e2e8f0", color: "#1E2749", border: "none", borderRadius: 8, padding: "4px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                Use
              </button>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(addr);
                  } catch {}
                }}
                style={{ background: "#e2e8f0", color: "#1E2749", border: "none", borderRadius: 8, padding: "4px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}
              >
                Copy
              </button>
            </div>
          ))}
        </div>
        {whaleWallets.length === 0 && (
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
            Whale leaderboard is empty right now. Add leaderboard data to backend to see ranked whale wallets.
          </div>
        )}
      </div>

      {/* Balance Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginTop: 20 }}>
        <div className="reveal-1 hover-lift" style={cardStyle}>
          <div style={labelStyle}>Wallet Balance</div>
          <div style={bigNum}>{walletBal.toFixed(4)}</div>
          <div style={{ fontSize: 12, color: "#2B8C96" }}>{NATIVE_SYMBOL}</div>
        </div>
        <div className="reveal-1 hover-lift" style={cardStyle}>
          <div style={labelStyle}>Contract Deposited</div>
          <div style={bigNum}>{deposited.toFixed(4)}</div>
          <div style={{ fontSize: 12, color: "#2B8C96" }}>{NATIVE_SYMBOL}</div>
        </div>
        <div className="reveal-1 hover-lift" style={cardStyle}>
          <div style={labelStyle}>Risk Score</div>
          <div style={{ ...bigNum, color: riskScore <= 33 ? "#22c55e" : riskScore <= 66 ? "#f59e0b" : "#ef4444" }}>{riskScore || '--'}</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>/100</div>
        </div>
        <div className="reveal-1 hover-lift" style={cardStyle}>
          <div style={labelStyle}>Autopilot</div>
          <div style={{ ...bigNum, color: autopilot ? "#22c55e" : "#94a3b8", fontSize: 24 }}>{autopilot ? "ON" : "OFF"}</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{stratCount} strategies</div>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginTop: 20 }}>
        {/* Left: Action Panel */}
        <div className="reveal-2 hover-lift" style={cardStyle}>
          {tab === "Overview" && (
            <div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Portfolio Summary</h3>
              <div style={{ marginBottom: 12 }}><span style={{ color: "#94a3b8", fontSize: 13 }}>Total (Wallet + Contract):</span><br/><span style={{ fontSize: 24, fontWeight: 800 }}>{(walletBal + deposited).toFixed(4)} {NATIVE_SYMBOL}</span></div>
              <div style={{ marginBottom: 12 }}><span style={{ color: "#94a3b8", fontSize: 13 }}>Contract Address:</span><br/><span style={{ fontSize: 12, fontFamily: "monospace", color: "#64748b" }}>{import.meta.env.VITE_IAE_CONTRACT_ADDRESS}</span></div>
              <div style={{ marginBottom: 12 }}><span style={{ color: "#94a3b8", fontSize: 13 }}>TVL in Contract:</span><br/><span style={{ fontSize: 18, fontWeight: 700 }}>{tvl?.toFixed(4) ?? '0'} {NATIVE_SYMBOL}</span></div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button onClick={() => setTab("Deposit")} style={btnPrimary}>Deposit</button>
                <button onClick={onBridge} style={{ ...btnPrimary, background: "#eef2ff", color: "#1E2749" }}>Bridge</button>
              </div>
            </div>
          )}

          {tab === "Deposit" && (
            <div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Deposit to Contract</h3>
              <label style={{ fontSize: 13, color: "#64748b" }}>Amount ({NATIVE_SYMBOL})</label>
              <input type="number" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} placeholder="0.001" style={inputStyle} />
              <label style={{ fontSize: 13, color: "#64748b" }}>Risk Score: {depositRisk}</label>
              <input type="range" min={1} max={100} value={depositRisk} onChange={e => setDepositRisk(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>Balance: {walletBal.toFixed(6)} {NATIVE_SYMBOL}</div>
              <button onClick={handleDeposit} disabled={tx.status === 'pending'} style={tx.status === 'pending' ? btnDisabled : btnPrimary}>
                {tx.status === 'pending' ? 'Confirming...' : 'Deposit via Auto-Sign'}
              </button>
              {tx.lastTxHash && <div style={{ marginTop: 8, fontSize: 12, color: "#22c55e", wordBreak: "break-all" }}>TX: {tx.lastTxHash}</div>}
              {tx.error && <div style={{ marginTop: 8, fontSize: 12, color: "#ef4444" }}>{tx.error}</div>}
            </div>
          )}

          {tab === "Withdraw" && (
            <div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Withdraw from Contract</h3>
              <label style={{ fontSize: 13, color: "#64748b" }}>Amount ({NATIVE_SYMBOL})</label>
              <input type="number" value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} placeholder="0.001" style={inputStyle} />
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>Deposited: {deposited.toFixed(6)} {NATIVE_SYMBOL}</div>
              <button onClick={handleWithdraw} disabled={tx.status === 'pending'} style={tx.status === 'pending' ? btnDisabled : btnPrimary}>
                {tx.status === 'pending' ? 'Confirming...' : 'Withdraw'}
              </button>
              {tx.lastTxHash && <div style={{ marginTop: 8, fontSize: 12, color: "#22c55e", wordBreak: "break-all" }}>TX: {tx.lastTxHash}</div>}
              {tx.error && <div style={{ marginTop: 8, fontSize: 12, color: "#ef4444" }}>{tx.error}</div>}
            </div>
          )}

          {tab === "Settings" && (
            <div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Strategy Settings</h3>
              <label style={{ fontSize: 13, color: "#64748b" }}>Update Risk Score: {newRisk}</label>
              <input type="range" min={1} max={100} value={newRisk} onChange={e => setNewRisk(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />
              <button onClick={handleUpdateRisk} disabled={tx.status === 'pending'} style={{ ...btnPrimary, marginBottom: 16 }}>
                Update Risk Score
              </button>
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 700 }}>Autopilot</span>
                  <button onClick={handleToggleAutopilot} disabled={tx.status === 'pending'} style={{ background: autopilot ? "#ef4444" : "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {autopilot ? 'Disable' : 'Enable'}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: "#64748b" }}>Autopilot lets the contract execute strategies automatically via session keys.</p>
              </div>
              {tx.lastTxHash && <div style={{ marginTop: 8, fontSize: 12, color: "#22c55e", wordBreak: "break-all" }}>TX: {tx.lastTxHash}</div>}
            </div>
          )}
        </div>

        {/* Right: TX History */}
        <div className="reveal-2 hover-lift" style={cardStyle}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Recent Transactions</h3>
          {(!txHistory || txHistory.length === 0) ? (
            <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 32 }}>No transactions yet. Make a deposit to get started.</div>
          ) : (
            txHistory.slice(0, 8).map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{t.type}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Block #{t.height}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: t.success ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{t.success ? 'Success' : 'Failed'}</div>
                  <a href={`https://scan.testnet.initia.xyz/tx/${t.hash}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#2B8C96" }}>{t.hash.slice(0, 12)}...</a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Insights + Airdrops */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginTop: 20 }}>
        <div className="reveal-3 hover-lift" style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}><span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: "#1e293b" }}>AI Insights</span></div>
          {insightsError && (
            <div className="status-pulse" style={{ marginBottom: 14, background: "#fff7ed", color: "#9a3412", border: "1px solid #fdba74", borderRadius: 12, padding: "10px 12px", fontSize: 12, fontWeight: 700 }}>
              {insightsError}
            </div>
          )}
          {insights.map((ins: any) => (
            <div key={ins.text} style={{ background: ins.color || "#f8fafc", borderRadius: 14, padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 6 }}><span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{ins.text}</span></div>
              <span onClick={() => setPage("ai")} style={{ fontSize: 12, color: "#2B8C96", fontWeight: 700, cursor: "pointer", textTransform: 'uppercase' }}>{ins.link || "View →"}</span>
            </div>
          ))}
        </div>
        <div className="reveal-3 hover-lift" style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}><span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: "#1e293b" }}>Airdrop Tracker</span></div>
          {airdropsError && (
            <div style={{ marginBottom: 14, background: "#eff6ff", color: "#1e3a8a", border: "1px solid #93c5fd", borderRadius: 12, padding: "10px 12px", fontSize: 12, fontWeight: 700 }}>
              {airdropsError}
            </div>
          )}
          {airdrops.slice(0, 3).map((o: any) => (
            <div key={o.id || o.name} style={{ background: "#f8fafc", borderRadius: 14, padding: 16, marginBottom: 12 }}>
              {(() => {
                const row = o.id ? airdropProgress[o.id] : null;
                const done = Number(row?.stepsCompleted ?? 0);
                const total = Number((row?.totalSteps ?? o.totalSteps ?? (o.steps || []).length) || 1);
                const progressPct = Number(row?.progress ?? 0);
                return (
                  <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", textTransform: 'uppercase', letterSpacing: 0.5 }}>{(o.tag || "Reward").replace(/[^\w\s·–]/g, '').trim()}</div>
                <span style={{ fontWeight: 800, fontSize: 14, color: "#1e293b" }}>{o.estimatedRange || o.range || "TBA"}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{o.name}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{o.difficulty || o.diff || "Easy"} · {done}/{total} steps</div>
              <div style={{ marginTop: 8, height: 4, background: "#e2e8f0", borderRadius: 2 }}>
                <div style={{ height: 4, background: "linear-gradient(90deg,#1E2749,#2B8C96)", borderRadius: 2, width: `${progressPct}%` }} />
              </div>
                  </>
                );
              })()}
            </div>
          ))}
          <button onClick={() => setPage("discover")} style={{ width: "100%", background: "#eef2ff", color: "#1E2749", border: "1px solid #e0e7ff", borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>View All Airdrops →</button>
        </div>
      </div>
    </div>
  );
}
