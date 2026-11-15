import { MotionConfig, motion } from 'framer-motion';
import Navbar from './Navbar';
import { pageVariants } from './motionPresets';

/**
 * Wraps a page with Navbar and an animated <main>.
 * MotionConfig honours the OS "reduce motion" setting for every animation inside.
 */
export default function PageShell({ className = '', children }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="site-shell">
        <Navbar />
        <motion.main
          className={className}
          variants={pageVariants}
          initial="initial"
          animate="animate"
        >
          {children}
        </motion.main>
      </div>
    </MotionConfig>
  );
}
