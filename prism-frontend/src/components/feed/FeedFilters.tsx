import LiveBadge from '../ui/LiveBadge';

export type FeedFilterState = {
  search: string;
  risk: number;
  type: 'all' | 'lend' | 'lp' | 'stake' | 'swap';
  sort: 'apy' | 'tvl' | 'risk';
};

type Props = {
  value: FeedFilterState;
  onChange: (next: FeedFilterState) => void;
};

const TYPES: FeedFilterState['type'][] = ['all', 'lend', 'lp', 'stake', 'swap'];

export default function FeedFilters({ value, onChange }: Props) {
  return (
    <div className="filters-row">
      <div className="search-field">
        <input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Search protocols..."
        />
      </div>

      <label className="risk-filter">
        <span>Risk ≤ {value.risk}</span>
        <input type="range" min={1} max={100} value={value.risk} onChange={(e) => onChange({ ...value, risk: Number(e.target.value) })} />
      </label>

      <div className="type-pills">
        {TYPES.map((type) => (
          <button key={type} className={value.type === type ? 'active' : ''} onClick={() => onChange({ ...value, type })}>
            {type === 'all' ? 'All' : type.toUpperCase()}
          </button>
        ))}
      </div>

      <select value={value.sort} onChange={(e) => onChange({ ...value, sort: e.target.value as FeedFilterState['sort'] })}>
        <option value="apy">APY ↓</option>
        <option value="tvl">TVL ↓</option>
        <option value="risk">Risk ↓</option>
      </select>

      <LiveBadge />
    </div>
  );
}
