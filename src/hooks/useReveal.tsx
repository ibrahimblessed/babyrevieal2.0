import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { DEFAULT_REVEAL_DATE, REVEAL_DOC } from '../config';
import type { RevealDoc } from '../types';

interface RevealState {
  data: RevealDoc;
  /** True until the first answer from Firestore arrives. */
  loading: boolean;
  /** True once the reveal document exists in Firestore. */
  exists: boolean;
  error: string | null;
}

const DEFAULT: RevealDoc = { date: DEFAULT_REVEAL_DATE, result: null, revealedAt: null };

const Ctx = createContext<RevealState>({ data: DEFAULT, loading: true, exists: false, error: null });

/** One live Firestore listener shared by the whole app. Everyone sees changes instantly. */
export function RevealProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RevealState>({ data: DEFAULT, loading: true, exists: false, error: null });

  useEffect(() => {
    const ref = doc(db, ...REVEAL_DOC);
    return onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setState({ data: DEFAULT, loading: false, exists: false, error: null });
          return;
        }
        const d = snap.data();
        setState({
          loading: false,
          exists: true,
          error: null,
          data: {
            date: typeof d.date === 'string' ? d.date : DEFAULT.date,
            result: d.result === 'boy' || d.result === 'girl' ? d.result : null,
            revealedAt: typeof d.revealedAt === 'string' ? d.revealedAt : null,
          },
        });
      },
      (err) => setState((s) => ({ ...s, loading: false, error: err.message })),
    );
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useReveal = (): RevealState => useContext(Ctx);

/** Writes the shared reveal state. Only the parent accounts allowed by the Firestore rules succeed. */
export async function saveReveal(current: RevealDoc, patch: Partial<RevealDoc>): Promise<void> {
  const next = { ...current, ...patch };
  await setDoc(
    doc(db, ...REVEAL_DOC),
    { ...next, updatedBy: auth.currentUser?.email ?? null, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
