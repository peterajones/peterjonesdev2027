import { useEffect, useRef, useState } from 'react';

type SlideState = 'idle' | 'enter' | 'exit';

interface Slide {
  key: number;
  value: number;
  state: SlideState;
  active: boolean;
}

// Matches the 0.25s CSS transition in _rollup-counter.scss, plus a small buffer.
const TRANSITION_DURATION = 300;

export default function Counter() {
  const [count, setCount] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([
    { key: 0, value: 0, state: 'idle', active: false },
  ]);
  const [generation, setGeneration] = useState(0);
  const nextKey = useRef(1);

  const change = (value: number) => {
    if (value === count) return;
    setCount(value);
    setSlides((prev) => [
      ...prev.map((s) => ({ ...s, state: 'exit' as const, active: false })),
      { key: nextKey.current++, value, state: 'enter' as const, active: false },
    ]);
    setGeneration((g) => g + 1);
  };

  // One enter/exit animation per user action: activate the enter/exit classes
  // on the next frame (so the browser sees the initial state first), then
  // drop the exiting slide once the CSS transition has finished.
  useEffect(() => {
    if (generation === 0) return;

    const raf = requestAnimationFrame(() => {
      setSlides((prev) => prev.map((s) => (s.state === 'idle' ? s : { ...s, active: true })));
    });

    const timer = setTimeout(() => {
      setSlides((prev) =>
        prev.filter((s) => s.state !== 'exit').map((s) => ({ ...s, state: 'idle', active: false }))
      );
    }, TRANSITION_DURATION);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [generation]);

  const classNameFor = (s: Slide) => {
    if (s.state === 'idle') return undefined;
    return s.active ? `count-${s.state} count-${s.state}-active` : `count-${s.state}`;
  };

  return (
    <>
      <h1>Rollup Counter</h1>
      <span className="count">
        {slides.map((s) => (
          <span key={s.key} className={classNameFor(s)}>
            {s.value}
          </span>
        ))}
      </span>
      <div className="buttons">
        <button id="reset" onClick={() => change(0)}>
          Reset
        </button>
        <button id="increment" onClick={() => change(count + 1)}>
          Increment
        </button>
      </div>
    </>
  );
}
