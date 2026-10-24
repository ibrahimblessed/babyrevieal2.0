import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/** The last ten seconds take over the screen with one huge number per second. */
export default function FinalCount({ remaining }: { remaining: number }) {
  const reduced = useReducedMotion();
  const show = !reduced && remaining > 0 && remaining <= 10000;
  const n = Math.ceil(remaining / 1000);
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.span
              key={n}
              initial={{ scale: 1.7, opacity: 0 }}
              animate={{ scale: 0.88, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {n}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
