import { motion } from 'framer-motion';
import { pageVariants } from '../utils/animations';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: Props) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
