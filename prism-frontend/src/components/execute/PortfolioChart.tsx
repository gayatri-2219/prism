import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PortfolioPoint } from '../../types';

export default function PortfolioChart({ points }: { points: PortfolioPoint[] }) {
  return (
    <div className="chart-wrap">
      <h4>Portfolio value over time</h4>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F5C4" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#00F5C4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip
            contentStyle={{
              background: 'rgba(8,11,15,0.9)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              backdropFilter: 'blur(10px)',
            }}
          />
          <Area type="monotone" dataKey="value" stroke="#00F5C4" strokeWidth={2} fill="url(#portfolioGradient)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
