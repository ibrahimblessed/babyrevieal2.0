import { useNow } from './useNow';
import { useReveal } from './useReveal';
import type { Phase } from '../types';

/** waiting: counting down. ready: the time has come, parents have not picked yet. revealed: answer is public. */
export function usePhase(): { phase: Phase; target: number; remaining: number } {
  const { data } = useReveal();
  const now = useNow(200);
  const parsed = new Date(data.date).getTime();
  const target = Number.isNaN(parsed) ? now + 864e5 : parsed;
  const remaining = target - now;
  const phase: Phase = data.result ? 'revealed' : remaining <= 0 ? 'ready' : 'waiting';
  return { phase, target, remaining };
}
