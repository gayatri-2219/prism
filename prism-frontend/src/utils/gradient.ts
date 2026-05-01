const GRADIENTS = [
  'from-cyan-400 to-teal-600',
  'from-violet-400 to-purple-600',
  'from-amber-400 to-orange-600',
  'from-pink-400 to-rose-600',
  'from-blue-400 to-indigo-600',
  'from-emerald-400 to-green-600',
  'from-fuchsia-400 to-pink-600',
  'from-sky-400 to-blue-600',
];

const MAP = {
  'from-cyan-400 to-teal-600': 'linear-gradient(135deg,#22d3ee,#0d9488)',
  'from-violet-400 to-purple-600': 'linear-gradient(135deg,#a78bfa,#7c3aed)',
  'from-amber-400 to-orange-600': 'linear-gradient(135deg,#fbbf24,#ea580c)',
  'from-pink-400 to-rose-600': 'linear-gradient(135deg,#f472b6,#e11d48)',
  'from-blue-400 to-indigo-600': 'linear-gradient(135deg,#60a5fa,#4f46e5)',
  'from-emerald-400 to-green-600': 'linear-gradient(135deg,#34d399,#16a34a)',
  'from-fuchsia-400 to-pink-600': 'linear-gradient(135deg,#e879f9,#db2777)',
  'from-sky-400 to-blue-600': 'linear-gradient(135deg,#38bdf8,#2563eb)',
} as const;

export function gradientFromAddress(address: string) {
  const byte = address?.slice(-2) ?? '00';
  const index = (Number.parseInt(byte, 16) || 0) % GRADIENTS.length;
  const key = GRADIENTS[index] as keyof typeof MAP;
  return MAP[key];
}

export function gradientFromName(name: string) {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const key = GRADIENTS[hash % GRADIENTS.length] as keyof typeof MAP;
  return MAP[key];
}
