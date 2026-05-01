export const formatAddress = (addr: string) => (addr ? `${addr.slice(0, 8)}...${addr.slice(-4)}` : '');

export const formatAmount = (value: number, digits = 2) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value || 0);

export const formatAPY = (apy: number) => `${formatAmount(apy, 1)}%`;

export const formatCurrency = (value: number) =>
  `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value || 0)}`;

export const formatCompact = (value: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0);

export const relativeTime = (iso: string) => {
  const now = Date.now();
  const ms = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)} d ago`;
};
