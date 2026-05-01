import { motion } from 'motion/react';
import { Bitcoin, CircleDollarSign, Coins, Gem, Wallet, TrendingUp, Zap } from 'lucide-react';

const floatingIcons = [
  { Icon: Bitcoin, color: '#F7931A', size: 50, x: '10%', y: '20%', delay: 0, id: 'btc-1' },
  { Icon: CircleDollarSign, color: '#26A17B', size: 45, x: '85%', y: '15%', delay: 0.5, id: 'usd-1' },
  { Icon: Coins, color: '#627EEA', size: 48, x: '15%', y: '70%', delay: 1, id: 'eth-1' },
  { Icon: Gem, color: '#8B5CF6', size: 40, x: '80%', y: '65%', delay: 1.5, id: 'gem-1' },
  { Icon: Wallet, color: '#3B82F6', size: 38, x: '50%', y: '10%', delay: 2, id: 'wallet-1' },
  { Icon: TrendingUp, color: '#10B981', size: 42, x: '90%', y: '85%', delay: 2.5, id: 'trend-1' },
  { Icon: Zap, color: '#F59E0B', size: 38, x: '25%', y: '45%', delay: 3, id: 'zap-1' },
];

export function CryptoBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),rgba(139,92,246,0.1),transparent)]" />

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg1OSwxMzAsMjQ2LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

      {floatingIcons.map((item) => (
        <motion.div
          key={item.id}
          className="absolute"
          style={{
            left: item.x,
            top: item.y,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut",
          }}
        >
          <div
            className="rounded-full p-3 backdrop-blur-sm shadow-lg"
            style={{
              backgroundColor: `${item.color}15`,
              border: `2px solid ${item.color}30`,
            }}
          >
            <item.Icon
              size={item.size}
              style={{ color: item.color }}
              strokeWidth={2.5}
            />
          </div>
        </motion.div>
      ))}

      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
