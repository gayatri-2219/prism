import { AnimatePresence, motion } from 'framer-motion';
import type { ToastMessage } from '../../types';
import TxLink from './TxLink';

type Props = {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
};

export default function NotificationToast({ toasts, onDismiss }: Props) {
  return (
    <div className="toast-stack">
      <AnimatePresence>
        {toasts.slice(0, 3).map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10, x: 16 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10, x: 16 }}
            className={`toast ${toast.type}`}
          >
            <div>{toast.message}</div>
            {toast.txHash ? <TxLink hash={toast.txHash} /> : null}
            <button onClick={() => onDismiss(toast.id)}>×</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
