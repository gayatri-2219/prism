import { KeyRound, ShieldAlert } from 'lucide-react';
import { formatAddress } from '../../utils/format';

type Props = {
  registered: boolean;
  sessionKey?: string;
  loading?: boolean;
  onRegister: () => void;
  onRevoke: () => void;
};

export default function SessionKeyCard({ registered, sessionKey, loading, onRegister, onRevoke }: Props) {
  return (
    <div className="session-key-card">
      {!registered ? (
        <>
          <div className="session-title">
            <ShieldAlert size={18} /> Enable True Autopilot
          </div>
          <p>
            Register a session key to let IAE rebalance automatically without signing each transaction.
            You can revoke at any time.
          </p>
          <button onClick={onRegister} disabled={loading}>{loading ? 'Registering...' : 'Generate & Register Session Key'}</button>
        </>
      ) : (
        <>
          <div className="session-title">
            <KeyRound size={18} /> Session Key Active ✓
          </div>
          <p>{formatAddress(sessionKey || '')}</p>
          <div className="session-actions">
            <button onClick={onRevoke} disabled={loading} className="danger-ghost">Revoke</button>
          </div>
        </>
      )}
    </div>
  );
}
