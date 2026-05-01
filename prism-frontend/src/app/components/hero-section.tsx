import { motion } from 'motion/react';
import { ArrowRight, TrendingUp, Shield, Zap, Sparkles, Award } from 'lucide-react';
import { useState } from 'react';

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div className="pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700 font-medium">Built on Initia Chain ⚡</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display leading-tight text-gray-900">
              Turn Crypto Complexity into{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Clear Actions
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed font-body">
              AI-powered insights, airdrops, and one-click execution on Initia.
              Stop guessing. Start earning. 🚀
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-500/40 transition-all flex items-center gap-2 group font-medium"
              >
                Start Exploring
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => alert('Demo video coming soon! 🎥')}
                className="px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all font-medium text-gray-700"
              >
                Watch Demo 🎥
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Average APY</div>
                  <div className="text-lg font-bold text-gray-900">12.5%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Active Users</div>
                  <div className="text-lg font-bold text-gray-900">24.5K+</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-2xl shadow-blue-500/10">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                🔥 Live
              </div>

              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl text-white font-bold shadow-lg">
                  G
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">@gayatri.init</div>
                  <div className="text-sm text-green-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Connected
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="text-xs text-gray-500 mb-1 font-medium">Portfolio Value</div>
                  <div className="text-4xl font-bold text-gray-900">$47,234.50</div>
                  <div className="text-sm text-green-600 flex items-center gap-1 mt-2 font-medium">
                    <TrendingUp className="w-4 h-4" />
                    +$5,234 (12.4%) this month 📈
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 mb-1">✨ AI Recommendation</div>
                      <div className="text-sm text-gray-600">Stake ETH → 6.2% APY → Low Risk 🛡️</div>
                    </div>
                  </div>
                  <button
                    onClick={() => alert('Executing: Stake ETH → 6.2% APY 🚀')}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/40 transition-all font-medium"
                  >
                    Execute Now →
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-xs text-gray-600 font-medium">Assets</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">5</div>
                    <div className="text-xs text-gray-600 font-medium">Networks</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-pink-600">3</div>
                    <div className="text-xs text-gray-600 font-medium">Airdrops</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery) {
                  alert(`Searching for: ${searchQuery}`);
                }
              }}
              placeholder="🔍 Search wallet / username / opportunity..."
              className="w-full px-6 py-5 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors text-lg placeholder:text-gray-400 font-body shadow-lg"
            />
            <button
              onClick={() => {
                if (searchQuery) {
                  alert(`Searching for: ${searchQuery}`);
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!searchQuery}
            >
              Search
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
