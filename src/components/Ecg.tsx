import { useEffect, useRef } from 'react';
import { useRaf } from '../hooks/useRaf';
import { ecgY } from '../lib/scanner';
import { rgbStr } from '../lib/tint';

/** A scrolling heartbeat line that takes on the boy or girl colour at the reveal. */
export default function Ecg({ paused = false }: { paused?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dpr = useRef(1);

  useEffect(() => {
    const size = () => {
      const c = ref.current;
      if (!c) return;
      dpr.current = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.max(10, Math.round(c.clientWidth * dpr.current));
      c.height = Math.round(44 * dpr.current);
    };
    size();
    window.addEventListener('resize', size);
    return () => window.removeEventListener('resize', size);
  }, []);

  useRaf((t) => {
    const c = ref.current;
    const g = c?.getContext('2d');
    if (!c || !g) return;
    const { width: w, height: h } = c;
    const k = dpr.current;
    g.clearRect(0, 0, w, h);
    const col = rgbStr();
    const pps = 110 * k;
    const bps = 2.3;
    const mid = h * 0.62;
    const amp = h * 0.44;
    const grad = g.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, `rgba(${col},0)`);
    grad.addColorStop(0.4, `rgba(${col},.85)`);
    grad.addColorStop(1, `rgba(${col},1)`);
    g.strokeStyle = grad;
    g.lineWidth = 1.6 * k;
    g.lineJoin = 'round';
    g.beginPath();
    for (let x = 0; x <= w; x += 2) {
      let ph = (t - (w - x) / pps) * bps;
      ph -= Math.floor(ph);
      const y = mid - ecgY(ph) * amp;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    g.fillStyle = `rgb(${col})`;
    g.beginPath();
    g.arc(w - 2 * k, mid - ecgY((((t * bps) % 1) + 1) % 1) * amp, 2.6 * k, 0, 6.2832);
    g.fill();
  }, !paused);

  return <canvas ref={ref} className="ecg" aria-hidden="true" />;
}
