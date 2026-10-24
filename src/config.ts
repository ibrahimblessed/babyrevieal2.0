/** Shown until the parents save a different date on the dashboard. */
export const DEFAULT_REVEAL_DATE = '2026-10-26T17:00:00+02:00';

/**
 * Parent email addresses allowed on the dashboard (lower case).
 * This only decides what the app shows. The real lock is firestore.rules.
 * Leave empty to let any signed-in account see the dashboard (writes still need the rules).
 */
export const PARENT_EMAILS: string[] = [
  // 'dad@example.com',
  // 'mum@example.com',
];

/** Firestore location of the shared reveal state: collection, document. */
export const REVEAL_DOC = ['babySyed', 'reveal'] as const;
