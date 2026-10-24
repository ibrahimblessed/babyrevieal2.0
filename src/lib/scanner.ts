import { RGB } from './tint';

/** Internal resolution of the ultrasound picture. CSS scales it up with chunky pixels. */
export const SW = 200;
export const SH = 150;

/**
 * Draws a living ultrasound: a fan shaped sector, speckle that flickers, two curled shapes that
 * breathe, a heartbeat that pulses, and a beam that sweeps. Colour follows the shared tint.
 */
export class Scanner {
  readonly img: ImageData;
  private mask = new Uint8Array(SW * SH);
  private aa = new Float32Array(SW * SH);
  private base = new Float32Array(SW * SH);
  private noise = new Float32Array(128 * 128);

  constructor(ctx: CanvasRenderingContext2D) {
    this.img = ctx.createImageData(SW, SH);
    const ax = SW / 2;
    const ay = -8;
    const R = 154;
    const half = 0.72;
    for (let y = 0; y < SH; y++) {
      for (let x = 0; x < SW; x++) {
        const i = y * SW + x;
        const dx = x + 0.5 - ax;
        const dy = y + 0.5 - ay;
        const r = Math.sqrt(dx * dx + dy * dy);
        const a = Math.atan2(dx, dy);
        const inside = Math.abs(a) < half && r < R;
        this.mask[i] = inside ? 1 : 0;
        this.aa[i] = a;
        this.base[i] = inside ? (0.06 + 0.5 * Math.exp(-r / 16)) * (1 - 0.5 * (r / R)) : 0;
      }
    }
    for (let k = 0; k < this.noise.length; k++) {
      this.noise[k] = Math.sqrt(-Math.log(1 - Math.random() * 0.999)) / 1.8;
    }
  }

  render(t: number, mix: number, rgb: readonly number[]): void {
    const d = this.img.data;
    const { noise: nz, mask, aa, base } = this;
    const breath = 1 + 0.03 * Math.sin(t * 1.3);
    const beat = Math.pow(Math.max(0, Math.sin(t * 2 * Math.PI * 2.3)), 10);
    const offx = (Math.random() * 128) | 0;
    const offy = (Math.random() * 128) | 0;
    const beam = 0.62 * Math.sin(t * 0.9);
    const [pr, pg, pb] = RGB.phos;
    const tr = pr + (rgb[0] - pr) * mix;
    const tg = pg + (rgb[1] - pg) * mix;
    const tb = pb + (rgb[2] - pb) * mix;
    const boost = 1 + 0.35 * mix;
    const hx = SW * 0.4;
    const hy = SH * 0.56;
    const hr = 27 * breath;
    const bx = SW * 0.63;
    const by = SH * 0.6;
    const brx = 40 * breath;
    const bry = 22 * breath;
    const rot = -0.45;
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    const hx2 = bx - 6;
    const hy2 = by - 4;

    for (let y = 0; y < SH; y++) {
      for (let x = 0; x < SW; x++) {
        const i = y * SW + x;
        const p = i * 4;
        if (!mask[i]) {
          d[p] = 0;
          d[p + 1] = 0;
          d[p + 2] = 0;
          d[p + 3] = 255;
          continue;
        }
        let v = base[i];
        const dx = x - hx;
        const dy = y - hy;
        const q = Math.sqrt(dx * dx + dy * dy) - hr;
        if (q < 9 && q > -12) v += 0.85 * Math.exp((-q * q) / 5);
        else if (q <= -12) v += 0.1;
        const ex = x - bx;
        const ey = y - by;
        const u = (ex * cr + ey * sr) / brx;
        const w = (-ex * sr + ey * cr) / bry;
        const e = Math.sqrt(u * u + w * w);
        const qe = (e - 1) * 16;
        if (e < 1) v += 0.13;
        if (qe < 5 && qe > -5) v += 0.75 * Math.exp((-qe * qe) / 2.2);
        const hdx = x - hx2;
        const hdy = y - hy2;
        v += (0.22 + 0.9 * beat) * Math.exp(-(hdx * hdx + hdy * hdy) / (6 + 14 * beat));
        const da = aa[i] - beam;
        v += 0.35 * Math.exp((-da * da) / 0.0016);
        const s = nz[(((y + offy) & 127) << 7) + ((x + offx) & 127)];
        v *= 0.35 + 1.15 * s;
        v += 0.04 * s;
        if (v > 1) v = 1;
        v = v * v * (3 - 2 * v) * boost;
        d[p] = tr * v;
        d[p + 1] = tg * v;
        d[p + 2] = tb * v;
        d[p + 3] = 255;
      }
    }
  }
}

/** One heartbeat as a smooth trace: small P bump, sharp QRS spike, rounded T bump. */
export function ecgY(ph: number): number {
  const g = (c: number, w: number, a: number) => {
    const z = (ph - c) / w;
    return a * Math.exp(-z * z);
  };
  return g(0.12, 0.035, 0.18) + g(0.285, 0.008, -0.22) + g(0.31, 0.012, 1) + g(0.335, 0.01, -0.38) + g(0.55, 0.05, 0.28);
}
