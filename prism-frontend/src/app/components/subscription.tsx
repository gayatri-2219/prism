import { motion } from 'motion/react';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: '⚡',
    bgGradient: 'from-gray-50 to-gray-100',
    borderColor: 'border-gray-300',
    features: [
      'Basic AI insights',
      'Limited opportunities (5/day)',
      'Portfolio tracking',
      'Community support',
    ],
    cta: 'Get Started',
    ctaStyle: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    icon: '👑',
    bgGradient: 'from-blue-50 via-purple-50 to-pink-50',
    borderColor: 'border-blue-400',
    popular: true,
    features: [
      'Advanced AI recommendations',
      'Unlimited opportunities',
      'Early airdrop access',
      'Whale wallet tracking',
      'Real-time alerts',
      'Priority support',
      'Auto-execution',
      'Portfolio analytics',
    ],
    cta: 'Upgrade to Pro',
    ctaStyle: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    icon: '✨',
    bgGradient: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-400',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom strategies',
      'API access',
      'White-label solution',
      'Advanced security',
    ],
    cta: 'Contact Sales',
    ctaStyle: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white',
  },
];

export function Subscription() {
  return (
    <div className="py-20 px-6" id="pricing">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-100 to-pink-100 border-2 border-orange-200 rounded-full mb-6">
            <Crown className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-bold text-gray-700">Flexible Pricing 💎</span>
          </div>
          <h2 className="text-5xl font-display text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-600">
            Start free, upgrade when you're ready to unlock your full potential 🚀
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -8 }}
              className={`relative bg-gradient-to-br ${plan.bgGradient} border-3 ${plan.borderColor} rounded-3xl p-8 shadow-xl ${
                plan.popular ? 'lg:scale-105 border-4' : 'border-2'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full text-sm font-bold shadow-lg animate-pulse">
                  🔥 Most Popular
                </div>
              )}

              <div className="text-5xl mb-6">{plan.icon}</div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 ml-2">/ {plan.period}</span>
              </div>

              <button
                onClick={() => alert(`Selected: ${plan.name} Plan`)}
                className={`w-full py-4 ${plan.ctaStyle} rounded-xl transition-all mb-8 hover:shadow-xl font-bold`}
              >
                {plan.cta}
              </button>

              <div className="space-y-3">
                {plan.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-3xl p-12 shadow-xl">
            <h3 className="text-3xl font-display text-gray-900 mb-4">Not sure which plan to choose? 🤔</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto font-medium">
              Start with our free plan and upgrade anytime. All plans include a 14-day money-back guarantee! 💯
            </p>
            <button
              onClick={() => alert('Expert chat opening soon! 💬')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all font-bold"
            >
              Talk to an Expert 💬
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
