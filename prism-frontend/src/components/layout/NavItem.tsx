import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: string;
  onClick: () => void;
};

export default function NavItem({ icon: Icon, label, active, badge, onClick }: Props) {
  return (
    <motion.button whileHover={{ x: 3 }} onClick={onClick} className={`nav-item ${active ? 'active' : ''}`}>
      <Icon size={16} />
      <span>{label}</span>
      {badge ? <span className="nav-badge">{badge}</span> : null}
    </motion.button>
  );
}
