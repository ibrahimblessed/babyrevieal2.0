import { useEffect } from 'react';
import { useReveal } from '../hooks/useReveal';
import { RGB, applyResultTint, tint } from '../lib/tint';
import { lsGet, seenKey } from '../lib/storage';

/**
 * Keeps the shared scan colour in step with the published answer. Renders nothing.
 * A viewer who has not yet watched the reveal cinematic stays neutral so nothing leaks early.
 */
export default function TintSync() {
  const { data } = useReveal();
  useEffect(() => {
    tint.result = data.result;
    if (tint.locked) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const unseen = !!data.result && !reduced && !lsGet(seenKey(data.revealedAt));
    if (unseen) {
      tint.rgb = [...RGB.phos];
      tint.goal = 0;
    } else {
      applyResultTint();
    }
  }, [data.result, data.revealedAt]);
  return null;
}
