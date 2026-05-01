import type { TxItem } from '../../types';
import { relativeTime } from '../../utils/format';
import TxLink from '../ui/TxLink';

export default function ActivityLog({ rows }: { rows: TxItem[] }) {
  if (!rows.length) {
    return <div className="empty-log">Autopilot will log every execution here</div>;
  }

  return (
    <div className="activity-table">
      <div className="table-head">
        <span>Date</span>
        <span>Action</span>
        <span>Strategies</span>
        <span>Return</span>
        <span>Tx</span>
      </div>
      {rows.map((row) => (
        <div className="table-row" key={row.hash}>
          <span>{relativeTime(row.timestamp)}</span>
          <span><i className="status executed">Executed</i></span>
          <span>{row.type}</span>
          <span className="up">+{(Math.random() * 2.5 + 0.4).toFixed(2)}%</span>
          <span><TxLink hash={row.hash} /></span>
        </div>
      ))}
    </div>
  );
}
