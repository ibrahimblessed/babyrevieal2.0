import { useState } from 'react';
import { motion } from 'framer-motion';
import { GUESS_KEY, lsGet, lsSet } from '../lib/storage';
import type { Result } from '../types';

export function getGuess(): Result | null {
  const v = lsGet(GUESS_KEY);
  return v === 'boy' || v === 'girl' ? v : null;
}

/** Lets each visitor pick a team. Stays on their device only. */
export default function TeamPicker() {
  const [g, setG] = useState<Result | null>(getGuess);

  const pick = (r: Result) => {
    const next = g === r ? null : r;
    setG(next);
    lsSet(GUESS_KEY, next ?? '');
  };

  return (
    <div className="teams">
      <p className="teams-t">{g ? `You are Team ${g === 'boy' ? 'Boy' : 'Girl'}` : 'Pick your team'}</p>
      <div className="teams-row" role="group" aria-label="Your guess">
        {(['boy', 'girl'] as const).map((r) => (
          <motion.button
            key={r}
            type="button"
            className={`team ${r}${g === r ? ' sel' : ''}`}
            aria-pressed={g === r}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            animate={g === r ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
            onClick={() => pick(r)}
          >
            {r === 'boy' ? 'Team Boy' : 'Team Girl'}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
