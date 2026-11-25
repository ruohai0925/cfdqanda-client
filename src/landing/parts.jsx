import { createElement, useEffect, useState } from 'react';
import { useInView } from './useInView';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function Reveal({ as = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, seen] = useInView(0.15);
  return createElement(as, {
    ref, className: `lp-reveal ${seen ? 'is-in' : ''} ${className}`, style: { transitionDelay: `${delay}ms` }, ...rest,
  }, children);
}

// Counts from 0 to `value` once visible. `decimals` keeps the source precision.
export function CountUp({ value, decimals = 0, suffix = '', duration = 1400 }) {
  const [ref, seen] = useInView(0.4);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!seen) return undefined;
    if (reducedMotion()) { setShown(value); return undefined; }
    let raf = 0; const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / duration);
      setShown(value * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value, duration]);
  return <span ref={ref}>{shown.toFixed(decimals)}{suffix}</span>;
}

export function LangToggle({ language, setLanguage }) {
  return (
    <div className="lp-lang" role="group" aria-label="Language">
      {['zh', 'en'].map((l) => (
        <button key={l} type="button" aria-pressed={language === l} onClick={() => setLanguage(l)}>
          {l === 'zh' ? '中' : 'EN'}
        </button>
      ))}
    </div>
  );
}
