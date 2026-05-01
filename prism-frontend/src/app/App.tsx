import { Navbar } from './components/navbar';
import { CryptoBackground } from './components/crypto-background';
import { HeroSection } from './components/hero-section';
import { Dashboard } from './components/dashboard';
import { AIAssistant } from './components/ai-assistant';
import { AirdropTracker } from './components/airdrop-tracker';
import { InitiaFeatures } from './components/initia-features';
import { Subscription } from './components/subscription';
import { Footer } from './components/footer';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 text-gray-900 overflow-x-hidden">
      <CryptoBackground />
      <Navbar />
      <HeroSection />
      <Dashboard />
      <AIAssistant />
      <AirdropTracker />
      <InitiaFeatures />
      <Subscription />
      <Footer />
    </div>
  );
}