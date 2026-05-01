export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export const cardHover = {
  rest: { y: 0, borderColor: 'rgba(255,255,255,0.08)' },
  hover: {
    y: -4,
    borderColor: 'rgba(0,245,196,0.3)',
    transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
  },
};

export const sidebarSlide = {
  hidden: { x: -260, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
};

export const pageTransition = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};
