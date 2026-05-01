import { Compass, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../animations';
import FeedTicker from '../components/feed/FeedTicker';
import GlassCard from '../components/ui/GlassCard';
import CountUp from '../components/ui/CountUp';
import GradientText from '../components/ui/GradientText';
import type { Route } from '../types';

type Props = { navigate: (route: Route) => void };

export default function GuidePage({ navigate }: Props) {
  return (
    <div>
      <section className="hero-section">
        <img className="hero-bg-image" src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1920" alt="bg" />
        <div className="hero-orb orb-1" />
        <div className="hero-orb orb-2" />
        <div className="hero-orb orb-3" />

        <motion.div className="hero-content" variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={fadeInUp} className="hero-pill">✦ Built on Initia · Powered by AI</motion.div>
          <motion.h1 variants={fadeInUp}>
            Your Money,<br />
            <GradientText>Working.</GradientText>
          </motion.h1>
          <motion.p variants={fadeInUp}>
            IAE finds the best yield opportunities on Initia and executes them for you from one page, in one transaction.
          </motion.p>
          <motion.div variants={fadeInUp} className="hero-cta-row">
            <button className="btn-primary" onClick={() => navigate('feed')}>Launch App</button>
            <button className="btn-ghost" onClick={() => navigate('architecture')}>See How It Works</button>
          </motion.div>
          <motion.div variants={fadeInUp} className="trust-bar">
            <span>Powered by Initia</span>
            <span>Session-Key Autopilot</span>
            <span>Verifiable on initia.scan</span>
          </motion.div>
        </motion.div>
      </section>

      <FeedTicker />

      <section className="section-block">
        <h2>How It Works</h2>
        <div className="steps-grid">
          {[
            {
              no: '01',
              icon: Wallet,
              title: 'Connect & Scan',
              desc: "Connect your Initia wallet. IAE instantly reads balances and finds idle capital you're leaving on the table.",
            },
            {
              no: '02',
              icon: Sparkles,
              title: 'AI Recommends',
              desc: 'Our intelligence layer ranks every opportunity by APY, risk, and compatibility live every 5 minutes.',
            },
            {
              no: '03',
              icon: TrendingUp,
              title: 'Execute & Earn',
              desc: 'One transaction deploys funds across top strategies, verifiable in real time on initia.scan.',
            },
          ].map((item) => (
            <GlassCard key={item.no} className="step-card" animated>
              <div className="step-no">{item.no}</div>
              <item.icon size={24} color="#00F5C4" />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="section-block">
        <GlassCard className="stats-card" padding="lg">
          <div data-tooltip="Total Value Locked - the amount of capital deposited in the protocol.">
            <strong><CountUp prefix="$" value={2.4} suffix="M+" decimals={1} /></strong>
            <span>TVL</span>
          </div>
          <div>
            <strong><CountUp value={12} /></strong>
            <span>Protocols</span>
          </div>
          <div>
            <strong><CountUp value={847} /></strong>
            <span>Wallets</span>
          </div>
          <div data-tooltip="Annual Percentage Yield - the estimated yearly return on deposited assets.">
            <strong><CountUp value={18.5} suffix="%" decimals={1} /></strong>
            <span>Avg APY</span>
          </div>
        </GlassCard>
      </section>

      <section className="section-block">
        <h3 className="strip-title">Strategies powered by</h3>
        <div className="logos-strip">
          {['Initia DEX', 'Initia Lend', 'INIT Staking', 'Move Swap', 'Bridge Vault', 'Auto-Yield'].map((name) => (
            <div key={name} className="protocol-logo-pill">{name}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
