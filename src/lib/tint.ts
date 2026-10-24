import type { Result } from '../types';

export const RGB = {
  phos: [191, 227, 216],
  boy: [91, 168, 255],
  girl: [255, 125, 180],
} as const;

/**
 * One shared colour state that the scan, the background and the heartbeat line all read every frame.
 * `mix` eases toward `goal` (0 = neutral phosphor, 1 = boy blue or girl pink).
 */
export const tint = {
  mix: 0,
  goal: 0,
  rgb: [...RGB.phos] as number[],
  /** The result currently published, whatever the screen is doing. */
  result: null as Result | null,
  /** True while a reveal cinematic is running and owns the colour. */
  locked: false,
};

export function applyResultTint(): void {
  tint.rgb = [...(tint.result ? RGB[tint.result] : RGB.phos)];
  tint.goal = tint.result ? 1 : 0;
}

export function rgbStr(): string {
  const a = RGB.phos;
  const b = tint.rgb;
  const m = tint.mix;
  return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * m)).join(',');
}

let started = false;
export function startTintLoop(): void {
  if (started) return;
  started = true;
  let last = performance.now();
  const loop = (ts: number) => {
    const dt = Math.min(0.1, (ts - last) / 1000);
    last = ts;
    tint.mix += (tint.goal - tint.mix) * Math.min(1, dt * 3);
    if (Math.abs(tint.goal - tint.mix) < 0.002) tint.mix = tint.goal;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
