import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{ from?: string; to?: string; className?: string }>;

export default function GradientText({ children, from = '#00F5C4', to = '#A78BFA', className = '' }: Props) {
  return (
    <span
      className={className}
      style={{
        backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
        WebkitBackgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {children}
    </span>
  );
}
