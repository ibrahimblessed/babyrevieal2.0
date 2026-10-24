import type { Result } from '../types';

const PAL: Record<Result, string[]> = {
  boy: ['#5BA8FF', '#8FC4FF', '#C7E1FF', '#2E7DE0', '#FFFFFF', '#FFD36B'],
  girl: ['#FF7DB4', '#FFA8CE', '#FFD0E4', '#E6478F', '#FFFFFF', '#FFD36B'],
};

interface Conf {
  x: number; y: number; vx: number; vy: number;
  w: number; h: number; rot: number; vr: number; fl: number; fs: number;
  c: string; age: number; ttl: number;
}
interface Spark {
  x: number; y: number; vx: number; vy: number;
  age: number; ttl: number; c: string; r: number; ring?: boolean;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];

/** Full screen confetti cannons, falling confetti and fireworks. Draws on one fixed canvas. */
export class FxEngine {
  private cx: CanvasRenderingContext2D | null;
  private fw = 0;
  private fh = 0;
  private dp = 1;
  private parts: Conf[] = [];
  private sp: Spark[] = [];
  private timers: number[] = [];
  private running = false;
  private last = 0;
  private pal = PAL.boy;

  constructor(private cv: HTMLCanvasElement, private reduced: boolean) {
    this.cx = cv.getContext('2d');
    this.resize();
  }

  resize(): void {
    this.dp = Math.min(window.devicePixelRatio || 1, 2);
    this.fw = window.innerWidth;
    this.fh = window.innerHeight;
    this.cv.width = Math.round(this.fw * this.dp);
    this.cv.height = Math.round(this.fh * this.dp);
    this.cv.style.width = `${this.fw}px`;
    this.cv.style.height = `${this.fh}px`;
  }

  private conf(x: number, y: number, ang: number, spread: number, speed: number) {
    const a = ang + rnd(-spread, spread);
    const s = speed * rnd(0.45, 1);
    this.parts.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      w: rnd(7, 13), h: rnd(4, 8), rot: rnd(0, 6.28), vr: rnd(-9, 9),
      fl: rnd(0, 6.28), fs: rnd(4, 9), c: pick(this.pal), age: 0, ttl: rnd(3.4, 5.6),
    });
  }

  private cannon(x: number, y: number, ang: number, n: number, speed: number) {
    for (let i = 0; i < n; i++) this.conf(x, y, ang, 0.38, speed);
  }

  private rain(n: number) {
    for (let i = 0; i < n; i++) {
      this.parts.push({
        x: rnd(0, this.fw), y: rnd(-40, -10), vx: rnd(-40, 40), vy: rnd(40, 140),
        w: rnd(7, 13), h: rnd(4, 8), rot: rnd(0, 6.28), vr: rnd(-7, 7),
        fl: rnd(0, 6.28), fs: rnd(3, 7), c: pick(this.pal), age: 0, ttl: rnd(4, 6.5),
      });
    }
  }

  private burst() {
    const x = rnd(0.12 * this.fw, 0.88 * this.fw);
    const y = rnd(0.1 * this.fh, 0.5 * this.fh);
    const c1 = pick(this.pal.slice(0, 4));
    const c2 = pick(this.pal);
    for (let i = 0; i < 72; i++) {
      const a = rnd(0, 6.2832);
      const v = rnd(70, 270) * (i % 2 ? 1 : 0.62);
      this.sp.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, ttl: rnd(0.9, 1.8), c: i % 3 ? c1 : c2, r: rnd(1.2, 2.7) });
    }
    this.sp.push({ ring: true, x, y, vx: 0, vy: 0, age: 0, ttl: 0.5, c: c1, r: 0 });
  }

  private later(ms: number, fn: () => void) {
    const id = window.setTimeout(() => {
      this.timers = this.timers.filter((t) => t !== id);
      fn();
      this.kick();
    }, ms);
    this.timers.push(id);
  }

  private kick() {
    if (!this.cx || this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.loop);
  }

  celebrate(result: Result): void {
    if (!this.cx || this.reduced) return;
    this.stop();
    this.pal = PAL[result];
    const sp = Math.max(700, this.fh * 1.25);
    const { fw, fh } = this;
    this.cannon(fw * 0.04, fh, -1.15, 90, sp);
    this.cannon(fw * 0.96, fh, -Math.PI + 1.15, 90, sp);
    this.later(450, () => {
      this.cannon(fw * 0.04, fh, -1.05, 70, sp * 0.9);
      this.cannon(fw * 0.96, fh, -Math.PI + 1.05, 70, sp * 0.9);
    });
    this.later(1300, () => this.rain(70));
    this.later(2600, () => this.rain(60));
    for (let i = 0; i < 12; i++) this.later(500 + i * 420, () => this.burst());
    this.kick();
  }

  stop(): void {
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
    this.parts = [];
    this.sp = [];
    if (this.cx) this.cx.clearRect(0, 0, this.cv.width, this.cv.height);
  }

  private step(dt: number) {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.age += dt;
      p.vy += 900 * dt;
      if (p.vy > 280) p.vy = 280;
      p.vx *= Math.max(0, 1 - 2.2 * dt);
      p.fl += p.fs * dt;
      p.x += p.vx * dt + Math.sin(p.fl) * 30 * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.y > this.fh + 30 || p.age > p.ttl) this.parts.splice(i, 1);
    }
    for (let i = this.sp.length - 1; i >= 0; i--) {
      const q = this.sp[i];
      q.age += dt;
      if (!q.ring) {
        q.vx *= 1 - 1.6 * dt;
        q.vy = q.vy * (1 - 1.6 * dt) + 120 * dt;
        q.x += q.vx * dt;
        q.y += q.vy * dt;
      }
      if (q.age > q.ttl) this.sp.splice(i, 1);
    }
  }

  private draw() {
    const cx = this.cx!;
    cx.setTransform(1, 0, 0, 1, 0, 0);
    cx.clearRect(0, 0, this.cv.width, this.cv.height);
    cx.setTransform(this.dp, 0, 0, this.dp, 0, 0);
    cx.globalCompositeOperation = 'lighter';
    for (const q of this.sp) {
      const k = 1 - q.age / q.ttl;
      if (q.ring) {
        cx.globalAlpha = Math.max(0, k * 0.8);
        cx.strokeStyle = q.c;
        cx.lineWidth = 2;
        cx.beginPath();
        cx.arc(q.x, q.y, 10 + (q.age / q.ttl) * 90, 0, 6.2832);
        cx.stroke();
      } else {
        cx.globalAlpha = Math.max(0, k);
        cx.fillStyle = q.c;
        cx.strokeStyle = q.c;
        cx.lineWidth = q.r * 0.8;
        cx.beginPath();
        cx.arc(q.x, q.y, q.r, 0, 6.2832);
        cx.fill();
        cx.beginPath();
        cx.moveTo(q.x, q.y);
        cx.lineTo(q.x - q.vx * 0.04, q.y - q.vy * 0.04);
        cx.stroke();
      }
    }
    cx.globalCompositeOperation = 'source-over';
    for (const p of this.parts) {
      cx.globalAlpha = Math.max(0, Math.min(1, (p.ttl - p.age) / 0.7));
      cx.save();
      cx.translate(p.x, p.y);
      cx.rotate(p.rot);
      cx.scale(1, Math.cos(p.fl * 1.3));
      cx.fillStyle = p.c;
      cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx.restore();
    }
    cx.globalAlpha = 1;
  }

  private loop = (ts: number) => {
    if (!this.running || !this.cx) return;
    const dt = Math.min(0.05, (ts - this.last) / 1000);
    this.last = ts;
    this.step(dt);
    this.draw();
    if (this.parts.length || this.sp.length || this.timers.length) {
      requestAnimationFrame(this.loop);
    } else {
      this.running = false;
      this.cx.setTransform(1, 0, 0, 1, 0, 0);
      this.cx.clearRect(0, 0, this.cv.width, this.cv.height);
    }
  };
}
