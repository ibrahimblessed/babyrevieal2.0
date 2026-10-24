export type Result = 'boy' | 'girl';
export type Phase = 'waiting' | 'ready' | 'revealed';

export interface RevealDoc {
  /** ISO date and time the family finds out. */
  date: string;
  result: Result | null;
  /** ISO time the parents pressed reveal. Used so each viewer sees the cinematic once. */
  revealedAt: string | null;
}
