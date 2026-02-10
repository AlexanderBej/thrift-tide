import React, { forwardRef, useImperativeHandle } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

import './swipe-row.styles.scss';

export type SwipeRowHandle = {
  close: () => void;
  open: (px?: number) => void;
};

type SwipeRowProps = {
  children: React.ReactNode;

  onEdit?: () => void;
  onDelete?: () => void;
  onSwipeStart?: () => void;
};

const SwipeRow = forwardRef<SwipeRowHandle, SwipeRowProps>(
  ({ children, onEdit, onDelete, onSwipeStart }, ref) => {
    const x = useMotionValue(0);

    const actionsOpacity = useTransform(x, [-90, -20, 0], [1, 0.4, 0]);

    useImperativeHandle(ref, () => ({
      close: () => {
        return animate(x, 0, { type: 'spring', stiffness: 420, damping: 32 });
      },
      open: (px = 160) => animate(x, -px, { type: 'spring', stiffness: 420, damping: 32 }),
    }), [x]);
    return (
      <div className="swipe-row">
        {/* BACK LAYER (ACTIONS) */}
        <div className="swipe-row-actions">
          <motion.div className="swipe-row-actionsInner" style={{ opacity: actionsOpacity }}>
            <button className="swipe-btn swipe-btn__edit" onClick={onEdit} type="button">
              Edit
            </button>
            <button className="swipe-btn swipe-btn__delete" onClick={onDelete} type="button">
              Delete
            </button>
          </motion.div>
        </div>

        {/* FRONT LAYER (CONTENT) */}
        <motion.div
          className="swipe-row-content"
          drag="x"
          dragConstraints={{ left: -160, right: 0 }}
          dragElastic={0.08}
          onDragStart={onSwipeStart}
          style={{ x }}
        >
          {children}
        </motion.div>
      </div>
    );
  },
);

export default SwipeRow;
