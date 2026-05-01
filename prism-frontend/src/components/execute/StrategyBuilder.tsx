import { Plus, X } from 'lucide-react';
import type { Opportunity, StrategyAllocation } from '../../types';
import { formatAPY } from '../../utils/format';
import AllocationPie from './AllocationPie';
import StrategyPill from '../ui/StrategyPill';

type Props = {
  rows: StrategyAllocation[];
  opportunities: Opportunity[];
  onChange: (rows: StrategyAllocation[]) => void;
};

const COLORS = ['#00F5C4', '#A78BFA', '#F5A623', '#38bdf8'];

export default function StrategyBuilder({ rows, opportunities, onChange }: Props) {
  const update = (id: string, patch: Partial<StrategyAllocation>) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const remove = (id: string) => onChange(rows.filter((row) => row.id !== id));

  const add = () => {
    if (rows.length >= 4) return;
    onChange([...rows, { id: crypto.randomUUID(), opportunityId: opportunities[0]?.id ?? '', allocation: 0 }]);
  };

  return (
    <div className="strategy-builder">
      <div className="strategy-head">
        <h4>Allocate across strategies</h4>
        <AllocationPie
          slices={rows.map((row, idx) => ({
            color: COLORS[idx % COLORS.length],
            value: row.allocation,
          }))}
        />
      </div>

      <div className="strategy-rows">
        {rows.map((row, idx) => {
          const op = opportunities.find((item) => item.id === row.opportunityId) ?? opportunities[0];
          return (
            <div key={row.id} className="strategy-row-item">
              <select value={row.opportunityId} onChange={(e) => update(row.id, { opportunityId: e.target.value })}>
                {opportunities.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.protocolName}
                  </option>
                ))}
              </select>
              <StrategyPill type={op?.strategyType ?? 'lend'} compact />
              <input type="range" min={0} max={100} value={row.allocation} onChange={(e) => update(row.id, { allocation: Number(e.target.value) })} />
              <strong>{row.allocation}%</strong>
              <span className="apy-chip">APY {formatAPY(op?.apy ?? 0)}</span>
              <button onClick={() => remove(row.id)} className="icon-btn">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <button className="add-strategy-btn" onClick={add}>
        <Plus size={14} /> Add Strategy
      </button>
    </div>
  );
}
