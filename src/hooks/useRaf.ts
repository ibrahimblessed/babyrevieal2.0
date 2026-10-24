import { useEffect, useRef } from 'react';

/** Calls `cb(timeSeconds, dtSeconds)` on every animation frame while `active` is true. */
export function useRaf(cb: (t: number, dt: number) => void, active = true): void {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (!active) return;
    let id = 0;
    let last = performance.now();
    const loop = (ts: number) => {
      const dt = Math.min(0.1, Math.max(0, (ts - last) / 1000));
      last = ts;
      ref.current(ts / 1000, dt);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);
}
