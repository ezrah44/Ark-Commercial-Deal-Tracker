import { useEffect, useRef, useState } from "react";

// Smoothly animates a number from its previous value to a new one.
export function useCountUp(value: number, duration = 700) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const frame = useRef<number>();

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();

    cancelAnimationFrame(frame.current!);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        prev.current = to;
      }
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current!);
  }, [value, duration]);

  return display;
}
