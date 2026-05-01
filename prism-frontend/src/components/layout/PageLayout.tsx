import type { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../../animations';

export default function PageLayout({ children }: PropsWithChildren) {
  return (
    <motion.section
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="page-shell"
    >
      {children}
    </motion.section>
  );
}
