import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut, type User } from 'firebase/auth';
import { auth } from '../firebase';
import { PARENT_EMAILS } from '../config';

interface AuthState {
  user: User | null;
  /** True until Firebase has told us whether someone is signed in. */
  loading: boolean;
  /** Signed in and allowed on the dashboard. */
  isParent: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      }),
    [],
  );

  const value = useMemo<AuthState>(() => {
    const email = user?.email?.toLowerCase() ?? '';
    const allowed = PARENT_EMAILS.length === 0 || PARENT_EMAILS.map((e) => e.toLowerCase()).includes(email);
    return {
      user,
      loading,
      isParent: !!user && allowed,
      signIn: async (e, p) => {
        await signInWithEmailAndPassword(auth, e.trim(), p);
      },
      signOut: () => fbSignOut(auth),
    };
  }, [user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
