import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FxLayer, { type FxHandle } from './FxLayer';
import { RGB, applyResultTint, tint } from '../lib/tint';
import type { Result } from '../types';

const LOG = [
  '> waking the probe',
  '> locking onto subject',
  '> measuring ........ 100%',
  '> decoding marker',
  '> signal resolved',
];

type Stage = 'scan' | 'count' | 'boom';

interface Props {
  result: Result;
  /** Fires the moment the answer is shown (use it to mark the reveal as seen). */
  onBoom?: () => void;
  onDone: () => void;
}

/** Full screen reveal: decoding log, 3-2-1 with blue and pink flicker, then the big bang. */
export default function Cinema({ result, onBoom, onDone }: Props) {
  const [stage, setStage] = useState<Stage>('scan');
  const [lines, setLines] = useState(0);
  const [n, setN] = useState(3);
  const [flick, setFlick] = useState<Result>('boy');
  const [canClose, setCanClose] = useState(false);
  const fx = useRef<FxHandle>(null);
  const timers = useRef<number[]>([]);
  const boomed = useRef(false);
  const cb = useRef({ onBoom, onDone });
  cb.current = { onBoom, onDone };

  useEffect(() => {
    tint.locked = true;
    tint.rgb = [...RGB.phos];
    tint.goal = 0;
    tint.mix = 0;

    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    let flickId = 0;

    const boom = () => {
      if (boomed.current) return;
      boomed.current = true;
      window.clearInterval(flickId);
      tint.rgb = [...RGB[result]];
      tint.goal = 1;
      tint.mix = Math.max(tint.mix, 0.4);
      setStage('boom');
      fx.current?.celebrate(result);
      try {
        navigator.vibrate?.([90, 40, 220]);
      } catch {
        /* not supported */
      }
      cb.current.onBoom?.();
      at(2200, () => setCanClose(true));
    };
    skipRef.current = boom;

    const lineId = window.setInterval(() => setLines((l) => Math.min(LOG.length, l + 1)), 480);
    at(2900, () => {
      window.clearInterval(lineId);
      setStage('count');
      setN(3);
      flickId = window.setInterval(() => {
        setFlick((f) => {
          const next: Result = f === 'boy' ? 'girl' : 'boy';
          tint.rgb = [...RGB[next]];
          tint.goal = 1;
          tint.mix = 0.85;
          return next;
        });
      }, 150);
    });
    at(3900, () => setN(2));
    at(4900, () => setN(1));
    at(5900, boom);

    return () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
      window.clearInterval(lineId);
      window.clearInterval(flickId);
      fx.current?.stop();
      tint.locked = false;
      applyResultTint();
    };
  }, [result]);

  const skipRef = useRef<() => void>(() => {});
  const accent = stage === 'boom' ? RGB[result] : stage === 'count' ? RGB[flick] : RGB.phos;
  const style = { '--c': accent.join(',') } as CSSProperties;
  const word = result === 'boy' ? "IT'S A BOY!" : "IT'S A GIRL!";

  return (
    <motion.div
      className="cinema"
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      role="dialog"
      aria-modal="true"
      aria-label="Gender reveal"
    >
      <FxLayer ref={fx} />

      {stage !== 'boom' && (
        <button className="cin-skip" onClick={() => skipRef.current()}>
          Skip
        </button>
      )}

      {stage === 'scan' && (
        <motion.div className="cin-log" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {LOG.slice(0, lines).map((l, i) => (
            <motion.div key={l} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
              {l}
              {i === lines - 1 && <span className="caret" />}
            </motion.div>
          ))}
        </motion.div>
      )}

      {stage === 'count' && (
        <AnimatePresence mode="wait">
          <motion.div
            key={n}
            className="cin-n"
            initial={{ scale: 2.4, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0.9, 0.2, 1] }}
          >
            {n}
          </motion.div>
        </AnimatePresence>
      )}

      {stage === 'boom' && (
        <motion.div
          className="cin-boom"
          animate={{ x: [0, -16, 13, -9, 6, 0], y: [0, 9, -11, 6, -3, 0] }}
          transition={{ duration: 0.65 }}
        >
          <motion.div className="flash" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1.3 }} />
          <motion.div className="rays" initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} />
          {[0, 0.18, 0.36].map((d) => (
            <motion.span
              key={d}
              className="ring"
              initial={{ scale: 0.1, opacity: 0.9 }}
              animate={{ scale: 5, opacity: 0 }}
              transition={{ duration: 1.8, delay: d, ease: 'easeOut' }}
            />
          ))}

          <h1 className="cin-word" aria-label={word}>
            {word.split('').map((ch, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className={ch === ' ' ? 'sp' : undefined}
                initial={{ y: 120, scale: 0.2, rotate: i % 2 ? 18 : -18, opacity: 0 }}
                animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.25 + i * 0.05 }}
              >
                {ch === ' ' ? ' ' : ch}
              </motion.span>
            ))}
          </h1>

          <motion.p className="cin-sub" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.6 }}>
            Baby Syed is a {result}
          </motion.p>

          <AnimatePresence>
            {canClose && (
              <motion.button
                className="btn solid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => cb.current.onDone()}
              >
                Continue
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
