import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

type Options = {
  enabled?: boolean;
  hideOffset?: number;
  revealDelta?: number;
};

export function useHideOnScroll(
  scrollRef: RefObject<HTMLElement | null>,
  { enabled = true, hideOffset = 64, revealDelta = 16 }: Options = {},
) {
  const [hidden, setHidden] = useState(false);

  const lastY = useRef(0);
  const direction = useRef<'up' | 'down' | null>(null);
  const accumulatedDistance = useRef(0);
  const frame = useRef<number | null>(null);

  const forceShow = useCallback(() => {
    setHidden(false);
    direction.current = null;
    accumulatedDistance.current = 0;
  }, []);

  useEffect(() => {
    const element = scrollRef.current;

    if (!enabled || !element) {
      forceShow();
      return;
    }

    lastY.current = Math.max(0, element.scrollTop);

    const handleScroll = () => {
      if (frame.current !== null) return;

      frame.current = window.requestAnimationFrame(() => {
        const y = Math.max(0, element.scrollTop);
        const delta = y - lastY.current;

        lastY.current = y;
        frame.current = null;

        if (y <= hideOffset) {
          forceShow();
          return;
        }

        if (delta === 0) return;

        const nextDirection = delta > 0 ? 'down' : 'up';

        if (nextDirection !== direction.current) {
          direction.current = nextDirection;
          accumulatedDistance.current = 0;
        }

        accumulatedDistance.current += Math.abs(delta);

        if (accumulatedDistance.current < revealDelta) return;

        setHidden(nextDirection === 'down');
        accumulatedDistance.current = 0;
      });
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);

      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
      }
    };
  }, [enabled, forceShow, hideOffset, revealDelta, scrollRef]);

  return {
    hidden,
    forceShow,
  };
}
