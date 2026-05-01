import { formatAPY } from '../../utils/format';

type Props = {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
};

export default function APYBadge({ value, size = 'md', animated = true }: Props) {
  return (
    <div className={`apy-badge ${size} ${animated ? 'shimmer-frame' : ''}`}>
      <div className="apy-value">{formatAPY(value)}</div>
      <div className="apy-label">APY</div>
    </div>
  );
}
