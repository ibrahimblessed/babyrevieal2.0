import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ScanScreen from '../components/ScanScreen';
import Countdown from '../components/Countdown';
import FinalCount from '../components/FinalCount';
import Cinema from '../components/Cinema';
import TeamPicker, { getGuess } from '../components/TeamPicker';
import { useReveal } from '../hooks/useReveal';
import { usePhase } from '../hooks/usePhase';
import { lsGet, lsSet, seenKey } from '../lib/storage';
import type { Result } from '../types';

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleString([], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Home() {
  const { data, loading, error } = useReveal();
  const { phase, target, remaining } = usePhase();
  const reduced = useReducedMotion();

  // The cinematic plays once per viewer for each reveal. `playing` keeps it mounted after it is marked seen.
  const [playing, setPlaying] = useState(false);
  const [cast, setCast] = useState<Result | null>(null);
  const pending = phase === 'revealed' && !reduced && !lsGet(seenKey(data.revealedAt));

  useEffect(() => {
    if (pending && !playing) {
      setCast(data.result);
      setPlaying(true);
    }
  }, [pending, playing, data.result]);

  const showCinema = pending || playing;
  const cinemaResult = cast ?? data.result;
  const shown = phase === 'revealed' && !showCinema ? data.result : null;
  const guess = getGuess();

  return (
    <div className="wrap">
      <header className="brand">
        <motion.h1
          className="brand-t"
          initial={{ opacity: 0, letterSpacing: '0.7em' }}
          animate={{ opacity: 1, letterSpacing: '0.28em' }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          BABY SYED
        </motion.h1>
        <span className="live">
          <i /> {phase === 'waiting' ? 'Counting down' : phase === 'ready' ? 'The moment' : 'Revealed'}
        </span>
      </header>

      <ScanScreen phase={phase} result={shown} paused={showCinema} />

      <section className="stage" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.p key="load" className="muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Connecting to the scan…
            </motion.p>
          ) : phase === 'waiting' ? (
            <motion.div key="wait" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}>
              <h2 className="h2">Boy or girl?</h2>
              <p className="muted">We find out {fmtDate(target)}</p>
              <Countdown remaining={remaining} />
              <TeamPicker />
            </motion.div>
          ) : phase === 'ready' ? (
            <motion.div key="ready" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}>
              <h2 className="h2 pulse">It is time</h2>
              <p className="muted">Mum and dad are about to open the envelope.</p>
              <p className="muted">Keep this page open, the reveal starts the moment they press the button.</p>
              <TeamPicker />
            </motion.div>
          ) : shown ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <h2 className={`result ${shown}`}>{shown === 'boy' ? "It's a boy!" : "It's a girl!"}</h2>
              <p className="muted">
                {guess ? (guess === shown ? 'You called it. Well done, Team ' : 'Not this time, Team ') + (guess === 'boy' ? 'Boy' : 'Girl') + '.' : 'Welcome to the world, little Syed.'}
              </p>
              {!reduced && (
                <button
                  className="btn ghost"
                  onClick={() => {
                    setCast(data.result);
                    setPlaying(true);
                  }}
                >
                  Watch the reveal again
                </button>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      {phase === 'waiting' && <FinalCount remaining={remaining} />}

      {error && <p className="err small">Can not reach the live feed right now. Retrying…</p>}

      <footer className="foot">
        <Link to="/login">Parents</Link>
      </footer>

      <AnimatePresence>
        {showCinema && cinemaResult && (
          <Cinema
            key={cinemaResult}
            result={cinemaResult}
            onBoom={() => lsSet(seenKey(data.revealedAt), '1')}
            onDone={() => {
              lsSet(seenKey(data.revealedAt), '1');
              setPlaying(false);
              setCast(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
