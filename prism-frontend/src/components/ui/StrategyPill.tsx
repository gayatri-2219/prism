import type { StrategyType } from '../../types';

type Props = { type: StrategyType | string; compact?: boolean };

export default function StrategyPill({ type, compact = false }: Props) {
  const upper = type.toUpperCase();
  const cls = type === 'lp' ? 'pill-lp' : type === 'lend' ? 'pill-lend' : type === 'stake' ? 'pill-stake' : 'pill-swap';
  return <span className={`strategy-pill ${cls} ${compact ? 'compact' : ''}`}>{upper}</span>;
}
