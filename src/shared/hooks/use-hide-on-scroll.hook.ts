import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type Options = {
  enabled?: boolean; // if false, hook is a no-op
  target?: HTMLElement | Window | null;
  hideOffset?: number; // start allowing hide after this Y
  condenseAt?: number; // condense row1 after this Y
  elevateAt?: number; // add shadow after this Y
  revealDelta?: number; // min delta to toggle hidden/revealed
  defaults?: { hidden: boolean; condensed: boolean; elevated: boolean }; // states when disabled
};

export function useHideOnScroll({
  enabled = true,
  target = typeof window !== 'undefined' ? window : null,
  hideOffset = 80,
  condenseAt = 120,
  elevateAt = 8,
  revealDelta = 24,
  defaults = { hidden: false, condensed: false, elevated: false },
}: Options = {}) {
  const [hidden, setHidden] = useState(defaults.hidden);
  const [condensed, setCondensed] = useState(defaults.condensed);
  const [elevated, setElevated] = useState(defaults.elevated);

  const lastY = useRef(0);
  const ticking = useRef(false);

  const getY = (t: Options['target']) =>
    !t ? 0 : t === window ? window.scrollY || 0 : (t as HTMLElement).scrollTop || 0;

  useLayoutEffect(() => {
    if (!enabled || !target) {
      setHidden(defaults.hidden);
      setCondensed(defaults.condensed);
      setElevated(defaults.elevated);
      return;
    }
    const y = getY(target);
    lastY.current = y;
    setElevated(y > elevateAt);
    setCondensed(y > condenseAt);
    setHidden(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, target]);

  useEffect(() => {
    if (!enabled || !target) return;

    const onScroll = () => {
      const y = getY(target);
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const delta = y - lastY.current;
        const movedEnough = Math.abs(delta) > revealDelta;
        const goingDown = delta > 0;

        setElevated(y > elevateAt);
        setCondensed(y > condenseAt);

        if (y > hideOffset && movedEnough) setHidden(goingDown);
        else if (movedEnough) setHidden(false);

        lastY.current = y;
        ticking.current = false;
      });
    };

    const el: any = target === window ? window : target;
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [enabled, target, hideOffset, condenseAt, elevateAt, revealDelta]);

  return { hidden, condensed, elevated };
}
