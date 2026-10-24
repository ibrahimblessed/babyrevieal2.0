import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

function friendly(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Wrong email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a minute and try again.';
    case 'auth/network-request-failed':
      return 'No connection. Check your internet and try again.';
    case 'auth/operation-not-allowed':
      return 'Email and password sign-in is not enabled in Firebase yet.';
    default:
      return 'Could not sign in. Please try again.';
  }
}

export default function Login() {
  const { user, loading, isParent, signIn, signOut } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [shake, setShake] = useState(0);

  if (!loading && isParent) return <Navigate to="/parents" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr('');
    try {
      await signIn(email, pw);
      nav('/parents', { replace: true });
    } catch (ex) {
      setErr(friendly((ex as { code?: string }).code ?? ''));
      setShake((s) => s + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wrap narrow">
      <Link to="/" className="back">
        ← Back to the countdown
      </Link>

      <motion.div
        key={shake}
        className="glass card"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={shake ? { opacity: 1, y: 0, scale: 1, x: [0, -12, 10, -6, 3, 0] } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: shake ? 0.4 : 0.6, ease: 'easeOut' }}
      >
        <div className="lock" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="10" rx="3" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <h2 className="h2 left">Parents only</h2>
        <p className="muted left">Sign in to choose boy or girl and set the reveal time.</p>

        {user && !isParent ? (
          <>
            <p className="err">{user.email} is not on the parents list.</p>
            <button className="btn ghost" onClick={() => void signOut()}>
              Sign out
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="form">
            <label>
              <span>Email</span>
              <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            <label>
              <span>Password</span>
              <div className="pw">
                <input type={show ? 'text' : 'password'} autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Your password" />
                <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            {err && (
              <motion.p className="err" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                {err}
              </motion.p>
            )}
            <motion.button className="btn solid" type="submit" disabled={busy || loading} whileTap={{ scale: 0.97 }}>
              {busy ? 'Signing in…' : 'Sign in'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
