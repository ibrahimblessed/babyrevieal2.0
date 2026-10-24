import { AnimatePresence, motion } from 'framer-motion';
import ScanCanvas from './ScanCanvas';
import Ecg from './Ecg';
import { useNow } from '../hooks/useNow';
import type { Phase, Result } from '../types';

// Fan outline of the ultrasound sector, drawn in the same 200 x 150 space as the picture.
const AX = 100, AY = -8, R = 154, HALF = 0.72;
const X1 = AX - R * Math.sin(HALF);
const X2 = AX + R * Math.sin(HALF);
const Y1 = AY + R * Math.cos(HALF);
const FAN = `M${AX} ${AY} L${X1.toFixed(1)} ${Y1.toFixed(1)} A${R} ${R} 0 0 0 ${X2.toFixed(1)} ${Y1.toFixed(1)} Z`;
const TICKS = [24, 40, 56, 72, 88, 104, 120, 136];

const STATUS: Record<Phase, string> = { waiting: 'Sealed', ready: 'Scan complete', revealed: 'Resolved' };

function Clock() {
  const now = useNow(1000);
  const d = new Date(now);
  const p = (n: number) => String(n).padStart(2, '0');
  return <span>{`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`}</span>;
}

export { Clock };

export default function ScanScreen({ phase, result, paused = false }: { phase: Phase; result: Result | null; paused?: boolean }) {
  return (
    <div className="scopewrap">
      <div className="scope">
        <ScanCanvas className="scan" paused={paused} />
        <svg className="ov" viewBox="0 0 200 150" aria-hidden="true">
          <path d={FAN} fill="none" stroke="currentColor" strokeOpacity=".5" strokeWidth=".7" />
          <g stroke="currentColor" strokeOpacity=".6" strokeWidth=".8">
            {TICKS.map((y, i) => (
              <path key={y} d={`M196 ${y}h-${i % 2 ? 3 : 6}`} />
            ))}
          </g>
          <g fill="none" stroke="currentColor" strokeOpacity=".7" strokeWidth=".7">
            <path d="M60 70h6M63 67v6M126 88h6M129 85v6" />
            <path d="M64 71L128 87" strokeDasharray="2 2" />
          </g>
        </svg>
        <div className="lines" />
        <div className="brackets" />
        <div className="ro tl">Syed, Baby<br />Scan 01</div>
        <div className="ro tr">Live</div>
        <div className="ro bl">
          Sex{' '}
          <AnimatePresence mode="wait" initial={false}>
            <motion.b
              key={result ?? 'none'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'inline-block' }}
            >
              {result ? result.toUpperCase() : '???'}
            </motion.b>
          </AnimatePresence>
        </div>
        <div className="ro br">{STATUS[phase]}</div>
      </div>
      <Ecg paused={paused} />
    </div>
  );
}
