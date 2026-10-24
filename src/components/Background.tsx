import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useRaf } from '../hooks/useRaf';
import { rgbStr, tint } from '../lib/tint';
import type { Phase, Result } from '../types';

interface Star { x: number; y: number; vx: number; vy: number; r: number; ph: number }
interface Shoot { x: number; y: number; vx: number; vy: number; age: number }

/**
 * Full page living background: a blue glow and a pink glow circle each other, small lights drift
 * between them and a shooting star crosses now and then. At the reveal the winner takes over.
 */
export default function Background({ phase, result }: { phase: Phase; result: Result | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const s = useRef({ w: 2, h: 2, stars: [] as Star[], ang: 0, shoot: null as Shoot | null, next: 2, acc: 0 });

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const resize = () => {
      const st = s.current;
      st.w = Math.max(2, Math.ceil(window.innerWidth / 2));
      st.h = Math.max(2, Math.ceil(window.innerHeight / 2));
      cv.width = st.w;
      cv.height = st.h;
      st.stars = Array.from({ length: 110 }, () => ({
        x: Math.random() * st.w,
        y: Math.random() * st.h,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        r: 0.6 + Math.random() * 1.5,
        ph: Math.random() * 6.28,
      }));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useRaf((t, dt) => {
    const cv = ref.current;
    const cx = cv?.getContext('2d');
    if (!cv || !cx) return;
    const st = s.current;
    st.acc += dt;
    if (st.acc < (reduced ? 0.5 : 1 / 30)) return;
    const d = st.acc;
    st.acc = 0;
    const { w, h } = st;
    const m = tint.mix;
    st.ang += (phase === 'ready' ? 0.8 : phase === 'revealed' ? 0.12 : 0.2) * d;

    cx.globalCompositeOperation = 'source-over';
    cx.clearRect(0, 0, w, h);
    cx.globalCompositeOperation = 'lighter';

    const blob = (x: number, y: number, r: number, rgb: string, a: number) => {
      if (a <= 0.004) return;
      const g = cx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${rgb},${a.toFixed(3)})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      cx.fillStyle = g;
      cx.fillRect(x - r, y - r, r * 2, r * 2);
    };

    const R = Math.min(w, h) * 0.8;
    const base = phase === 'ready' ? 0.46 : 0.3;
    let bx = w * (0.5 + 0.34 * Math.cos(st.ang));
    let by = h * (0.5 + 0.22 * Math.sin(st.ang * 1.3));
    let gx = w * (0.5 + 0.34 * Math.cos(st.ang + Math.PI));
    let gy = h * (0.5 + 0.22 * Math.sin((st.ang + Math.PI) * 1.3));
    let aB = base;
    let aG = base;
    let rB = R;
    let rG = R;
    const wx = w * 0.5;
    const wy = h * 0.42;
    if (result === 'boy') {
      bx += (wx - bx) * m; by += (wy - by) * m;
      aB = base * (1 + 0.9 * m); aG = base * (1 - m); rB = R * (1 + 0.5 * m);
    }
    if (result === 'girl') {
      gx += (wx - gx) * m; gy += (wy - gy) * m;
      aG = base * (1 + 0.9 * m); aB = base * (1 - m); rG = R * (1 + 0.5 * m);
    }
    blob(bx, by, rB, '91,168,255', aB);
    blob(gx, gy, rG, '255,125,180', aG);

    const col = rgbStr();
    for (const star of st.stars) {
      if (phase === 'ready') {
        star.vx += (w * 0.5 - star.x) * 0.002 * d * 60;
        star.vy += (h * 0.5 - star.y) * 0.002 * d * 60;
      }
      star.x += star.vx * d;
      star.y += star.vy * d;
      if (star.x < 0) star.x += w;
      if (star.x > w) star.x -= w;
      if (star.y < 0) star.y += h;
      if (star.y > h) star.y -= h;
      const al = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.5 + star.ph));
      cx.fillStyle = `rgba(${col},${al.toFixed(2)})`;
      cx.beginPath();
      cx.arc(star.x, star.y, star.r, 0, 6.2832);
      cx.fill();
    }

    st.next -= d;
    if (st.next <= 0 && !st.shoot) {
      st.shoot = { x: Math.random() * w * 0.7, y: Math.random() * h * 0.35, vx: w * 0.9, vy: h * 0.34, age: 0 };
      st.next = 3 + Math.random() * 5;
    }
    const sh = st.shoot;
    if (sh) {
      sh.age += d;
      sh.x += sh.vx * d;
      sh.y += sh.vy * d;
      cx.strokeStyle = `rgba(${col},${(Math.max(0, 1 - sh.age / 0.9) * 0.9).toFixed(2)})`;
      cx.lineWidth = 1.2;
      cx.beginPath();
      cx.moveTo(sh.x, sh.y);
      cx.lineTo(sh.x - sh.vx * 0.12, sh.y - sh.vy * 0.12);
      cx.stroke();
      if (sh.age > 0.9) st.shoot = null;
    }
  });

  return <canvas ref={ref} className="bg-canvas" aria-hidden="true" />;
}
