import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useRaf } from '../hooks/useRaf';
import { Scanner, SH, SW } from '../lib/scanner';
import { tint } from '../lib/tint';

/** The ultrasound picture. Pass `paused` to stop drawing while something covers it. */
export default function ScanCanvas({ className, paused = false }: { className?: string; paused?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const scanner = useRef<Scanner | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const acc = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const c = ref.current?.getContext('2d');
    if (!c) return;
    ctx.current = c;
    scanner.current = new Scanner(c);
  }, []);

  useRaf((t, dt) => {
    acc.current += dt;
    if (acc.current < (reduced ? 0.5 : 1 / 24) || !scanner.current || !ctx.current) return;
    acc.current = 0;
    scanner.current.render(t, tint.mix, tint.rgb);
    ctx.current.putImageData(scanner.current.img, 0, 0);
  }, !paused);

  return <canvas ref={ref} width={SW} height={SH} className={className} aria-hidden="true" />;
}
