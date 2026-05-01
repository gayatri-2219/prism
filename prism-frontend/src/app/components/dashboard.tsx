import { motion } from 'motion/react';
import { TrendingUp, ArrowUpRight, Clock } from 'lucide-react';
import { useState } from 'react';

const chartData = [
  { value: 32000 },
  { value: 35000 },
  { value: 33500 },
  { value: 38000 },
  { value: 41000 },
  { value: 39500 },
  { value: 47234 },
];

const actions = [
  {
    title: 'Stake ETH on EigenLayer',
    risk: 'Low',
    riskColor: 'text-green-700',
    riskBg: 'bg-green-100',
    effort: 'Easy',
    returns: '6.2% APY',
    time: '5 min',
    icon: '🔒',
    emoji: '⚡',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
  },
  {
    title: 'Farm USDC-ETH LP Tokens',
    risk: 'Medium',
    riskColor: 'text-orange-700',
    riskBg: 'bg-orange-100',
    effort: 'Moderate',
    returns: '18.5% APY',
    time: '10 min',
    icon: '💰',
    emoji: '🌾',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
  },
  {
    title: 'Bridge to Initia for Airdrop',
    risk: 'Low',
    riskColor: 'text-green-700',
    riskBg: 'bg-green-100',
    effort: 'Easy',
    returns: '$200-500',
    time: '3 min',
    icon: '🎁',
    emoji: '🌉',
    gradient: 'from-indigo-500 to-purple-500',
    bgGradient: 'from-indigo-50 to-purple-50',
  },
];

const insights = [
  {
    icon: '💡',
    text: 'You have $2,400 in idle funds that could earn 12% APY',
    action: 'View Strategy',
    color: 'from-yellow-50 to-orange-50',
    border: 'border-yellow-200',
  },
  {
    icon: '🎁',
    text: 'You qualify for 2 active airdrops worth $800 total',
    action: 'Claim Now',
    color: 'from-pink-50 to-purple-50',
    border: 'border-pink-200',
  },
  {
    icon: '📊',
    text: 'Market opportunity: ETH staking rates increased by 2.4%',
    action: 'Learn More',
    color: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
  },
];

const opportunities = [
  {
    type: 'Airdrop',
    title: 'Initia Genesis Campaign',
    reward: '$200-500',
    difficulty: 'Easy',
    progress: 60,
    icon: '🎁',
    badge: '🔥 Hot',
    badgeColor: 'bg-red-100 text-red-700',
  },
  {
    type: 'Yield',
    title: 'High APY on USDC',
    reward: '24% APY',
    difficulty: 'Medium',
    progress: 0,
    icon: '💰',
    badge: '⭐ New',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    type: 'Token',
    title: 'Early Access: $PRISM',
    reward: 'TBA',
    difficulty: 'Hard',
    progress: 0,
    icon: '✨',
    badge: '👑 Pro',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
];

const tokens = [
  { name: 'ETH', logo: '💎', value: '$28,340', change: '+5.2%', changeColor: 'text-green-600', percentage: 60 },
  { name: 'USDC', logo: '💵', value: '$12,450', change: '+0.1%', changeColor: 'text-green-600', percentage: 26 },
  { name: 'BTC', logo: '₿', value: '$6,444', change: '+3.8%', changeColor: 'text-green-600', percentage: 14 },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('tokens');
  const [timeframe, setTimeframe] = useState('7d');

  return (
    <div className="py-16 px-6" id="dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-4xl font-display text-gray-900 mb-2">Portfolio Overview</h2>
              <p className="text-gray-600">Welcome back, @gayatri.init 👋</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-colors font-medium text-gray-700 shadow-sm cursor-pointer"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-gray-500 mb-2 font-medium">Total Value</div>
                  <div className="text-5xl font-bold text-gray-900">$47,234.50</div>
                  <div className="flex items-center gap-2 text-green-600 mt-3 font-medium">
                    <TrendingUp className="w-5 h-5" />
                    <span>+$5,234 (12.4%)</span>
                    <span className="text-gray-400">this month 📈</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('tokens')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium shadow-md transition-all ${
                      activeTab === 'tokens'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Tokens
                  </button>
                  <button
                    onClick={() => setActiveTab('staking')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'staking'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Staking
                  </button>
                  <button
                    onClick={() => setActiveTab('liquidity')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'liquidity'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Liquidity
                  </button>
                </div>
              </div>

              <div className="h-40 flex items-end gap-2">
                {chartData.map((point, idx) => (
                  <motion.div
                    key={idx}
                    className="flex-1 flex flex-col justify-end group cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-xs text-gray-500 mb-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      ${(point.value / 1000).toFixed(1)}k
                    </div>
                    <div
                      className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80"
                      style={{
                        height: `${(point.value / 50000) * 100}%`,
                        minHeight: '20%',
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-lg">
              <div className="text-sm text-gray-500 mb-5 font-medium">Asset Breakdown 💎</div>
              <div className="space-y-5">
                {tokens.map((token, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{token.logo}</span>
                        <span className="font-bold text-gray-900">{token.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{token.value}</div>
                        <div className={`text-xs ${token.changeColor} font-medium`}>{token.change}</div>
                      </div>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${token.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-3xl font-display text-gray-900 mb-6">Today's Best Actions 🎯</h3>
          <div className="grid lg:grid-cols-3 gap-6">
            {actions.map((action, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03, y: -8 }}
                className={`relative bg-gradient-to-br ${action.bgGradient} border-2 border-gray-200 rounded-3xl p-6 cursor-pointer group shadow-lg hover:shadow-xl transition-all`}
              >
                <div className="absolute -top-3 -right-3 text-3xl">{action.emoji}</div>

                <div className="text-4xl mb-4">{action.icon}</div>

                <h4 className="text-xl font-bold text-gray-900 mb-4">{action.title}</h4>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Risk</span>
                    <span className={`px-3 py-1.5 ${action.riskBg} ${action.riskColor} rounded-lg text-sm font-bold`}>
                      {action.risk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Effort</span>
                    <span className="text-sm font-bold text-gray-900">{action.effort}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Returns</span>
                    <span className="text-sm font-bold text-green-600">{action.returns}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Time</span>
                    <span className="text-sm font-bold text-gray-900">{action.time}</span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Executing: ${action.title}`)}
                  className={`w-full py-3.5 bg-gradient-to-r ${action.gradient} text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group/btn font-bold`}
                >
                  Execute Now
                  <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl">✨</div>
              <h3 className="text-2xl font-display text-gray-900">AI Insights</h3>
            </div>

            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  className={`bg-gradient-to-r ${insight.color} border-2 ${insight.border} rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <p className="text-sm leading-relaxed text-gray-700 font-medium">{insight.text}</p>
                  </div>
                  <button
                    onClick={() => alert(insight.action)}
                    className="text-sm text-blue-600 hover:text-purple-600 transition-colors flex items-center gap-1 font-bold"
                  >
                    {insight.action}
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-lg">
            <h3 className="text-2xl font-display text-gray-900 mb-6">Opportunity Feed 🚀</h3>

            <div className="space-y-4">
              {opportunities.map((opp, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => alert(`Opening: ${opp.title}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{opp.icon}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 font-medium">{opp.type}</span>
                          <span className={`px-2 py-0.5 ${opp.badgeColor} rounded-full text-xs font-bold`}>{opp.badge}</span>
                        </div>
                        <div className="font-bold text-gray-900">{opp.title}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-bold">{opp.reward}</div>
                      <div className="text-xs text-gray-500 font-medium">{opp.difficulty}</div>
                    </div>
                  </div>
                  {opp.progress > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2 font-medium">
                        <span>Progress</span>
                        <span>{opp.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${opp.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
