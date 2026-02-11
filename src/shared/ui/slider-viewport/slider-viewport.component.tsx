import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import './slider-viewport.styles.scss';

type Easing = string;

interface SliderViewportProps {
  /** Which panel is active (0..n-1) */
  activeIndex: number;

  /** Panels */
  children: React.ReactNode[];

  /** Animate container height to match active panel */
  animateHeight?: boolean;

  /** Height to use before first measure (prevents jump) */
  initialHeight?: number;

  /** Enable/disable overflow clipping in viewport */
  overflowHidden?: boolean;

  /** px gap between panels if you want it */
  gapPx?: number;

  /** Animation config */
  durationMs?: number;
  easing?: Easing;

  /** Class names */
  className?: string;
  viewportClassName?: string;
  sliderClassName?: string;
  panelClassName?: string;
}
const SliderViewport: React.FC<SliderViewportProps> = ({
  activeIndex,
  children,
  animateHeight = true,
  initialHeight = 0,
  overflowHidden = true,
  gapPx = 0,
  durationMs = 240,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  className,
  viewportClassName,
  sliderClassName,
  panelClassName,
}) => {
  const panelsRef = useRef<Array<HTMLDivElement | null>>([]);
  const roRef = useRef<ResizeObserver | null>(null);
  const rafRef = useRef<number | null>(null);

  const [height, setHeight] = useState<number>(initialHeight);

  const count = children.length;

  // clamp to valid range (prevents transform weirdness)
  const idx = Math.min(Math.max(activeIndex, 0), Math.max(count - 1, 0));

  const transform = useMemo(() => `translate3d(${-idx * 100}%, 0, 0)`, [idx]);

  const measureActive = useCallback(() => {
    const el = panelsRef.current[idx];
    if (!el) return;

    // measure in rAF to avoid forced sync layout during transitions
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      if (h > 0) setHeight(h);
    });
  }, [idx]);

  useLayoutEffect(() => {
    if (!animateHeight) return;

    // disconnect any previous observer
    roRef.current?.disconnect();
    roRef.current = null;

    const el = panelsRef.current[idx];
    if (!el) {
      // panel ref may not be set yet; try next frame
      measureActive();
      return;
    }

    // initial measure
    measureActive();

    // observe active panel only (nest-safe, less work)
    const ro = new ResizeObserver(() => measureActive());
    ro.observe(el);
    roRef.current = ro;

    return () => {
      ro.disconnect();
      roRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [animateHeight, idx, measureActive]);

  const setPanelRef = useCallback(
    (i: number) => (node: HTMLDivElement | null) => {
      panelsRef.current[i] = node;

      // if this panel is active, measure immediately once the ref appears
      if (animateHeight && i === idx && node) {
        const h = Math.ceil(node.getBoundingClientRect().height);
        if (h > 0) setHeight(h);
      }
    },
    [animateHeight, idx],
  );

  return (
    <div className={clsx('sv-root', className)}>
      <div
        className={clsx('sv-viewport', viewportClassName)}
        style={{
          overflow: overflowHidden ? 'hidden' : 'visible',
          height: animateHeight ? height || initialHeight || 'auto' : 'auto',
          transition: animateHeight ? `height ${durationMs}ms ${easing}` : undefined,
          willChange: animateHeight ? 'height' : undefined,
        }}
      >
        <div
          className={clsx('sv-slider', sliderClassName)}
          style={{
            transform,
            transition: `transform ${durationMs}ms ${easing}`,
            willChange: 'transform',
            gap: gapPx ? `${gapPx}px` : undefined,
          }}
        >
          {children.map((child, i) => (
            <div key={i} ref={setPanelRef(i)} className={clsx('sv-panel', panelClassName)}>
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SliderViewport;
