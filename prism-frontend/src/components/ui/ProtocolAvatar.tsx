import { gradientFromName } from '../../utils/gradient';

type Props = {
  name: string;
  size?: number;
};

export default function ProtocolAvatar({ name, size = 32 }: Props) {
  const abbr = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="avatar-circle" style={{ width: size, height: size, backgroundImage: gradientFromName(name) }}>
      <span>{abbr || 'IA'}</span>
    </div>
  );
}
