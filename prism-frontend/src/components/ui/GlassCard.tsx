import type { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { cardHover } from '../../animations';

type Props = PropsWithChildren<{
  className?: string;
  glow?: boolean;
  glowColor?: string;
  padding?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}>;

export default function GlassCard({ children, className = '', glow = false, glowColor = '#00F5C4', padding = 'md', animated = false }: Props) {
  const px = padding === 'sm' ? '16px' : padding === 'lg' ? '28px' : '22px';
  const style = glow
    ? { boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 14px 50px ${glowColor}1f` }
    : undefined;

  if (animated) {
    return (
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={cardHover}
        className={`glass-card ${className}`}
        style={{ ...style, padding: px }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`glass-card ${className}`} style={{ ...style, padding: px }}>
      {children}
    </div>
  );
}
