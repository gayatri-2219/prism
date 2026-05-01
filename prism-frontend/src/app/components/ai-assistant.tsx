import { motion } from 'motion/react';
import { Send, Sparkles, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const sampleMessages = [
  {
    type: 'user',
    text: 'Where should I invest ₹1000? 💰',
  },
  {
    type: 'ai',
    text: "Based on your portfolio and risk profile, I recommend splitting into 2 positions for optimal diversification:",
    strategies: [
      {
        title: 'Stake ETH (60%)',
        amount: '₹600',
        risk: 'Low',
        apy: '6.2% APY',
        description: 'Conservative strategy with reliable returns',
        icon: '🔒',
        emoji: '💎',
        gradient: 'from-blue-500 to-cyan-500',
        bgGradient: 'from-blue-50 to-cyan-50',
      },
      {
        title: 'Airdrop Farming (40%)',
        amount: '₹400',
        risk: 'Medium',
        returns: '~₹200-500',
        description: 'Active strategy with high potential rewards',
        icon: '🎁',
        emoji: '🚀',
        gradient: 'from-purple-500 to-pink-500',
        bgGradient: 'from-purple-50 to-pink-50',
      },
    ],
  },
];

export function AIAssistant() {
  const [input, setInput] = useState('');

  return (
    <div className="py-20 px-6" id="ai">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-bold text-gray-700">AI-Powered Assistant ✨</span>
          </div>
          <h2 className="text-5xl font-display text-gray-900 mb-4">Ask PRISM Anything</h2>
          <p className="text-xl text-gray-600">
            Get personalized insights and actionable strategies 🎯
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-xl"
        >
          <div className="h-[500px] overflow-y-auto p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white">
            {sampleMessages.map((msg, idx) => (
              <div key={idx}>
                {msg.type === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-tr-sm px-6 py-3.5 max-w-md font-medium shadow-lg">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-tl-sm px-6 py-4 mb-4 shadow-md">
                          <p className="text-gray-700 leading-relaxed font-medium">{msg.text}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {msg.strategies?.map((strategy, sidx) => (
                            <div
                              key={sidx}
                              className={`relative bg-gradient-to-br ${strategy.bgGradient} border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all`}
                            >
                              <div className="absolute -top-3 -right-3 text-2xl">{strategy.emoji}</div>

                              <div className="text-4xl mb-4">{strategy.icon}</div>

                              <h4 className="font-bold text-gray-900 mb-1 text-lg">{strategy.title}</h4>
                              <div className="text-3xl font-bold text-gray-900 mb-4">{strategy.amount}</div>

                              <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600 font-medium">Risk</span>
                                  <span className={strategy.risk === 'Low' ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>
                                    {strategy.risk}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600 font-medium">Returns</span>
                                  <span className="font-bold text-green-600">{strategy.apy || strategy.returns}</span>
                                </div>
                              </div>

                              <p className="text-sm text-gray-600 mb-4 font-medium">{strategy.description}</p>

                              <button className={`w-full py-3 bg-gradient-to-r ${strategy.gradient} text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group font-bold`}>
                                Execute
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t-2 border-gray-200 p-6 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about strategies, opportunities, or your portfolio... 💬"
                className="flex-1 px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400 font-medium"
              />
              <button className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-xl transition-all">
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {['Best opportunities today 🎯', 'Optimize my portfolio 📊', 'Eligible airdrops 🎁'].map((prompt, idx) => (
                <button
                  key={idx}
                  className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-sm font-medium text-gray-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
