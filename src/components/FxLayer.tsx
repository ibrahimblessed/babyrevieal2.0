import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { FxEngine } from '../lib/fx';
import type { Result } from '../types';

export interface FxHandle {
  celebrate: (r: Result) => void;
  stop: () => void;
}

/** A fixed, click-through canvas for confetti and fireworks. Control it through the ref. */
const FxLayer = forwardRef<FxHandle>(function FxLayer(_props, ref) {
  const cv = useRef<HTMLCanvasElement>(null);
  const eng = useRef<FxEngine | null>(null);

  useEffect(() => {
    if (!cv.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const e = new FxEngine(cv.current, reduced);
    eng.current = e;
    const onResize = () => e.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      e.stop();
      eng.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      celebrate: (r) => eng.current?.celebrate(r),
      stop: () => eng.current?.stop(),
    }),
    [],
  );

  return <canvas ref={cv} className="fx" aria-hidden="true" />;
});

export default FxLayer;
