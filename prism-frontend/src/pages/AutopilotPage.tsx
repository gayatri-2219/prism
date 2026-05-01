import { useMemo, useState } from 'react';
import { Orbit } from 'lucide-react';
import type { Opportunity, TxItem } from '../types';
import ActivityLog from '../components/autopilot/ActivityLog';
import GuardrailsPanel, { type Guardrails } from '../components/autopilot/GuardrailsPanel';
import SessionKeyCard from '../components/autopilot/SessionKeyCard';
import OpportunityCard from '../components/feed/OpportunityCard';
import GlassCard from '../components/ui/GlassCard';
import { useContract } from '../hooks/useContract';

type Props = {
  initiaAddress?: string;
  opportunities: Opportunity[];
  txHistory: TxItem[];
  requestTxBlock: (payload: any) => Promise<{ txHash?: string }>;
  onTx: (hash: string) => void;
};

export default function AutopilotPage({ initiaAddress, opportunities, txHistory, requestTxBlock, onTx }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionKey, setSessionKey] = useState<string>();
  const [guardrails, setGuardrails] = useState<Guardrails>({
    maxDeploy: 500,
    minApy: 10,
    riskMode: 'balanced',
    cadence: 'weekly',
  });

  const { registerSessionKey, revokeSessionKey } = useContract(requestTxBlock, initiaAddress);

  const preview = useMemo(
    () => opportunities.filter((item) => item.apy >= guardrails.minApy).slice(0, 3),
    [guardrails.minApy, opportunities],
  );

  const onRegister = async () => {
    if (!registerSessionKey || !initiaAddress) return;
    setLoading(true);
    try {
      const generated = `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 40)}` as `0x${string}`;
      const res = await registerSessionKey(generated);
      if (res?.txHash) {
        onTx(res.txHash);
        setSessionKey(generated);
        setEnabled(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRevoke = async () => {
    if (!revokeSessionKey) return;
    setLoading(true);
    try {
      const res = await revokeSessionKey();
      if (res?.txHash) onTx(res.txHash);
      setSessionKey(undefined);
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="autopilot-page">
      <GlassCard className={`autopilot-hero ${!initiaAddress ? 'disabled' : ''}`}>
        <div>
          <h1>Autopilot Mode</h1>
          <p className="page-desc" style={{ marginBottom: 0 }}>Let IAE continuously optimize your capital under your guardrails. When enabled, your funds are automatically routed to the highest-yielding strategies matching your risk profile without requiring manual signatures.</p>
        </div>
        <div className="autopilot-toggle-wrap">
          <Orbit className="orbit-icon" />
          <button className={`toggle ${enabled ? 'on' : ''}`} onClick={() => setEnabled((v) => !v)} disabled={!initiaAddress}>
            <span />
          </button>
        </div>
      </GlassCard>

      <GuardrailsPanel value={guardrails} onChange={setGuardrails} />

      <SessionKeyCard
        registered={Boolean(sessionKey)}
        sessionKey={sessionKey}
        loading={loading}
        onRegister={onRegister}
        onRevoke={onRevoke}
      />

      <section>
        <h3 data-tooltip="These are the exact protocols your funds will enter if autopilot runs right now.">IAE would currently deploy to:</h3>
        <div className="autopilot-preview-grid">
          {preview.map((item) => (
            <OpportunityCard key={item.id} item={item} onExecute={() => {}} />
          ))}
        </div>
      </section>

      <section>
        <h3 data-tooltip="A complete log of all actions taken by the autopilot engine on your behalf.">Autopilot History</h3>
        <ActivityLog rows={txHistory} />
      </section>
    </div>
  );
}
