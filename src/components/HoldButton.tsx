import { useRef, useState, type KeyboardEvent } from 'react';
import { useRaf } from '../hooks/useRaf';

interface Props {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
  /** How long the button must be held, in ms. */
  ms?: number;
  tone?: 'boy' | 'girl' | 'neutral' | 'danger';
}

/** A button you have to press and hold. Prevents accidental reveals. Works with pointer and keyboard. */
export default function HoldButton({ label, onConfirm, disabled, ms = 1500, tone = 'neutral' }: Props) {
  const [p, setP] = useState(0);
  const [holding, setHolding] = useState(false);
  const start = useRef(0);
  const fired = useRef(false);

  const begin = () => {
    if (disabled || holding) return;
    fired.current = false;
    start.current = performance.now();
    setHolding(true);
  };
  const end = () => {
    setHolding(false);
    if (!fired.current) setP(0);
  };

  useRaf(() => {
    const pr = Math.min(1, (performance.now() - start.current) / ms);
    setP(pr);
    if (pr >= 1 && !fired.current) {
      fired.current = true;
      setHolding(false);
      setP(0);
      onConfirm();
    }
  }, holding);

  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      begin();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') end();
  };

  return (
    <button
      type="button"
      className={`hold ${tone}${holding ? ' on' : ''}`}
      disabled={disabled}
      onPointerDown={begin}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerCancel={end}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="hold-fill" style={{ transform: `scaleX(${p})` }} />
      <span className="hold-txt">{holding ? 'Keep holding…' : label}</span>
    </button>
  );
}
