import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Cinema from '../components/Cinema';
import HoldButton from '../components/HoldButton';
import { useAuth } from '../hooks/useAuth';
import { saveReveal, useReveal } from '../hooks/useReveal';
import { usePhase } from '../hooks/usePhase';
import type { Result } from '../types';

/** ISO string -> value for <input type="datetime-local"> in the viewer's own time zone. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function explain(ex: unknown): string {
  const code = (ex as { code?: string }).code ?? '';
  if (code === 'permission-denied') return 'Permission denied. Check that your email is listed in firestore.rules and the rules are published.';
  if (code === 'unavailable') return 'No connection to Firebase. Try again in a moment.';
  return 'Could not save. Please try again.';
}

export default function Parents() {
  const { user, loading, isParent, signOut } = useAuth();
  const { data } = useReveal();
  const { phase } = usePhase();
  const [pick, setPick] = useState<Result | null>(null);
  const [date, setDate] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  // Fill the date box once, and again whenever someone else changes it.
  useEffect(() => {
    setDate(toLocalInput(data.date));
  }, [data.date]);

  if (loading) return <div className="wrap narrow"><p className="muted">Checking who you are…</p></div>;
  if (!user || !isParent) return <Navigate to="/login" replace />;

  const run = async (fn: () => Promise<void>, okText: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, text: okText });
    } catch (ex) {
      setMsg({ ok: false, text: explain(ex) });
    } finally {
      setBusy(false);
    }
  };

  const saveDate = () => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) {
      setMsg({ ok: false, text: 'Pick a valid date and time.' });
      return;
    }
    void run(() => saveReveal(data, { date: d.toISOString() }), 'Reveal time saved. Everyone sees it now.');
  };

  const reveal = () => {
    if (!pick) return;
    void run(() => saveReveal(data, { result: pick, revealedAt: new Date().toISOString() }), 'Revealed! Everyone watching sees it now.');
  };

  const hide = () => {
    void run(() => saveReveal(data, { result: null, revealedAt: null }), 'Result hidden. The countdown is back.');
  };

  const status =
    phase === 'revealed'
      ? `Published: ${data.result === 'boy' ? 'BOY' : 'GIRL'}`
      : phase === 'ready'
        ? 'The countdown is over. Waiting for you to reveal.'
        : 'Sealed. Nothing is public yet.';

  return (
    <div className="wrap narrow">
      <div className="bar">
        <Link to="/" className="back">
          ← View the public page
        </Link>
        <button className="link" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>

      <motion.div className="glass card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="h2 left">Parents dashboard</h2>
        <p className="muted left small">{user.email}</p>

        <div className={`status ${phase}`}>
          <i />
          {status}
        </div>

        <h3 className="h3">Reveal time</h3>
        <div className="row">
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="btn ghost" disabled={busy} onClick={saveDate}>
            Save time
          </button>
        </div>

        <h3 className="h3">What is it?</h3>
        <div className="picks" role="group" aria-label="Choose boy or girl">
          {(['boy', 'girl'] as const).map((r) => (
            <motion.button
              key={r}
              type="button"
              className={`pickcard ${r}${pick === r ? ' sel' : ''}`}
              aria-pressed={pick === r}
              onClick={() => setPick(r)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              animate={pick === r ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="pickcard-t">{r === 'boy' ? 'Boy' : 'Girl'}</span>
              {pick === r && (
                <motion.span className="tick" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  Selected
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>

        <div className="actions">
          <button className="btn ghost" disabled={!pick} onClick={() => setPreview(true)}>
            Preview on this screen only
          </button>
          <HoldButton label="Hold to reveal to everyone" tone={pick ?? 'neutral'} disabled={!pick || busy} onConfirm={reveal} />
          {data.result && <HoldButton label="Hold to hide the result again" tone="danger" disabled={busy} onConfirm={hide} ms={1800} />}
        </div>

        <AnimatePresence>
          {msg && (
            <motion.p key={msg.text} className={msg.ok ? 'ok' : 'err'} role="status" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {msg.text}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>{preview && pick && <Cinema key="pv" result={pick} onDone={() => setPreview(false)} />}</AnimatePresence>
    </div>
  );
}
