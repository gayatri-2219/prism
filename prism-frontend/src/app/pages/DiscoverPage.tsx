import { useInterwovenKit } from '@initia/interwovenkit-react';
import { useEffect, useState } from 'react';
import { API_FALLBACK_URL, API_URL } from '../../lib/config';

type Campaign = {
  id: string;
  name: string;
  tag: string;
  estimatedRange: string;
  difficulty: string;
  totalSteps: number;
  steps: string[];
};
type ProgressRow = {
  campaignId: string;
  stepsCompleted: number;
  totalSteps: number;
  stepsDone: string[];
  progress: number;
};

export function DiscoverPage() {
  const { openBridge, openConnect, initiaAddress } = useInterwovenKit() as any;
  const connected = Boolean(initiaAddress);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, ProgressRow>>({});

  const fetchJsonWithFallback = async (path: string, init?: RequestInit) => {
    const primary = `${API_URL}${path}`;
    const secondary = `${API_FALLBACK_URL}${path}`;
    try {
      const res = await fetch(primary, init);
      if (res.ok) return res;
    } catch {}
    return fetch(secondary, init);
  };

  const markStepDone = async (campaignId: string, stepName: string) => {
    if (!initiaAddress) return;
    try {
      await fetchJsonWithFallback(`/api/airdrops/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: initiaAddress,
          campaignId,
          stepName,
        }),
      });
      const res = await fetchJsonWithFallback(`/api/airdrops/${initiaAddress}`);
      if (!res.ok) return;
      const data = await res.json();
      const rows: ProgressRow[] = Array.isArray(data?.progress) ? data.progress : [];
      const next: Record<string, ProgressRow> = {};
      rows.forEach((row) => {
        next[row.campaignId] = row;
      });
      setProgressMap(next);
    } catch (err) {
      console.error('[discover] failed to mark step done', err);
    }
  };

  useEffect(() => {
    const loadCampaigns = async () => {
      const res = await fetchJsonWithFallback(`/api/airdrops`);
      if (!res.ok) throw new Error('Failed to fetch airdrop campaigns');
      const data = await res.json();
      setCampaigns(Array.isArray(data?.campaigns) ? data.campaigns : []);
    };
    const loadProgress = async () => {
      if (!initiaAddress) {
        setProgressMap({});
        return;
      }
      const res = await fetchJsonWithFallback(`/api/airdrops/${initiaAddress}`);
      if (!res.ok) throw new Error('Failed to fetch airdrop progress');
      const data = await res.json();
      const rows: ProgressRow[] = Array.isArray(data?.progress) ? data.progress : [];
      const next: Record<string, ProgressRow> = {};
      rows.forEach((row) => {
        next[row.campaignId] = row;
      });
      setProgressMap(next);
    };

    loadCampaigns().catch((err) => {
      console.error('[discover] failed to load campaigns', err);
      setCampaigns([]);
    });
    loadProgress().catch((err) => {
      console.error('[discover] failed to load progress', err);
      setProgressMap({});
    });

    const interval = setInterval(() => {
      loadProgress().catch(() => {});
    }, 20000);
    return () => clearInterval(interval);
  }, [initiaAddress]);

  const handleAction = async (campaignId: string, stepTitle: string) => {
    if (!connected) {
      openConnect?.();
      return;
    }
    if (stepTitle.toLowerCase().includes('bridge')) {
      await markStepDone(campaignId, stepTitle);
      openBridge?.();
      return;
    }
    if (stepTitle.toLowerCase().includes('bridge') || stepTitle.toLowerCase().includes('swap')) {
      openBridge?.();
    } else if (stepTitle.toLowerCase().includes('connect')) {
      alert('Wallet already connected.');
    } else {
      openBridge?.();
    }
  };

  return (
    <div className="page-enter" style={{ padding: "clamp(18px,4vw,32px) clamp(14px,5vw,64px) clamp(24px,5vw,60px)" }}>
      <div className="reveal-1" style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(43,140,150,.1)", borderRadius: 20, padding: "6px 14px", marginBottom: 20, fontSize: 13, color: "#2B8C96", fontWeight: 600 }}>Airdrop Opportunities</div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px,7vw,44px)", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Track Your Airdrops</h1>
        <p style={{ fontSize: 16, color: "#64748b" }}>Gamified tracking with step-by-step guidance to maximize rewards</p>
        {!connected && (
          <button onClick={() => openConnect?.()} style={{ marginTop: 16, background: "linear-gradient(135deg,#1E2749,#2B8C96)", color: "#fff", border: "none", borderRadius: 12, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Connect Wallet to Track Progress</button>
        )}
      </div>
      {campaigns.length === 0 && (
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
          No live airdrop campaigns available.
        </div>
      )}
      <div className="reveal-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 14 }}>
        {campaigns.map(a => (
          (() => {
            const progress = progressMap[a.id];
            const backendDone = connected ? (progress?.stepsDone ?? []) : [];
            const doneSet = new Set<string>(backendDone);
            if (connected) {
              a.steps.forEach((step) => {
                if (step.toLowerCase().includes('connect wallet')) {
                  doneSet.add(step);
                }
              });
            }
            const done = Array.from(doneSet);
            const pct = connected
              ? Math.min(100, Math.round((done.length / Math.max(1, a.totalSteps)) * 100))
              : 0;
            return (
          <div key={a.id} className="hover-lift" style={{ background: "#fff", borderRadius: 20, padding: 24, border: `2px solid ${a.tag.includes("Trending") ? "#fbbf24" : a.tag.includes("Popular") ? "#a855f7" : "#2B8C96"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ background: a.tag.includes("Trending") ? "#fef3c7" : a.tag.includes("Popular") ? "#ede9fe" : "#dbeafe", color: a.tag.includes("Trending") ? "#d97706" : a.tag.includes("Popular") ? "#7c3aed" : "#1d4ed8", borderRadius: 10, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{a.tag.replace(/[^\w\s·–]/g, '').trim()}</div>
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: "#1e293b", marginBottom: 4 }}>{a.name}</h3>
            <div style={{ fontSize: 13, color: "#22c55e", fontWeight: 600, marginBottom: 16 }}>{a.estimatedRange} · {a.difficulty}</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>Progress</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, marginBottom: 20 }}>
              <div style={{ height: 6, background: "linear-gradient(90deg,#1E2749,#2B8C96)", borderRadius: 3, width: `${pct}%`, transition: "width 0.5s ease" }} />
            </div>
            {a.steps.slice(0, a.totalSteps).map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: done.includes(s) ? "#22c55e" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {done.includes(s) ? <span style={{ color: "#fff", fontSize: 11 }}>✓</span> : null}
                </div>
                <span
                  onClick={() => {
                    void handleAction(a.id, s);
                  }}
                  style={{
                    fontSize: 13,
                    color: done.includes(s) ? "#1e293b" : "#94a3b8",
                    fontWeight: done.includes(s) ? 600 : 400,
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                >{s}</span>
              </div>
            ))}
            <div style={{ fontSize: 12, color: "#94a3b8", margin: "12px 0" }}>
              {connected ? `${done.length}/${a.totalSteps} steps complete` : "Connect wallet for live progress"}
            </div>
            <button
              onClick={() => {
                void handleAction(a.id, a.steps.find((step) => !done.includes(step)) || a.steps[0] || "Bridge to Initia");
              }}
              style={{ width: "100%", background: "linear-gradient(135deg,#1E2749,#2B8C96)", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              {connected ? 'Continue →' : 'Connect to Start'}
            </button>
          </div>
            );
          })()
        ))}
      </div>
    </div>
  );
}
