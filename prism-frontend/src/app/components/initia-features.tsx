import { motion } from 'motion/react';
import { User, Zap, ArrowLeftRight, Check } from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: '👤',
    title: 'Initia Usernames',
    description: 'No more confusing wallet addresses. Use human-readable names like @gayatri.init 🎯',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    demo: (
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
        <div className="text-xs text-gray-500 mb-2 font-medium">Send to:</div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-sm text-white font-bold shadow-md">
            G
          </div>
          <div>
            <div className="font-bold text-gray-900">@gayatri.init</div>
            <div className="text-xs text-gray-400">0x742d...3f4a</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: '⚡',
    title: 'Auto-Signing',
    description: 'Enable seamless transactions without constant wallet popups. One approval, multiple actions! 🚀',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    demo: 'auto-sign',
  },
  {
    icon: '🌉',
    title: 'Interwoven Bridge',
    description: 'One-click cross-chain bridging to Initia from any network. Fast, secure, and effortless! 🔗',
    gradient: 'from-indigo-500 to-purple-500',
    bgGradient: 'from-indigo-50 to-purple-50',
    demo: (
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs">
            <div className="text-gray-500 mb-1 font-medium">From</div>
            <div className="font-bold text-gray-900">Ethereum</div>
          </div>
          <ArrowLeftRight className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
          <div className="text-xs">
            <div className="text-gray-500 mb-1 font-medium">To</div>
            <div className="font-bold text-gray-900">Initia</div>
          </div>
        </div>
        <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs font-bold shadow-md">
          Bridge 100 USDC →
        </button>
      </div>
    ),
  },
];

export function InitiaFeatures() {
  const [autoSignEnabled, setAutoSignEnabled] = useState(false);
  return (
    <div className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-200 rounded-full mb-6">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-gray-700">Powered by Initia ⚡</span>
          </div>
          <h2 className="text-5xl font-display text-gray-900 mb-4">Native Initia Integration</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of DeFi with Initia's cutting-edge features built right into PRISM 🚀
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -8 }}
              className={`bg-gradient-to-br ${feature.bgGradient} border-2 border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all`}
            >
              <div className="text-5xl mb-6">{feature.icon}</div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed font-medium">{feature.description}</p>

              {feature.demo === 'auto-sign' ? (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-900">
                      {autoSignEnabled ? 'Auto-signing enabled' : 'Auto-signing disabled'}
                    </span>
                    <button
                      onClick={() => setAutoSignEnabled(!autoSignEnabled)}
                      className={`w-12 h-6 rounded-full relative shadow-md transition-all ${
                        autoSignEnabled
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                          autoSignEnabled ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                      <Check
                        className={`w-4 h-4 ${autoSignEnabled ? 'text-green-600' : 'text-gray-300'}`}
                        strokeWidth={3}
                      />
                      <span>Transaction auto-approved ✓</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                      <Check
                        className={`w-4 h-4 ${autoSignEnabled ? 'text-green-600' : 'text-gray-300'}`}
                        strokeWidth={3}
                      />
                      <span>No popup interruptions ✓</span>
                    </div>
                  </div>
                </div>
              ) : (
                feature.demo
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-3xl p-12 text-center shadow-xl"
        >
          <h3 className="text-3xl font-display text-gray-900 mb-4">Ready to experience the future? 🌟</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto font-medium">
            Join thousands of users already leveraging Initia's powerful features through PRISM
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all font-bold"
            >
              Get Started Now 🚀
            </button>
            <button
              onClick={() => alert('Documentation coming soon! 📚')}
              className="px-8 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all font-bold text-gray-700"
            >
              Learn More 📚
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
