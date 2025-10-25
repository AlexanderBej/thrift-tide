import React, { useRef, useLayoutEffect } from 'react';

const AutoResizeTextarea: React.FC<{
  value: string;
  [key: string]: any;
}> = ({ value, ...otherProps }) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  // After each render where `value` changed, adjust height
  useLayoutEffect(() => {
    const ta = ref.current;
    if (!ta) {
      return;
    }
    ta.style.height = 'auto'; // reset
    ta.style.height = ta.scrollHeight + 'px'; // expand
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      {...otherProps}
      style={{
        minHeight: '75px',
        width: '100%',
        resize: 'none', // disable manual resize handle
        overflow: 'hidden', // hide scrollbar
      }}
    />
  );
};

export default AutoResizeTextarea;
