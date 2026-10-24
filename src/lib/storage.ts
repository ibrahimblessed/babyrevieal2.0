export const lsGet = (k: string): string | null => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

export const lsSet = (k: string, v: string): void => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage can be blocked, ignore */
  }
};

export const seenKey = (revealedAt: string | null): string => `bs:seen:${revealedAt ?? 'x'}`;
export const GUESS_KEY = 'bs:guess:v1';
