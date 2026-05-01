import { motion } from 'motion/react';
import { Check, ArrowRight, Clock, Gift } from 'lucide-react';

const airdrops = [
  {
    name: 'Initia Genesis Campaign',
    reward: '$200-500',
    difficulty: 'Easy',
    time: '15 min',
    progress: 60,
    icon: '🎁',
    badge: '🔥 Trending',
    badgeColor: 'bg-red-100 text-red-700',
    gradient: 'from-orange-50 to-pink-50',
    steps: [
      { title: 'Connect Wallet', completed: true },
      { title: 'Bridge to Initia', completed: true },
      { title: 'Swap $50+ tokens', completed: true },
      { title: 'Provide Liquidity', completed: false },
      { title: 'Complete for 7 days', completed: false },
    ],
  },
  {
    name: 'LayerZero Snapshot',
    reward: '$100-300',
    difficulty: 'Medium',
    time: '25 min',
    progress: 40,
    icon: '⚡',
    badge: '⭐ Popular',
    badgeColor: 'bg-blue-100 text-blue-700',
    gradient: 'from-blue-50 to-cyan-50',
    steps: [
      { title: 'Bridge using LayerZero', completed: true },
      { title: 'Complete 3 transactions', completed: true },
      { title: 'Hold for 30 days', completed: false },
      { title: 'Participate in governance', completed: false },
    ],
  },
  {
    name: 'EigenLayer Points',
    reward: 'TBA',
    difficulty: 'Hard',
    time: '30 min',
    progress: 25,
    icon: '💎',
    badge: '👑 Pro',
    badgeColor: 'bg-purple-100 text-purple-700',
    gradient: 'from-purple-50 to-pink-50',
    steps: [
      { title: 'Stake ETH on EigenLayer', completed: true },
      { title: 'Opt-in to restaking', completed: false },
      { title: 'Maintain position for 90 days', completed: false },
      { title: 'Delegate to operator', completed: false },
    ],
  },
];

export function AirdropTracker() {
  return (
    <div className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-200 rounded-full mb-6">
            <Gift className="w-5 h-5 text-pink-600" />
            <span className="text-sm font-bold text-gray-700">Airdrop Opportunities 🎁</span>
          </div>
          <h2 className="text-5xl font-display text-gray-900 mb-4">Track Your Airdrops</h2>
          <p className="text-xl text-gray-600">
            Gamified tracking with step-by-step guidance to maximize rewards 🚀
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {airdrops.map((airdrop, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -8 }}
              className={`bg-gradient-to-br ${airdrop.gradient} border-2 border-gray-200 rounded-3xl p-6 hover:border-blue-400 hover:shadow-xl transition-all`}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 ${airdrop.badgeColor} rounded-full text-xs font-bold`}>
                      {airdrop.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{airdrop.name}</h3>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <span className="text-green-600 font-bold">{airdrop.reward}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{airdrop.difficulty}</span>
                  </div>
                </div>
                <div className="text-4xl">{airdrop.icon}</div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2 font-medium">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-gray-900 font-bold">{airdrop.progress}%</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden border-2 border-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${airdrop.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {airdrop.steps.map((step, sidx) => (
                  <div key={sidx} className="flex items-start gap-3">
                    {step.completed ? (
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex-shrink-0 mt-0.5 bg-white" />
                    )}
                    <span className={`text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 font-medium">
                <Clock className="w-4 h-4" />
                <span>⏱️ {airdrop.time}</span>
              </div>

              <button className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group font-bold">
                Continue
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
