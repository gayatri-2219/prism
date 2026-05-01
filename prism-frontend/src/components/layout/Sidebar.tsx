import { motion } from 'framer-motion';
import { ArrowUpRight, Compass, Cpu, Layers, Trophy, Wallet, Zap } from 'lucide-react';
import { sidebarSlide } from '../../animations';
import type { Route } from '../../types';
import GradientText from '../ui/GradientText';
import WalletButton from '../ui/WalletButton';
import NavItem from './NavItem';

type Props = {
  route: Route;
  navigate: (route: Route) => void;
  opportunitiesCount: number;
  autopilotEnabled: boolean;
  initiaAddress?: string;
  username?: string | null;
  balance: number;
  onConnect: () => void;
  onWallet: () => void;
  onBridge: () => void;
};

export default function Sidebar(props: Props) {
  const {
    route,
    navigate,
    opportunitiesCount,
    autopilotEnabled,
    initiaAddress,
    username,
    balance,
    onConnect,
    onWallet,
    onBridge,
  } = props;

  return (
    <motion.aside variants={sidebarSlide} initial="hidden" animate="visible" className="sidebar-root">
      <div className="sidebar-logo-row">
        <div>
          <div className="sidebar-logo-title">
            ◆ <GradientText>IAE</GradientText>
          </div>
          <p>Initia Action Engine</p>
        </div>
        <span className="beta-pill">BETA</span>
      </div>

      <nav className="sidebar-nav">
        <NavItem icon={Compass} label="Guide" active={route === 'guide'} onClick={() => navigate('guide')} />
        <NavItem icon={Zap} label="Feed" active={route === 'feed'} badge={String(opportunitiesCount)} onClick={() => navigate('feed')} />
        <NavItem icon={ArrowUpRight} label="Execute" active={route === 'execute'} onClick={() => navigate('execute')} />
        <NavItem icon={Cpu} label="Autopilot" active={route === 'autopilot'} badge={autopilotEnabled ? 'ON' : undefined} onClick={() => navigate('autopilot')} />
        <NavItem icon={Trophy} label="Leaderboard" active={route === 'leaderboard'} onClick={() => navigate('leaderboard')} />
        <NavItem icon={Layers} label="Architecture" active={route === 'architecture'} onClick={() => navigate('architecture')} />
      </nav>

      <div className="sidebar-bottom">
        <WalletButton
          initiaAddress={initiaAddress}
          username={username}
          balance={balance}
          onConnect={onConnect}
          onWallet={onWallet}
          onBridge={onBridge}
        />
        <div className="sidebar-version">v0.1.0 · Initiation-2</div>
        <div className="sidebar-orb" />
      </div>
    </motion.aside>
  );
}
