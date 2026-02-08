import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
// import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { FaChevronDown } from 'react-icons/fa';

import { selectBucketHealthSummary } from '@store/budget-store';
import { TTIcon } from '@shared/ui';
import { getCssVar } from '@shared/utils';
import { SmartInsightChip } from 'features/insights';

import './buckets-health.styles.scss';

const BucketsHealth: React.FC = () => {
  // const { t } = useTranslation('budget');
  const { attentionCount, details, healthyCount } = useSelector(selectBucketHealthSummary);

  const [open, setOpen] = useState(false);

  const contentId = useId();
  const buttonId = useId();

  const contentInnerRef = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState(0);

  useLayoutEffect(() => {
    if (!contentInnerRef.current) return;
    if (open) {
      setMaxH(contentInnerRef.current.scrollHeight);
    } else {
      setMaxH(0);
    }
  }, [open]);

  // keep it correct if layout changes (fonts/resize)
  useEffect(() => {
    if (!contentInnerRef.current) return;
    const el = contentInnerRef.current;

    const ro = new ResizeObserver(() => {
      if (open) setMaxH(el.scrollHeight);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  return (
    <div className="buckets-health">
      <div className="buckets-health-line">
        {healthyCount > 0 && (
          <div className="health-info healthy-info">
            <div className="bullet" />
            <span>{healthyCount} buckets healthy</span>
          </div>
        )}
        {attentionCount > 0 && (
          <div className="health-info attention-info">
            <div className="bullet" />
            <span>
              {attentionCount} buckets {attentionCount === 1 ? 'needs' : 'need'} attention
            </span>
            <button
              id={buttonId}
              aria-controls={contentId}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="open-details-btn"
            >
              <TTIcon
                icon={FaChevronDown}
                size={12}
                color={getCssVar('--warning')}
                className={clsx({ 'is-open': open })}
              />
            </button>
          </div>
        )}
      </div>
      <div
        className="health-details-container"
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        style={{ maxHeight: maxH }}
      >
        <div ref={contentInnerRef} className="health-details-contentInner">
          {details
            .filter((det) => det.tone === 'danger' || det.tone === 'warn')
            .map((detail, index) => (
              <SmartInsightChip key={index} insight={detail.insight} showCta={false} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default BucketsHealth;
