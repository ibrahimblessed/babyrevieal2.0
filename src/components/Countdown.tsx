import { AnimatePresence, motion } from 'framer-motion';

/** One digit that rolls out and a new one rolls in whenever the value changes. */
function Digit({ v }: { v: string }) {
  return (
    <span className="dg">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={v}
          className="dg-i"
          initial={{ y: -18, opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: 18, opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {v}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Tile({ value, label }: { value: number; label: string }) {
  const s = String(value).padStart(2, '0');
  return (
    <div className="tile">
      <b aria-label={`${value} ${label}`}>
        {s.split('').map((ch, i) => (
          <Digit key={i} v={ch} />
        ))}
      </b>
      <small>{label}</small>
    </div>
  );
}

export default function Countdown({ remaining }: { remaining: number }) {
  const sec = Math.max(0, Math.floor(remaining / 1000));
  return (
    <div className="tiles" role="group" aria-label="Time left until the reveal">
      <Tile value={Math.floor(sec / 86400)} label="Days" />
      <Tile value={Math.floor((sec % 86400) / 3600)} label="Hours" />
      <Tile value={Math.floor((sec % 3600) / 60)} label="Min" />
      <Tile value={sec % 60} label="Sec" />
    </div>
  );
}
