import { gradientFromAddress } from '../../utils/gradient';

type Props = {
  address: string;
  username?: string | null;
  size?: number;
};

export default function UserAvatar({ address, username, size = 40 }: Props) {
  const letter = (username?.[0] ?? address?.[0] ?? '?').toUpperCase();
  return (
    <div className="avatar-circle" style={{ width: size, height: size, backgroundImage: gradientFromAddress(address || '00') }}>
      <span>{letter}</span>
    </div>
  );
}
