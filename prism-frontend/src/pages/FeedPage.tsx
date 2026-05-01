import { useMemo, useState } from 'react';
import OpportunityCard from '../components/feed/OpportunityCard';
import FeedFilters, { type FeedFilterState } from '../components/feed/FeedFilters';
import type { Opportunity } from '../types';

type Props = {
  opportunities: Opportunity[];
  onExecute: (id: string) => void;
};

export default function FeedPage({ opportunities, onExecute }: Props) {
  const [filters, setFilters] = useState<FeedFilterState>({
    search: '',
    risk: 100,
    type: 'all',
    sort: 'apy',
  });

  const rows = useMemo(() => {
    return opportunities
      .filter((item) => item.riskScore <= filters.risk)
      .filter((item) => (filters.type === 'all' ? true : item.strategyType === filters.type))
      .filter((item) => item.protocolName.toLowerCase().includes(filters.search.toLowerCase()))
      .sort((a, b) => {
        if (filters.sort === 'apy') return b.apy - a.apy;
        if (filters.sort === 'tvl') return b.tvl - a.tvl;
        return a.riskScore - b.riskScore;
      });
  }, [opportunities, filters]);

  return (
    <div className="feed-page">
      <div className="page-head-row">
        <h1 data-tooltip="Explore the highest-yielding opportunities available right now.">Opportunities</h1>
      </div>
      <p className="page-desc" style={{ marginTop: '-10px' }}>Discover and filter curated yield strategies across the Initia ecosystem. Compare APY, TVL, and Risk Scores to make informed decisions before deploying your capital.</p>

      <FeedFilters value={filters} onChange={setFilters} />

      {!rows.length ? (
        <div className="skeleton-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="op-grid">
          {rows.map((item, idx) => (
            <OpportunityCard key={item.id} item={item} onExecute={onExecute} featured={idx === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
