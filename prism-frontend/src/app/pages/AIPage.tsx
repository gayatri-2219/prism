import { useEffect, useState } from 'react';
import { useInitiaBalance } from '../../hooks/useInitiaBalance';
import { useContractPosition } from '../../hooks/useContractPosition';
import { useInitiaTx } from '../../hooks/useInitiaTx';
import { API_FALLBACK_URL, API_URL, NATIVE_SYMBOL } from '../../lib/config';

interface Props {
  connected?: boolean;
  initiaAddress?: string;
  evmAddress?: string;
}

export function AIPage({ connected, initiaAddress, evmAddress }: Props) {
  const { data: balance } = useInitiaBalance(initiaAddress);
  const { data: position, refetch } = useContractPosition(evmAddress);
  const tx = useInitiaTx();

  const walletBal = balance?.formatted ?? 0;
  const deposited = position?.currentBalance ?? 0;
  const riskScore = position?.riskScore ?? 0;

  const portfolioContext = connected
    ? `User portfolio: ${walletBal.toFixed(4)} ${NATIVE_SYMBOL} in wallet, ${deposited.toFixed(4)} ${NATIVE_SYMBOL} deposited in contract, risk score ${riskScore}/100 on Initia testnet.`
    : 'User is not connected to a wallet yet.';

  const [messages, setMessages] = useState([
    { role: "ai", text: connected
      ? `Welcome! I can see your portfolio on Initia. You have ${walletBal.toFixed(4)} ${NATIVE_SYMBOL} in your wallet. Let me help you optimize your DeFi strategy.`
      : "Connect your wallet to get personalized AI-powered DeFi insights based on your real portfolio data."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusBadge, setStatusBadge] = useState<string | null>(
    connected ? null : "Connect wallet to load live insights"
  );

  const postJsonWithFallback = async (path: string, payload: unknown) => {
    const primary = `${API_URL}${path}`;
    const secondary = `${API_FALLBACK_URL}${path}`;
    const req: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };

    try {
      const res = await fetch(primary, req);
      if (res.ok) return res;
    } catch {}

    return fetch(secondary, req);
  };

  useEffect(() => {
    if (!connected) {
      setStatusBadge("Connect wallet to load live insights");
    } else if (statusBadge === "Connect wallet to load live insights") {
      setStatusBadge(null);
    }
  }, [connected, statusBadge]);

  const send = async (txt?: string) => {
    const q = txt || input;
    if (!q.trim()) return;
    setMessages(m => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await postJsonWithFallback(`/api/insights/chat`, {
        address: initiaAddress || evmAddress || "unknown",
        message: q,
        history: messages.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }))
      });
      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({}));
        const msg = String(errPayload?.message || '');
        if (
          msg.toLowerCase().includes("ai provider is not configured") ||
          msg.toLowerCase().includes("ai key missing on backend")
        ) {
          setStatusBadge("AI key missing on backend");
          setMessages(m => [...m, { role: "ai", text: "AI backend is not configured yet. Please set the backend AI key." }]);
        } else {
          setStatusBadge("Failed to load live insights");
          setMessages(m => [...m, { role: "ai", text: "Live AI request failed. Please try again shortly." }]);
        }
      } else {
        setStatusBadge(connected ? null : "Connect wallet to load live insights");
        const data = await res.json();
        const reply = data.reply || "Unable to get response.";
        setMessages(m => [...m, { role: "ai", text: reply }]);
      }
    } catch {
      setStatusBadge("Failed to load live insights");
      setMessages(m => [...m, { role: "ai", text: "Connection error. Retried via backup endpoint but still failed." }]);
    }
    setLoading(false);
  };

  return (
    <div className="page-enter" style={{ padding: "0 clamp(14px,5vw,64px) clamp(24px,5vw,60px)", maxWidth: 900, margin: "0 auto" }}>
      <div className="reveal-1" style={{ textAlign: "center", padding: "40px 0 32px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(43,140,150,.1)", borderRadius: 20, padding: "6px 16px", marginBottom: 20, fontSize: 13, color: "#2B8C96", fontWeight: 600 }}>
          AI-Powered Assistant
          {connected && <span style={{ color: "#22c55e", fontSize: 11 }}>● Portfolio Connected</span>}
        </div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(30px,7vw,48px)", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Ask PRISM Anything</h1>
        <p style={{ fontSize: 16, color: "#64748b" }}>Get personalized insights based on your real on-chain data</p>
        {statusBadge && (
          <div className="status-pulse" style={{ marginTop: 14, display: "inline-block", background: "#fff7ed", color: "#9a3412", border: "1px solid #fdba74", borderRadius: 12, padding: "8px 12px", fontSize: 12, fontWeight: 700 }}>
            {statusBadge}
          </div>
        )}
      </div>

      {/* Chat */}
      <div className="reveal-2 hover-lift" style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", minHeight: 300, padding: 24, marginBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 16 }}>
            {m.role === "ai" && (
              <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#1E2749,#2B8C96)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10, flexShrink: 0 }}>
                <img src="/prism-logo.png" alt="P" style={{ width: 18, height: 18, objectFit: 'contain', filter: 'brightness(10)' }} onError={(e) => { const img = e.currentTarget; if (img.src.includes('prism-logo.png')) img.src = '/prism-logo.svg'; else img.style.display = 'none'; }} />
              </div>
            )}
            <div style={{ maxWidth: "75%", background: m.role === "user" ? "linear-gradient(135deg,#1E2749,#2B8C96)" : "#f8fafc", color: m.role === "user" ? "#fff" : "#1e293b", borderRadius: m.role === "user" ? "20px 20px 6px 20px" : "20px 20px 20px 6px", padding: "14px 18px", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", border: m.role === "ai" ? "1px solid #e2e8f0" : "none" }}>
              {m.text}
              {m.role === "ai" && m.text.includes("10 INIT") && connected && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0", display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={async () => {
                    const hash = await tx.deposit("10", 50);
                    if (hash) { alert(`Auto-Signed Deposit TX: ${hash}`); refetch(); }
                    else if (tx.error) alert(tx.error);
                  }} disabled={tx.status === 'pending'} style={{ background: "linear-gradient(135deg,#1E2749,#2B8C96)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: tx.status === 'pending' ? 'not-allowed' : 'pointer', opacity: tx.status === 'pending' ? 0.7 : 1 }}>
                    {tx.status === 'pending' ? 'Auto-Signing...' : 'Deposit 10 INIT (Auto-Sign)'}
                  </button>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Powered by InterwovenKit</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#94a3b8", fontSize: 14 }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#1E2749,#2B8C96)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: "#fff", display: "inline-block", animation: "pulse 1s infinite" }} />
            </div>
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="reveal-3 hover-lift" style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about strategies, airdrops, or your portfolio..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#1e293b" }} />
          <button onClick={() => send()} style={{ background: "linear-gradient(135deg,#1E2749,#2B8C96)", color: "#fff", border: "none", borderRadius: 12, width: 44, height: 44, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            `What should I do with my ${walletBal.toFixed(2)} ${NATIVE_SYMBOL}?`,
            "How do Initia session keys work?",
            "Best airdrop strategies",
            "Explain auto-signing"
          ].map(s => (
            <button key={s} onClick={() => send(s)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "#64748b", cursor: "pointer", fontWeight: 500 }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
