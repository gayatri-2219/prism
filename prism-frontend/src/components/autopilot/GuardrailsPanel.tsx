type Guardrails = {
  maxDeploy: number;
  minApy: number;
  riskMode: 'conservative' | 'balanced' | 'aggressive';
  cadence: 'daily' | 'weekly' | 'monthly' | 'manual';
};

type Props = {
  value: Guardrails;
  onChange: (next: Guardrails) => void;
};

const RISK_MODES: Guardrails['riskMode'][] = ['conservative', 'balanced', 'aggressive'];
const CADENCE: Guardrails['cadence'][] = ['daily', 'weekly', 'monthly', 'manual'];

export type { Guardrails };

export default function GuardrailsPanel({ value, onChange }: Props) {
  return (
    <div className="guardrails-grid">
      <div className="guardrail-item">
        <h5>Max Deploy Amount</h5>
        <input type="range" min={10} max={5000} value={value.maxDeploy} onChange={(e) => onChange({ ...value, maxDeploy: Number(e.target.value) })} />
        <strong>{value.maxDeploy} INIT</strong>
      </div>

      <div className="guardrail-item">
        <h5>Minimum APY Threshold</h5>
        <input type="range" min={1} max={50} value={value.minApy} onChange={(e) => onChange({ ...value, minApy: Number(e.target.value) })} />
        <strong>{value.minApy}%</strong>
      </div>

      <div className="guardrail-item">
        <h5>Risk Tolerance</h5>
        <div className="segmented-grid">
          {RISK_MODES.map((mode) => (
            <button key={mode} className={value.riskMode === mode ? 'active' : ''} onClick={() => onChange({ ...value, riskMode: mode })}>
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="guardrail-item">
        <h5>Rebalance Frequency</h5>
        <div className="pill-grid">
          {CADENCE.map((cadence) => (
            <button key={cadence} className={value.cadence === cadence ? 'active' : ''} onClick={() => onChange({ ...value, cadence })}>
              {cadence}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
