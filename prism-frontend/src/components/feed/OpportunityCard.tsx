import { ArrowRight, Sparkles } from 'lucide-react';
import type { Opportunity } from '../../types';
import { formatAmount, formatCompact } from '../../utils/format';
import APYBadge from '../ui/APYBadge';
import GlassCard from '../ui/GlassCard';
import ProtocolAvatar from '../ui/ProtocolAvatar';
import RiskBadge from '../ui/RiskBadge';
import StrategyPill from '../ui/StrategyPill';

type Props = {
  item: Opportunity;
  featured?: boolean;
  onExecute: (id: string) => void;
};

export default function OpportunityCard({ item, featured, onExecute }: Props) {
  const tvlPct = Math.min(100, (item.tvl / 18_000_000) * 100);

  return (
    <GlassCard className={`opportunity-card ${featured ? 'featured' : ''}`} animated glow={featured}>
      {featured ? <div className="top-pick-ribbon">⚡ Top Pick</div> : null}

      <div className="op-head">
        <div className="op-left">
          <ProtocolAvatar name={item.protocolName} size={32} />
          <div>
            <div className="op-name">{item.protocolName}</div>
            <StrategyPill type={item.strategyType} compact />
          </div>
        </div>
        <RiskBadge score={item.riskScore} />
      </div>

      <APYBadge value={item.apy} size="lg" />

      <div className="tvl-row">
        <span>TVL</span>
        <strong>${formatCompact(item.tvl)}</strong>
      </div>
      <div className="tvl-bar">
        <div style={{ width: `${tvlPct}%` }} />
      </div>

      <div className="token-pill">{item.tokenSymbol}</div>

      <div className="op-foot">
        <span>Min deposit: {formatAmount(item.minDeposit, 0)} INIT</span>
        <button onClick={() => onExecute(item.id)}>
          Execute <ArrowRight size={12} />
        </button>
      </div>

      <p className="op-desc">{item.description}</p>
      {featured ? <Sparkles size={14} className="featured-spark" /> : null}
    </GlassCard>
  );
}
