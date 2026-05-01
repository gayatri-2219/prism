import type { PositionResponse } from '../../types';
import { formatAmount, relativeTime } from '../../utils/format';

export default function PositionCard({ data }: { data?: PositionResponse }) {
  const pos = data?.position;

  if (!pos) {
    return (
      <div className="position-empty">
        <div className="vault-illustration" />
        <p>No position yet</p>
      </div>
    );
  }

  const pnl = pos.currentValue - pos.totalDeployed;

  return (
    <div className="position-card-grid">
      <div>
        <span>Total Deployed</span>
        <strong>{formatAmount(pos.totalDeployed, 2)} INIT</strong>
      </div>
      <div>
        <span>Current Value</span>
        <strong>
          {formatAmount(pos.currentValue, 2)} INIT
          <em className={pnl >= 0 ? 'up' : 'down'}>{pnl >= 0 ? '+' : ''}{formatAmount(pnl, 2)}</em>
        </strong>
      </div>
      <div>
        <span>Risk Score</span>
        <strong>{pos.riskScore}/100</strong>
      </div>
      <div>
        <span>Last Updated</span>
        <strong>{relativeTime(pos.updatedAt)}</strong>
      </div>
    </div>
  );
}
