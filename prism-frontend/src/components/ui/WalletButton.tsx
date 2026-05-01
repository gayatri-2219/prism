import UserAvatar from './UserAvatar';
import { formatAddress, formatAmount } from '../../utils/format';

type Props = {
  initiaAddress?: string;
  username?: string | null;
  balance: number;
  connecting?: boolean;
  onConnect: () => void;
  onWallet?: () => void;
  onBridge?: () => void;
};

export default function WalletButton({ initiaAddress, username, balance, connecting, onConnect, onWallet, onBridge }: Props) {
  if (!initiaAddress) {
    return (
      <button className="wallet-connect-btn" onClick={onConnect}>
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  const name = username ? `${username}.init` : formatAddress(initiaAddress);

  return (
    <div className="wallet-widget">
      <div className="wallet-user-row">
        <UserAvatar address={initiaAddress} username={username} size={48} />
        <div>
          <div className="wallet-name">{name}</div>
          <div className="wallet-balance">{formatAmount(balance, 2)} INIT</div>
        </div>
      </div>
      <div className="wallet-actions-row">
        <button onClick={onWallet}>Wallet</button>
        <button onClick={onBridge}>Bridge</button>
        <button onClick={onConnect}>Switch</button>
      </div>
    </div>
  );
}
