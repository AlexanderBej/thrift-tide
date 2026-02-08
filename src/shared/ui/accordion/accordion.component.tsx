import React from 'react';

import { ExpansionPanel } from '../expansion-panel';

import './accordion.styles.scss';
import clsx from 'clsx';

export interface ExpansionPanelItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

interface AccordionProps {
  items: ExpansionPanelItem[];
  type: 'single' | 'multiple';
  defaultOpenIds?: string[]; // for multiple
  defaultOpenId?: string; // for single
  controlledOpenIds?: string[];
  controlledOpenId?: string;
  onChange?: (next: string | string[] | null) => void;
  disabledIds?: string[];
  className?: string;
  spaceLarge?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  type = 'single',
  defaultOpenIds = [],
  defaultOpenId = null,
  controlledOpenIds,
  controlledOpenId,
  onChange,
  disabledIds = [],
  className,
  spaceLarge = false,
}) => {
  const isControlledSingle = controlledOpenId !== undefined;
  const isControlledMultiple = controlledOpenIds !== undefined;

  const [uncontrolledOpenId, setUncontrolledOpenId] = React.useState(defaultOpenId);
  const [uncontrolledOpenIds, setUncontrolledOpenIds] = React.useState(new Set(defaultOpenIds));

  const disabledSet = React.useMemo(() => new Set(disabledIds), [disabledIds]);

  const getIsOpen = (id: string) => {
    if (type === 'single') {
      const openId = isControlledSingle ? controlledOpenId : uncontrolledOpenId;
      return openId === id;
    }
    const openSet = isControlledMultiple ? new Set(controlledOpenIds) : uncontrolledOpenIds;
    return openSet.has(id);
  };

  const setOpen = (id: string, nextOpen: boolean) => {
    if (disabledSet.has(id)) return;

    if (type === 'single') {
      const nextId = nextOpen ? id : null;
      if (!isControlledSingle) setUncontrolledOpenId(nextId);
      onChange?.(nextId);
      return;
    }

    // multiple
    const current = isControlledMultiple
      ? new Set(controlledOpenIds)
      : new Set(uncontrolledOpenIds);
    if (nextOpen) current.add(id);
    else current.delete(id);

    if (!isControlledMultiple) setUncontrolledOpenIds(current);
    onChange?.(Array.from(current));
  };

  return (
    <div className={className}>
      {items.map((it, index) => (
        <div key={index} className={clsx('panel', { large: spaceLarge })}>
          <ExpansionPanel
            key={it.id}
            title={it.title}
            controlledOpen={getIsOpen(it.id)}
            onOpenChange={(next) => setOpen(it.id, next)}
            disabled={disabledSet.has(it.id)}
          >
            {it.content}
          </ExpansionPanel>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
